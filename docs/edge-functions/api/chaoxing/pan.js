const parseSetCookies = arr =>
    Object.fromEntries(
        arr.map(s => {
            const kv = s.split(';', 1)[0];
            const i = kv.indexOf('=');
            return [kv.slice(0, i), decodeURIComponent(kv.slice(i + 1))];
        })
    );

const toWildcardDomain = d => {
    const parts = d.split('.');
    if (parts.length <= 1) return d;
    if (parts.length === 2) return '.' + d;
    return '.' + parts.slice(1).join('.');
};

export async function onRequestGet({ request }) {
    const url = new URL(request.url);
    const params = url.searchParams;
    const domain = url.hostname;
    const username = params.get('username');
    const password = params.get('password');

    if (!username || !password)
        return new Response(JSON.stringify({
            "status": false,
            "mes": "账号或密码不能为空"
        }), {
            status: 400,
            headers: { "content-type": "application/json" }
        });

    if (username.length !== 11)
        return new Response(JSON.stringify({
            "status": false,
            "mes": "请输入正确的账号",
        }), {
            status: 400,
            headers: { "content-type": "application/json" }
        });

    try {
        let resp = await fetch(
            `https://passport2-api.chaoxing.com/v11/loginregister?uname=${username}&code=${encodeURIComponent(password)}&loginType=1&roleSelect=true&cx_xxt_passport=json`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://passport2.chaoxing.com/login'
            },
            eo: {
                timeoutSetting: {
                    connectTimeout: 60000,
                    readTimeout: 60000,
                    writeTimeout: 60000,
                }
            },
        })
        let res = await resp.json();
        const cookies = parseSetCookies(resp.headers.getSetCookie() || []);

        resp = await fetch(
            "https://pan-yz.chaoxing.com/api/token/uservalid", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://pan-yz.chaoxing.com/',
                'Cookie': Object.entries(cookies).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('; '),
            },
            eo: {
                timeoutSetting: {
                    connectTimeout: 60000,
                    readTimeout: 60000,
                    writeTimeout: 60000,
                }
            },
        })
        res = await resp.json();

        const newResp = new Response(JSON.stringify({
            ...res,
            "puid": cookies.UID || '',
            "ext": {
                "cookies": cookies,
                "domain": toWildcardDomain(domain),
            },
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": request.headers.get('Origin') || '*',
                "Cache-Control": "private, max-age=3600",
            }
        })
        for (const key in cookies) {
            newResp.headers.append('Set-Cookie', `${key}=${encodeURIComponent(cookies[key])}; Domain=${toWildcardDomain(domain)}; Path=/; SameSite=Lax; Max-Age=315360000`);
        }
        return newResp;
    } catch (e) {
        return new Response(JSON.stringify({
            "status": false,
            "mes": "请求失败，请稍后重试",
            "error": e.message,
        }), {
            status: 400,
            headers: { "content-type": "application/json" }
        });
    }
}