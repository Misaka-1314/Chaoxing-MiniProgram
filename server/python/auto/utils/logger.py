from logging.handlers import TimedRotatingFileHandler
import logging
import sys
import os


class FilterInvalidHttpRequest(logging.Filter):
    def filter(self, record):
        msg = record.getMessage()
        return not any(
            kw in msg
            for kw in [
                "Invalid HTTP request received.",
                "HTTP/2.0",
            ]
        )


def set_log_formatter():
    # 颜色代码
    TIME_COLOR = "\033[32m"
    LEVEL_COLOR = "\033[33m"
    RESET = "\033[0m"

    # 有颜色格式（给终端用）
    color_format = f"{TIME_COLOR}%(asctime)s{RESET} - {LEVEL_COLOR}%(levelname)s{RESET} - %(message)s"
    color_formatter = logging.Formatter(color_format)

    # 无颜色格式（给日志文件用）
    plain_format = "%(asctime)s - %(levelname)s - %(message)s"
    plain_formatter = logging.Formatter(plain_format)

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # 清除默认 handlers
    if logger.hasHandlers():
        logger.handlers.clear()

    # 控制台输出（带颜色）
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(color_formatter)
    logger.addHandler(console_handler)
    logger.addFilter(FilterInvalidHttpRequest())

    # 文件输出（无颜色）
    if not os.path.exists("log"):
        os.makedirs("log")
    file_handler = TimedRotatingFileHandler(
        filename="log/cx-api",
        when="midnight",
        interval=1,
        backupCount=90,
        encoding="utf-8",
        utc=False,
    )
    file_handler.suffix = r"%Y-%m-%d.log"
    file_handler.setFormatter(plain_formatter)
    logger.addHandler(file_handler)

    # httpx 模块日志调低
    logging.getLogger("httpx").setLevel(logging.WARNING)


set_log_formatter()
