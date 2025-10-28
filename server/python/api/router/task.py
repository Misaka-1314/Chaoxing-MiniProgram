from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Request
from Crypto.PublicKey import RSA
from pydantic import BaseModel
from zoneinfo import ZoneInfo
import datetime
import asyncio
import httpx
import time
import os

from utils.storage import (
    list_records,
    update_status,
    update_record,
    insert_record,
    count_records,
)
from utils.logger import logging
from const import client

UPLOAD_HOST = os.getenv("UPLOAD_HOST", "")
CALLBACK_SERVER = os.getenv("CALLBACK_SERVER", "")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GITHUB_REPO = os.getenv("GITHUB_REPO", "")
WHITE_APPID = os.getenv("WHITE_APPID", "")
MIN_TIME = 946656000

router = APIRouter()


@router.get("/state", description="获取当前状态")
async def _(
    request: Request,
):
    return {
        "status": 0,
        "data": {
            "ip": request.client.host,  # type: ignore
            "time": int(time.time()),
            **count_records(),
        },
    }


@router.get("/list", description="安全列出所有问卷填写结果")
async def _(
    request: Request,
):
    _list = list_records()
    _list.sort(key=lambda x: x["id"], reverse=True)
    now = int(time.time())
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
                    "delta": now - int(item["upload_at"] or MIN_TIME),
                }
                for item in _list
            ],
        },
        headers={
            "Cache-Control": "public, max-age=15, immutable",
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
        upload_at=None,
    )
    return {
        "status": 0,
        "msg": "已强制重置任务状态" if res else "不存在",
        "data": res,
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


async def _get_updatetime() -> int:
    """获取代码更新时间"""
    while True:
        try:
            resp = await client.get(url=f"{UPLOAD_HOST}/ci/status", timeout=None)
            resp.raise_for_status()
            res: dict = resp.json()
            version: str = res["data"]["version"]
            logging.info(f"获取代码版本号 {version}")
        except Exception as e:
            logging.warning(f"获取版本号失败 {e} {e.__class__.__name__}", exc_info=True)
            await asyncio.sleep(5)
        else:
            parts = version.split(".")
            year, month, day = int(parts[1]), int(parts[2]), int(parts[3])
            dt = datetime.datetime(year, month, day, 23, 59, 59)
            return int(dt.timestamp())


async def _upload(item: dict, task_length: int):
    """向代码上传服务器提交任务"""
    logging.info(
        "{index:04d}/{length} 开始上传 {appid} (上次结果: {result}, 上次上传: {upload_at}, 填写时间: {create_at})".format(
            index=item["task-index"],
            length=task_length,
            appid=item["appid"],
            upload_at=datetime.datetime.fromtimestamp(
                item["upload_at"], ZoneInfo("Asia/Shanghai")
            ).strftime(r"%Y-%m-%d %H:%M")
            if item["upload_at"]
            else "None",
            create_at=datetime.datetime.fromtimestamp(
                item["create_at"], ZoneInfo("Asia/Shanghai")
            ).strftime(r"%Y-%m-%d %H:%M"),
            result=item["status"] or "None",
        )
    )
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
            resp = await client.post(
                url="{host}/ci/upload".format(host=UPLOAD_HOST),
                timeout=10.0,
                data=body,
            )
            res: dict = resp.json()
        except (
            httpx.ConnectError,
            httpx.ReadTimeout,
            httpx.WriteTimeout,
            httpx.RemoteProtocolError,
        ):
            continue
        except Exception as e:
            logging.warning(
                f"上传请求失败 {item['appid']} {e.__class__.__name__}", exc_info=True
            )
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
                if (now - begin).seconds > 2 * 60:  # 超时
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
        _list1: list[dict] = list_records()
        # 过滤空数据
        _list2 = [x for x in _list1 if x]
        # 获取代码更新时间
        _updatetime = await _get_updatetime()
        # 过滤已完成更新（上传成功且上传时间大于代码更新时间）的任务
        _list3 = [
            x
            for x in _list2
            if not ("成功" in (x["status"] or "") and x["upload_at"] > _updatetime)
        ]
        # 过滤失败频繁（48小时内失败过）的任务
        _list = [
            x
            for x in _list3
            if not (
                "失败" in (x["status"] or "")
                and x["upload_at"] + 3600 * 48 > time.time()
            )
        ]
        # 任务排序
        _list.sort(
            key=lambda x: (
                x["status"] in ["上传中"],  # 1st优先：上传中的
                x["appid"] in (WHITE_APPID or "").split(","),  # 2nd优先：白名单
                not (x["upload_at"] and x["status"]),  # 3rd优先：没有上传记录的
                "成功" in (x["status"] or ""),  # 4th优先：成功上传过的
                x["upload_at"] or MIN_TIME,  # 5th优先：上传时间久远的
            ),
            reverse=True,
        )
        logging.info(
            f"当前任务总数 {len(_list2)}，未完成任务数 {len(_list3)}，本轮处理任务数 {len(_list)}"
        )

        async def _upload_task(_list):
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
                    update_status(
                        id=item["id"], status="校验失败，代码上传密钥明细错误"
                    )
                    continue
                item["key"] = _handle_key(item)
                if not item["key"]:
                    update_status(id=item["id"], status="校验失败，无效的代码上传密钥")
                    continue

                await _auth_check(item)

                try:
                    await asyncio.wait_for(_upload(item, len(_list)), timeout=3 * 60)
                except asyncio.TimeoutError:
                    continue

        try:
            await asyncio.wait_for(_upload_task(_list), timeout=3 * 3600)
        except asyncio.TimeoutError:
            logging.info("任务处理超时，重新拉取任务")
        else:
            logging.info("任务处理完成")

    while True:
        try:
            await _task()
        except Exception as e:
            logging.warning(f"任务处理异常 {e} {e.__class__.__name__}", exc_info=True)
        else:
            await asyncio.sleep(30)
