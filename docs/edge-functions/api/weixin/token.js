export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const params = url.searchParams;
    const appid = params.get('appid');
    const secret = params.get('secret');

    return fetch(
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
}
