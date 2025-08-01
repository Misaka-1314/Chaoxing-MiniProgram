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
    return {
        "status": 0,
        "msg": "ok",
        "data": {
            "ip": request.client.host,
        },
    }


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
            "Access-Control-Allow-Origin": request.headers.get("Origin", "*"),
        },
    )
    for cookie in resp.cookies:
        response.set_cookie(
            key=cookie,
            value=resp.cookies[cookie],
            httponly=True,
            secure=False,
            samesite="lax",
            expires=int(time.time() + 3600 * 24),
        )
    return response


@router.get("/courses")
async def _(
    request: Request,
):
    resp = await client.get(
        url="https://mooc1-api.chaoxing.com/mycourse/backclazzdata",
        params={
            "view": "json",
            "rss": "1",
        },
        cookies=dict(request.cookies),
    )
    return resp.json()


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
