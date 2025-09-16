from fastapi.exceptions import HTTPException


async def resolve() -> str:
    """通过滑块验证码"""
    raise HTTPException(status_code=400, detail="滑块验证码通过失败")
