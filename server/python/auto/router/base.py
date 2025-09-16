from fastapi import HTTPException, Request, APIRouter
from typing import Literal
from pydantic import BaseModel
import json


from utils import storage
from const import client


router = APIRouter()


@router.get("/login")
async def _(
    username: int,
    password: str,
):
    resp1 = await client.get(
        url="https://passport2-api.chaoxing.com/v11/loginregister",
        params={
            "cx_xxt_passport": "json",
            "roleSelect": "true",
            "uname": username,
            "code": password,
            "loginType": "1",
        },
    )
    res1: dict = resp1.json()
    if not res1.get("status"):
        raise HTTPException(status_code=400, detail=res1.get("mes", "登录失败"))

    resp2 = await client.get(
        url="https://sso.chaoxing.com/apis/login/userLogin4Uname.do",
        cookies=resp1.cookies,
    )
    res2: dict = resp2.json()
    userinfo = res2["msg"]

    storage.conn.execute(
        """
        INSERT INTO user (uid, username, password, userinfo, cookies, flag)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(uid) DO UPDATE SET
            username = excluded.username,
            password = excluded.password,
            userinfo = excluded.userinfo,
            cookies  = excluded.cookies,
            flag     = excluded.flag;
        """,
        (
            resp1.cookies.get("UID"),
            username,
            password,
            json.dumps(userinfo),
            json.dumps(dict(resp1.cookies)),
            0,
        ),
    )
    storage.conn.commit()
    return {
        "status": True,
        "userinfo": userinfo,
        "uid": resp1.cookies.get("UID"),
    }


@router.get("/users")
async def _():
    cursor = storage.conn.execute("SELECT uid, username, flag FROM user")
    users = [dict(row) for row in cursor.fetchall()]
    return {
        "status": True,
        "data": users,
    }


@router.delete("/users/{uid}")
async def _(
    uid: int,
):
    cursor = storage.conn.execute("DELETE FROM user WHERE uid = ?", (uid,))
    storage.conn.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=400, detail="用户不存在")
    return {
        "status": True,
    }


class FlagBody(BaseModel):
    flag: Literal[0, 1]


@router.put("/users/{uid}/flag")
async def _(
    uid: int,
    body: FlagBody,
):
    cursor = storage.conn.execute(
        "UPDATE user SET flag = ? WHERE uid = ?", (body.flag, uid)
    )
    storage.conn.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=400, detail="用户不存在")
    return {
        "status": True,
    }


@router.post("/users/{uid}/actives/{activeId}")
async def _(
    request: Request,
    uid: int,
    activeId: int,
    body: dict,
):
    if request.client.host != "127.0.0.1":
        raise HTTPException(status_code=403, detail="非法请求")

    storage.conn.execute(
        "INSERT INTO activity (uid, uid, activeId, result) VALUES (?, ?, ?, ?)",
        (uid, uid, activeId, ""),
    )
    storage.conn.commit()
    return {
        "status": True,
    }


@router.get("/users/{uid}/actives")
async def _(
    uid: int,
):
    cursor = storage.conn.execute(
        "SELECT id, uid, activeId, result FROM activity WHERE uid = ? ORDER BY id DESC LIMIT 20",
        (uid,),
    )
    activities = [dict(row) for row in cursor.fetchall()]
    return {
        "status": True,
        "data": activities,
    }
