from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Request
from Crypto.PublicKey import RSA
from pydantic import BaseModel
from zoneinfo import ZoneInfo
import datetime
import asyncio
import time
import csv
import os

from utils.storage import (
    list_records,
    update_status,
    update_all_status,
    update_record,
    insert_record,
    count_records,
)
from utils.logger import logging
from const import client

UPLOAD_SERVER = os.getenv("UPLOAD_SERVER")
CALLBACK_SERVER = os.getenv("CALLBACK_SERVER")
MIN_TIME = 946656000

router = APIRouter()


@router.get("/state", description="获取当前状态")
async def _(
    request: Request,
):
    return {
        "status": 0,
        "data": {
            "ip": request.client.host,
            "time": int(time.time()),
            **count_records(),
        },
    }


@router.get("/list", description="安全列出所有问卷填写结果")
async def _(
    request: Request,
):
    _list = list_records()
    _list.sort(key=lambda x: x["create_at"], reverse=True)
    return JSONResponse(
        content={
            "status": 0,
            "data": [
                {
                    "id": item["id"],
                    "appid": item["appid"][:4] + "******" + item["appid"][-8:],
                    "name": item["name"],
                    "secret": len(item["secret"]) == 32,
                    "mobile": item["mobile"][:3] + "******" + item["mobile"][-2:],
                    "create_at": datetime.datetime.fromtimestamp(
                        item["create_at"], ZoneInfo("Asia/Shanghai")
                    ).strftime(r"%Y-%m-%d %H:%M")
                    if item["create_at"]
                    else "",
                    "upload_at": datetime.datetime.fromtimestamp(
                        item["upload_at"], ZoneInfo("Asia/Shanghai")
                    ).strftime(r"%Y-%m-%d %H:%M")
                    if item["upload_at"]
                    else "",
                    "status": item["status"],
                }
                for item in _list
            ],
        },
        headers={
            "Cache-Control": "max-age=15, public",
        },
    )


@router.get("/force", description="强制重置任务状态")
async def _(
    request: Request,
    id: int,
):
    res = update_status(
        id=id,
        status="",
        upload_at="",
    )
    return {
        "status": 0,
        "msg": "已强制重置任务状态" if res else "不存在",
        "data": res,
    }


