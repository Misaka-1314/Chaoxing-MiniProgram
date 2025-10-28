from typing import Optional, Any
import sqlite3
import pathlib
import time

pathlib.Path("data").mkdir(exist_ok=True)
conn = sqlite3.connect("data/main.db")
conn.row_factory = sqlite3.Row


def init():
    """初始化数据库表"""
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS miniprogram (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            appid TEXT NOT NULL UNIQUE,
            secret TEXT NOT NULL,
            key TEXT NOT NULL,
            mobile TEXT NOT NULL,
            name TEXT,
            create_at TIMESTAMP,
            upload_at TIMESTAMP,
            status TEXT
        )
    """)
    conn.commit()


def insert_record(
    appid: str,
    secret: str,
    key: str,
    mobile: str,
    name: str,
    create_at: float = time.time(),
    upload_at: Optional[float] = None,
    status: Optional[str] = None,
):
    """插入小程序信息，重复则更新"""
    assert len(appid) == 18 and appid.startswith("wx"), "AppID 格式错误"
    assert len(key) > 1000, "代码上传密钥格式错误"

    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO miniprogram (appid, secret, key, mobile, name, create_at, upload_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(appid) DO UPDATE SET
            secret = excluded.secret,
            key = excluded.key,
            mobile = excluded.mobile,
            name = excluded.name,
            create_at = excluded.create_at,
            upload_at = excluded.upload_at,
            status = excluded.status
    """,
        (appid, secret, key, mobile, name, create_at, upload_at, status),
    )
    conn.commit()


def update_record(
    id: Optional[int] = None,
    appid: Optional[str] = None,
    **kwargs: Any,
) -> bool:
    """更新小程序信息"""
    assert id or appid, "参数错误"
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id, appid, secret, key, mobile, name, create_at, upload_at, status
        FROM miniprogram WHERE id=? OR appid=?
    """,
        (id, appid),
    )
    row = cursor.fetchone()
    if not row:
        return False

    cursor.execute(
        """
        UPDATE miniprogram SET
            secret = ?,
            key = ?,
            mobile = ?,
            name = ?,
            create_at = ?,
            upload_at = ?,
            status = ?
        WHERE id=? OR appid=?
        """,
        (
            kwargs.get("secret", row["secret"]),
            kwargs.get("key", row["key"]),
            kwargs.get("mobile", row["mobile"]),
            kwargs.get("name", row["name"]),
            kwargs.get("create_at", row["create_at"]),
            kwargs.get("upload_at", row["upload_at"]),
            kwargs.get("status", row["status"]),
            id,
            appid,
        ),
    )
    conn.commit()
    return True


def update_status(
    status: str,
    upload_at: Optional[float] = time.time(),
    id: Optional[int] = None,
    appid: Optional[str] = None,
    **kwargs: Any,
) -> bool:
    """更新小程序上传状态"""
    return update_record(
        id=id,
        appid=appid,
        upload_at=upload_at,
        status=status,
        **kwargs,
    )


def list_records() -> list[dict]:
    """列出所有小程序信息"""
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM miniprogram")
    rows = cursor.fetchall()
    return [dict(item) for item in rows]


def update_all_status(status: str) -> None:
    """修改所有记录"""
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE miniprogram SET status=?
    """,
        (status,),
    )


def count_records() -> dict:
    """统计数量"""
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM miniprogram;")
    all_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM miniprogram WHERE status like '%成功%';")
    success_count = cursor.fetchone()[0]
    return {
        "总数": all_count,
        "成功": success_count,
    }


init()
