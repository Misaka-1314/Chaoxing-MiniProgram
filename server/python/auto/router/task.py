from typing import Optional
import asyncio
import json
import os

from utils import storage


async def worker():
    """后台任务"""
    cursor = storage.conn.execute("SELECT uid, userinfo FROM user WHERE flag=0")
    for row in cursor.fetchall():
        uid = row["uid"]
        userinfo = json.loads(row["userinfo"])

        print("启动监控", uid)
        process = await asyncio.create_subprocess_exec(
            "node",
            "im/monitor.js",
            str(uid),
            str(userinfo["accountInfo"]["imAccount"]["username"]),
            str(userinfo["accountInfo"]["imAccount"]["password"]),
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
            cwd=os.getcwd(),
        )
        if process.returncode is None:
            print("启动监控成功", uid, process.pid)
        else:
            print("启动监控失败", uid, process.returncode)


async def sign(
    uid: int,
    activeId: int,
    classId: Optional[int] = None,
    courseId: Optional[int] = None,
):
    """执行签到任务"""
