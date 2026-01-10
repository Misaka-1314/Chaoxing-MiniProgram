export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const params = url.searchParams;

    const query = params.get('query') || "";
    const page = params.get('page') || "";
    const token = params.get('token');

    if (!token)
        return new Response(JSON.stringify({ "errcode": 40001, "errmsg": "invalid credential" }), {
            status: 400,
            headers: new Headers({
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            }),
        });

    let body, resp = null;

    if (query) {
        body = {
            "path": `${decodeURIComponent(page)}?${decodeURIComponent(query)}`,
            "width": Number(params.get("size") || 1280),
            "auto_color": true,
            "is_hyaline": params.get("hyaline") === 'true',
            "env_version": params.get("env") || "trial",
        }
        resp = await fetch(`https://api.weixin.qq.com/wxa/getwxacode?access_token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
    }
    else {
        body = {
            "scene": "from=docs",
            "page": decodeURIComponent(page),
            "check_path": false,
            "env_version": params.get("env") || "trial",
            "width": Number(params.get("size") || 1280),
            "auto_color": true,
            "is_hyaline": params.get("hyaline") === 'true',
        }
        resp = await fetch(`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
    }

    if (resp.headers.get("Content-Type").includes("application/json"))
        return new Response(JSON.stringify({
            "result": await resp.json(),
            "body": body,
        }), {
            status: resp.status,
            headers: new Headers({
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            }),
        });

    return new Response(resp.body, {
        status: resp.status,
        headers: new Headers({
            "Content-Type": resp.headers.get("Content-Type") || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
            "Access-Control-Allow-Origin": "*",
        }),
    });
}