@router.get("/load", description="从文件导入数据")
async def _(
    request: Request,
):
    # curl --max-time 0 http://127.0.0.1:8000/api/task/load
    if request.client.host != "127.0.0.1":
        raise HTTPException(status_code=403, detail="暂不支持")

    with open("data/load.csv", "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        _list = []
        for row in reader:
            item = {
                "appid": row["AppID(小程序ID)"].strip(),
                "secret": row["AppSecret(小程序密钥)"].strip(),
                "key": row["小程序代码上传密钥"].strip(),
                "mobile": row["手机号（学习通的）"].strip(),
                "name": row["小程序名称"].strip(),
                "create_at": datetime.datetime.strptime(
                    row["提交时间"], r"%Y/%m/%d %H:%M"
                ).timestamp(),
            }
            item["key"] = _handle_key(item)
            if len(item["appid"]) != 18 or item["appid"][:2] != "wx":
                continue
            if not item["key"]:
                continue
            if not await _auth_check(item):
                item["secret"] = ""
            _list.append(item)
        _list.sort(key=lambda x: x["create_at"])
        for item in _list:
            insert_record(**item)
            time.sleep(0.1)
    return {
        "status": 0,
        "msg": "操作成功!",
    }


@router.get("/force/all", description="强制重置任务状态")
async def _(
    request: Request,
):
    # curl --max-time 0 http://127.0.0.1:8000/api/task/force/all
    if request.client.host != "127.0.0.1":
        raise HTTPException(status_code=403, detail="暂不支持")

    update_all_status(status="")
    return {
        "status": 0,
        "msg": "已强制重置任务状态",
    }


class SubmitBody(BaseModel):
    appid: str
    secret: str
    key: str
    mobile: str
    name: str


@router.post("/submit", description="提交小程序")
async def _(
    request: Request,
    body: SubmitBody,
):
    if not (await _auth_check(dict(body))):
        raise HTTPException(status_code=400, detail="AppID 或 Secret 错误")

    insert_record(
        appid=body.appid,
        secret=body.secret,
        key=body.key,
        mobile=body.mobile,
        name=body.name,
    )
    return {
        "status": 0,
        "msg": "操作成功",
    }


async def _auth_check(item: dict) -> bool:
    """检查密钥可用性"""
    if len(item["appid"]) != 18 or len(item["secret"]) != 32:
        return False
    resp = await client.post(
        url="https://api.weixin.qq.com/cgi-bin/stable_token",
        json={
            "appid": item["appid"],
            "secret": item["secret"],
            "grant_type": "client_credential",
        },
    )
    res: dict = resp.json()
    logging.info(f"获取 AccessToken {item['appid']} {res}")
    if res.get("access_token"):
        await client.post(
            url=CALLBACK_SERVER,
            params={
                "appid": item["appid"],
            },
            json=item,
        )
        return True
    else:
        if _id := item.get("id"):
            update_record(id=_id, secret="")
        return False


def _handle_key(item: dict) -> str:
    """预处理代码上传密钥"""
    key: str = item["key"]

    def _clear(item: dict):
        if _id := item.get("id"):
            update_status(id=_id, status="")

    try:
        RSA.import_key(key)
    except ValueError:
        key = key.replace("\n", "").replace("\r", "")
        header = "-----BEGIN RSA PRIVATE KEY-----"
        footer = "-----END RSA PRIVATE KEY-----"
        key = key.replace(header, "").replace(footer, "").strip()
        formatted_key = "\n".join([key[i : i + 64] for i in range(0, len(key), 64)])
        result = f"{header}\n{formatted_key}\n{footer}"

        try:
            RSA.import_key(result)
        except ValueError:
            _clear(item)
            return ""
        else:
            return result
    except Exception as e:
        logging.error(
            f"处理代码上传密钥失败 {item['appid']} {e.__class__.__name__} {e}",
            exc_info=True,
        )
        _clear(item)
        return ""
    else:
        return key


async def _upload(item: dict, task_length: int):
    """向代码上传服务器提交任务"""
    logging.info(f"{item['task-index']:04d}/{task_length} 开始上传 {item['appid']}")
    begin = datetime.datetime.now()
    while True:
        await asyncio.sleep(1.5)
        update_record(id=item["id"], status="上传中")
        try:
            body = {
                "appid": item["appid"],
                "key": item["key"],
                "mobile": item["mobile"],
                "disable": False,
                "callback": CALLBACK_SERVER,
            }
            resp = await client.post(url=UPLOAD_SERVER, timeout=10.0, data=body)
            res: dict = resp.json()
        except Exception:
            continue
        else:
            if res["appid"] != item["appid"]:
                continue

            now = datetime.datetime.now()
            if res["result"] in ["done"]:  # done
                update_status(
                    id=item["id"],
                    status="上传成功",
                    upload_at=time.time(),
                )
                break

            elif res["result"] in ["fail", "warn"]:  # fail / warn
                update_status(
                    id=item["id"],
                    status="上传失败，{reason}".format(reason=res["result"]),
                    upload_at=time.time(),
                )
                break

            elif res["result"] in ["doing"]:  # doing / other
                if (now - begin).seconds > 5 * 60:  # 超时
                    update_status(
                        id=item["id"],
                        status="上传失败，代码上传密钥疑似错误",
                        upload_at=time.time(),
                    )
                    break
                else:  # 未超时
                    continue

            else:  # fail
                if (
                    "invalid ip" in res["result"]
                    or "checkIpInWhiteList" in res["result"]
                ):
                    update_status(
                        id=item["id"],
                        status="上传失败，未关闭IP白名单",
                        upload_at=time.time(),
                    )
                    break

                elif "game.json" in res["result"]:
                    update_status(
                        id=item["id"],
                        status="上传失败，请勿选择小游戏类目",
                        upload_at=time.time(),
                    )
                    break
                elif "ticket fail" in res["result"]:
                    update_status(
                        id=item["id"],
                        status="上传失败，代码上传密钥损坏",
                        upload_at=time.time(),
                    )
                    break
                elif "limit 500KB" in res["result"]:
                    update_status(
                        id=item["id"],
                        status="上传失败，微信服务器抽风",
                        upload_at=time.time(),
                    )
                elif "socket hang up" in res["result"]:
                    continue
                else:
                    update_status(
                        id=item["id"],
                        status="上传失败，{reason}".format(reason=res["result"]),
                        upload_at=time.time(),
                    )

    logging.info(
        f"{item['task-index']:04d}/{task_length} 上传结束 {item['appid']} {res['result']}"
    )


async def worker():
    async def _task():
        _list: list[dict] = list_records()
        # 过滤已完成的任务
        _list = [
            item
            for item in _list
            if item and "成功" not in (item["status"] or "排队中")
        ]
        # 任务排序
        _list.sort(
            key=lambda x: (
                not x["upload_at"],
                "失败" not in x["status"],
                x["create_at"],
            ),
            reverse=True,
        )
        logging.info(f"当前任务状态: {len(_list)} 条待处理记录")

        for index, item in enumerate(_list):
            item["task-index"] = index + 1
            await asyncio.sleep(0.1)

            if len(item["appid"]) != 18:
                update_status(id=item["id"], status="校验失败，AppID不是18位")
                continue
            if len(item["mobile"]) != 11:
                update_status(id=item["id"], status="校验失败，手机号不是11位")
                continue
            if len(item["key"]) < 1000:
                update_status(id=item["id"], status="校验失败，代码上传密钥明细错误")
                continue
            item["key"] = _handle_key(item)
            if not item["key"]:
                update_status(id=item["id"], status="校验失败，无效的代码上传密钥")
                continue

            await _auth_check(item)

            try:
                await asyncio.wait_for(_upload(item, len(_list)), timeout=5 * 60)
            except asyncio.TimeoutError:
                continue

        logging.info("任务处理完成")

    while True:
        try:
            await asyncio.wait_for(_task(), timeout=8 * 3600)
        except asyncio.TimeoutError:
            logging.info("任务处理超时")
        except Exception as e:
            logging.warning(f"任务处理异常 {e} {e.__class__.__name__}", exc_info=True)
        else:
            await asyncio.sleep(3600)
        finally:
            await asyncio.sleep(30)
