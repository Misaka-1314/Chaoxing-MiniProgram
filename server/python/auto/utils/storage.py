import sqlite3
import pathlib

pathlib.Path("data").mkdir(exist_ok=True)
conn = sqlite3.connect("data/main.db")
conn.row_factory = sqlite3.Row


def init():
    """初始化数据库表"""
    cursor = conn.cursor()
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS user (
            uid       INTEGER PRIMARY KEY AUTOINCREMENT, -- 用户ID，自增主键
            username  TEXT NOT NULL UNIQUE,              -- 用户名，唯一
            password  TEXT NOT NULL,                     -- 密码
            userinfo  TEXT,                              -- 用户信息
            cookies   TEXT,                              -- cookies
            flag      INTEGER DEFAULT 0                  -- 标记位，可用来做状态控制
        );
        CREATE TABLE IF NOT EXISTS activity (
            id        INTEGER PRIMARY KEY AUTOINCREMENT, -- 签到记录ID，自增主键
            uid       INTEGER NOT NULL,                  -- 用户ID
            activeId  TEXT NOT NULL,                     -- 活动ID
            result    TEXT                               -- 签到结果
        );
    """)
    conn.commit()


init()
