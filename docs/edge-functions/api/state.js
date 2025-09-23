export function onRequestGet({ request, params, env }) {
    return new Response(JSON.stringify({
        "status": 0,
        "msg": "ok",
        "data": {
            "ip": request.eo.clientIp,
        },
    }), {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        }
    })
}
