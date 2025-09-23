const formatToChinaTime = (datetimeStr) => {
    const date = new Date(datetimeStr);
    const cnTime = new Date(date.getTime());
    const yyyy = cnTime.getFullYear();
    const mm = String(cnTime.getMonth() + 1).padStart(2, "0");
    const dd = String(cnTime.getDate()).padStart(2, "0");
    const hh = String(cnTime.getHours()).padStart(2, "0");
    const min = String(cnTime.getMinutes()).padStart(2, "0");
    const ss = String(cnTime.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

const version = (datetimeStr) => {
    const date = new Date(datetimeStr);
    const cnTime = new Date(date.getTime());
    const yyyy = cnTime.getFullYear();
    const mm = String(cnTime.getMonth() + 1).padStart(2, "0");
    const dd = String(cnTime.getDate()).padStart(2, "0");
    return `v3.${yyyy}.${mm}.${dd}`;
}

const response = (res) =>
    new Response(JSON.stringify(res), {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Cache-Control": "public, max-age=300, immutable",
        },
    });

export async function onRequestGet({ request, params, env }) {
    const resp = await fetch(
        `https://api.github.com/repos/${env.repo}/commits?path=miniprogram&sha=main&per_page=3`, {
        "method": "GET",
        "headers": {
            "Authorization": `Bearer ${env.token}`,
            "User-Agent": "misaka-docs",
        },
    });
    if (resp.status != 200)
        return response({
            status: -1,
            msg: `请求失败 ${resp.status} ${await resp.text()}`,
            data: "获取失败",
        });

    const res = await resp.json();
    const date = res[0]?.commit?.committer?.date || "获取失败";
    return response({
        status: 0,
        msg: "获取最后更新时间",
        data: {
            "datetime": formatToChinaTime(date),
            "version": version(date),
        },
    });
}
