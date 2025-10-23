---
title: 反代服务器
icon: iconfont icon-state
category:
  - Advance
tag:
  - Advance
order: 25
---

# 反向代理服务端部署教程

> 微信小程序配置服务器域名 要求域名已备案
>
> 自用无需备案，体验版开启调试模式即可

## 使用 CDN 或边缘函数反代

### 使用 Cloudflare Worker

把下面的反向代理脚本粘贴到 Workers 编辑器中。

> 注意：Worker默认的域名已被墙，请自备域名；已知部分沿海城市阻断了CF的IP。

[![使用 Cloudflare Workers 部署](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Misaka-1314/Chaoxing-MiniProgram/tree/main/server/cloudflare)

:::warning
请修改根目录为 `server/cloudflare`。
如果部署有问题，请自行复制代码粘贴到 Cloudflare Workers！[去复制代码](https://github.com/Misaka-1314/Chaoxing-MiniProgram/blob/main/server/cloudflare/_worker.js)
:::

### 使用腾讯云 EdgeOne 边缘函数

[![使用 腾讯云 EdgeOne 边缘函数部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=https%3a%2f%2fgithub.com%2fMisaka-1314%2fChaoxing-MiniProgram%2ftree%2fmain%2fserver%2fedgeone&project-name=cx-proxy&repository-name=cx-proxy)

### 使用腾讯云 EdgeOne 站点加速

<img src="/image/guide/EO加速.png" style="width: min(60vw, 480px)" />

## 自建反代服务器

### Caddy 配置文件示例

```
example.com {
    handle_path /proxy/* {
        reverse_proxy "https://mobilelearn.chaoxing.com" {
            header_up Host "mobilelearn.chaoxing.com"
            header_up Referer "https://mobilelearn.chaoxing.com"
            header_up Origin "https://mobilelearn.chaoxing.com"
            header_up User-Agent "Mozilla/5.0 (iPhone Mac OS X) github.com/misaka-1314"
        }
    }
 reverse_proxy http://127.0.0.1:8080
}
```

```
http://192.168.x.x:8080 {
    handle_path /proxy/* {
        reverse_proxy "https://mobilelearn.chaoxing.com" {
            header_up Host "mobilelearn.chaoxing.com"
            header_up Referer "https://mobilelearn.chaoxing.com"
            header_up Origin "https://mobilelearn.chaoxing.com"
            header_up User-Agent "Mozilla/5.0 (iPhone Mac OS X) github.com/misaka-1314"
        }
    }
 reverse_proxy http://127.0.0.1:8080
}
```

### Nginx 配置文件示例

```nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location /proxy/ {
        rewrite ^/proxy/(.*)$ /$1 break;

        proxy_pass https://mobilelearn.chaoxing.com;
        proxy_set_header Host "mobilelearn.chaoxing.com";
        proxy_set_header Referer "https://mobilelearn.chaoxing.com";
        proxy_set_header Origin "https://mobilelearn.chaoxing.com";
        proxy_set_header User-Agent "Mozilla/5.0 (iPhone Mac OS X) github.com/misaka-1314";
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
```

```nginx
server {
    listen 8080;
    server_name 192.168.x.x;

    location /proxy/ {
        rewrite ^/proxy/(.*)$ /$1 break;
        
        proxy_pass https://mobilelearn.chaoxing.com;
        proxy_set_header Host "mobilelearn.chaoxing.com";
        proxy_set_header Referer "https://mobilelearn.chaoxing.com";
        proxy_set_header Origin "https://mobilelearn.chaoxing.com";
        proxy_set_header User-Agent "Mozilla/5.0 (iPhone Mac OS X) github.com/misaka-1314";
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
```

### 使用 Python 反代

```python
from fastapi import FastAPI, Request, Response
from urllib.parse import urljoin
import uvicorn
import httpx

app = FastAPI(redoc_url=None, docs_url=None)
ORIGIN_URL = "https://mobilelearn.chaoxing.com"

@app.get("/{path:path}")
async def proxy(request: Request, path: str):
    real_path = path.replace("/proxy", "")
    # 这里应该加入校验 path 和 cookies，防止恶意请求
    async with httpx.AsyncClient(http2=True, timeout=10) as client:
        resp = await client.get(
            url=urljoin(ORIGIN_URL, real_path),
            params=request.query_params,
            cookies=dict(request.cookies),
        )
    return Response(
        content=resp.content,
        status_code=resp.status_code,
    )

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
```

```python
from aiohttp import web, ClientSession
from urllib.parse import urljoin

ORIGIN = "https://mobilelearn.chaoxing.com"

async def proxy(req):
    path = req.match_info["path"]
    url = urljoin(ORIGIN, path)
    async with ClientSession() as s, s.get(url, params=req.query, cookies=req.cookies) as r:
        return web.Response(body=await r.read(), status=r.status, headers=r.headers, content_type=r.headers.get("Content-Type"))

app = web.Application()
app.router.add_get("/proxy/{path:.*}", proxy)

web.run_app(app, port=8000)
```