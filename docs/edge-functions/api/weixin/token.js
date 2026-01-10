export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const params = url.searchParams;
    const appid = params.get('appid');
    const secret = params.get('secret');

    const resp = await fetch(
        `https://api.weixin.qq.com/cgi-bin/stable_token`, {
        "method": "POST",
        "body": JSON.stringify({
            "grant_type": "client_credential",
            "appid": appid,
            "secret": secret,
            "force_refresh": false,
        }),
        "headers": {
            "Content-Type": "application/json",
        },
    });
    const res = await resp.json();
    const expire = (res.expires_in || 3600) - 300;
    return new Response(JSON.stringify(res), {
        status: 200,
        headers: new Headers({
            "Content-Type": "application/json",
            "Cache-Control": `public, max-age=${expire}, immutable`,
            "Access-Control-Allow-Origin": "*",
        }),
    });
}
