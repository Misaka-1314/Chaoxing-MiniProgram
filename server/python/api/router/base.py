from fastapi import HTTPException, Request, APIRouter
from fastapi.responses import Response, JSONResponse
from typing import Dict
import httpx
import time


from utils import captcha
from const import client


router = APIRouter()
cookies: Dict[int, httpx.Cookies] = {}


@router.get("/state")
async def _(
    request: Request,
) -> Response:
    return JSONResponse(
        content={
            "status": 0,
            "msg": "ok",
            "data": {
                "ip": request.client.host,  # type: ignore
            },
        }
    )


@router.get("/login")
async def _(
    request: Request,
    username: int,
    password: str,
):
    global cookies

    resp = await client.get(
        url="https://passport2-api.chaoxing.com/v11/loginregister",
        params={
            "cx_xxt_passport": "json",
            "roleSelect": "true",
            "uname": username,
            "code": password,
            "loginType": "1",
        },
    )
    res: dict = resp.json()
    cookies[username] = resp.cookies

    response = JSONResponse(
        content=res,
        headers={
            "Cache-Control": "private, max-age=3600",
        },
    )
    for cookie in resp.cookies:
        response.set_cookie(
            key=cookie,
            value=resp.cookies[cookie],
            domain=".micono.eu.org",
            httponly=False,
            secure=True,
            samesite="none",
            expires=int(time.time() + 3600 * 24),
        )
    return response


@router.get("/courses")
async def _(
    request: Request,
):
    resp = await client.get(
        url="https://proxy.yangrucheng.top/mooc1-api.chaoxing.com/mycourse/backclazzdata",
        params={
            "view": "json",
            "rss": "1",
            "proxy-area": "cn",
        },
        cookies=dict(request.cookies),
    )
    return Response(
        content=resp.text,
        headers={
            "Cache-Control": "private, max-age=300",
            "Content-Type": "application/json; charset=utf-8",
        },
    )


@router.get("/pan/token")
async def _(
    request: Request,
):
    resp = await client.get(
        url="https://pan-yz.chaoxing.com/api/token/uservalid",
        cookies=dict(request.cookies),
    )
    res: dict = resp.json()
    return JSONResponse(
        content=res
        | {
            "puid": request.cookies.get("UID"),
        },
        headers={
            "Cache-Control": "private, max-age=3600",
            "Access-Control-Allow-Origin": request.headers.get("Origin", "*"),
        },
    )


@router.get("/validate")
async def _():
    for _ in range(5):
        validate = await captcha.resolve()
        if validate:
            return {
                "status": 0,
                "msg": "滑块验证码通过成功",
                "data": {
                    "validate": validate,
                },
            }
    raise HTTPException(status_code=400, detail="滑块验证码通过失败")


@router.get("/weixin/token")
async def _(
    request: Request,
    appid: str,
    secret: str,
):
    resp = await client.post(
        url="https://api.weixin.qq.com/cgi-bin/stable_token",
        json={
            "grant_type": "client_credential",
            "appid": appid,
            "secret": secret,
            "force_refresh": False,
        },
    )
    res: dict = resp.json()
    return JSONResponse(
        content=res,
        headers={
            "Cache-Control": "private, max-age={expires_in}".format(
                expires_in=res.get("expires_in", 3600) - 300,
            ),
        },
    )
