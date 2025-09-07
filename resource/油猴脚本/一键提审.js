// ==UserScript==
// @name         微信小程序一键提审
// @namespace    https://mp.weixin.qq.com/
// @version      1.0.2
// @author       Misaka
// @match        https://mp.weixin.qq.com/wxamp/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @updateURL    https://cdn.oplist.org/gh/Misaka-1314/Chaoxing-MiniProgram@main/resource/油猴脚本/一键提审.js
// @downloadURL  https://cdn.oplist.org/gh/Misaka-1314/Chaoxing-MiniProgram@main/resource/油猴脚本/一键提审.js
// ==/UserScript==

// 获取 remark 的函数
const getRemark = () => {
    let remark = GM_getValue("remark", null);
    if (!remark) {
        const account = prompt("请输入测试账号：", "");
        const password = prompt("请输入测试密码：", "");
        if (account && password) {
            remark = `部分功能需要登录账号体验\n\n测试账号：${account}\n密码：${password}`;
            GM_setValue("remark", remark);
        }
        else {
            alert("未输入测试账号或密码，无法提交审核~♡");
            throw new Error("未输入测试账号或密码，无法提交审核~♡");
        }
    }
    return remark;
};

(() => {
    "use strict";
    const getQueryParam = (name) => {
        const match = location.href.match(
            new RegExp("[?&]" + name + "=([^&]*)")
        );
        return match ? decodeURIComponent(match[1]) : null;
    };

    const toFormData = (obj) =>
        Object.keys(obj)
            .map(
                (key) =>
                    encodeURIComponent(key) + "=" + encodeURIComponent(obj[key])
            )
            .join("&");

    const button = document.createElement("button");
    button.id = "one-click-submit";
    button.innerText = "一键提审~♡";
    button.style.position = "fixed";
    button.style.top = "10px";
    button.style.right = "10px";
    button.style.zIndex = "9999";
    button.style.padding = "10px 15px";
    button.style.backgroundColor = "#ff69b4";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";

    let count = 0;

    button.addEventListener("click", async () => {
        const random = Math.random();
        const token = getQueryParam("token");
        const lang = getQueryParam("lang") || "zh_CN";
        let openid = "";

        document.getElementById("one-click-submit").disabled = true;
        document.getElementById("one-click-submit").innerText = `正在执行~♡`;
        document.getElementById("one-click-submit").style.backgroundColor =
            "#006CBE";
        setInterval(
            () =>
            (document.getElementById(
                "one-click-submit"
            ).innerText = `正在执行~♡ ${++count} s`),
            1000
        );

        const route_query = `f=json&token=${token}&lang=zh_CN`;
        fetch(
            `https://mp.weixin.qq.com/wxamp/cgi/route?path=${encodeURIComponent(
                "/wxopen/wacodepage?action=getcodepage&" + route_query
            )}&token=${token}&lang=${lang}&random=${random}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json, text/plain, */*",
                },
            }
        )
            .then((response) => response.json())
            .then((result) => {
                const code_data = JSON.parse(result.code_data);
                openid = code_data.online_info?.basic_info?.open_id || null;
                if (!openid)
                    openid =
                        code_data.develop_info.info_list.filter(
                            (i) => i.is_exper
                        )[0]?.basic_info?.open_id || null;
                console.info("获取小程序版本", code_data, openid);
            })
            .then(() =>
                Promise.all([
                    fetch(
                        `https://mp.weixin.qq.com/wxamp/cgi/route?path=${encodeURIComponent(
                            "/wxopen/wacodepage?action=check_domain"
                        )}&token=${token}&lang=${lang}&random=${random}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                "Accept": "application/json, text/plain, */*",
                            },
                            body: toFormData({
                                openid: openid,
                            }),
                        }
                    ),
                    fetch(
                        `https://mp.weixin.qq.com/wxamp/cgi/route?path=${encodeURIComponent(
                            "/wxopen/waexperiencecode?action=check_plugin_version"
                        )}&token=${token}&lang=${lang}&random=${random}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                "Accept": "application/json, text/plain, */*",
                            },
                            body: toFormData({
                                openid: openid,
                            }),
                        }
                    ),
                ])
            )
            .then(() =>
                fetch(
                    `https://mp.weixin.qq.com/wxamp/cgi/route?path=${encodeURIComponent(
                        "/wxopen/wadevelopcode?action=get_class&" +
                        route_query +
                        "&openid=" +
                        openid
                    )}&token=${token}&lang=zh_CN&random=${random}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Accept": "application/json, text/plain, */*",
                        },
                    }
                )
            )
            .then((response) => response.json())
            .then((result) => {
                return JSON.parse(result.class_info || "{}");
            })
            .then((class_info) =>
                fetch(
                    `https://mp.weixin.qq.com/wxamp/cgi/route?path=${encodeURIComponent(
                        "/wxopen/wadevelopcode?action=submit_check"
                    )}&token=${token}&lang=${lang}&random=${random}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Accept": "application/json, text/plain, */*",
                        },
                        body: toFormData({
                            ticket: "qrcheckTicket",
                            openid: openid,
                            auto_id: 30,
                            version_desc: `版本提交审核\n\n更新时间：${new Date().toLocaleString(
                                "zh-CN"
                            )}`,
                            speedup_audit: 0,
                            speedup_type: "修复漏洞",
                            speedup_desc: "",
                            encrypted_username: "",
                            encrypted_password: "",
                            remark: class_info.remark || getRemark(),
                            order_path: "",
                            feedback_info: "",
                            feedback_status: 1,
                            only_run_wxwork: 0,
                            argue_item: "",
                            preview_info: JSON.stringify({
                                pic_id_list: [],
                                video_id_list: [],
                            }),
                            feedback_stuff: "",
                        }),
                    }
                )
            )
            .then((response) => response.json())
            .then((result) => {
                if (result.ret != 0)
                    alert("提交异常了喵~♡\n" + JSON.stringify(result));
                window.location.href = `https://mp.weixin.qq.com/wxamp/wacodepage/getcodepage?token=${token}&lang=zh_CN&_=${random}`;
            })
            .catch((error) => {
                alert("出错啦呜呜呜~\n" + error);
            });

        fetch(
            `https://mp.weixin.qq.com/wxamp/cgi/config/basicConfig?token=${token}&lang=zh_CN&random=${random}`
        )
            .then((response) => response.json())
            .then((result) => {
                const historyList = result.historyList || [];
                if (!historyList.length) return;
                const version = historyList[0]?.version;
                return fetch(
                    `https://mp.weixin.qq.com/wxamp/cgi/setting/modifyMinWxaVersion?token=${token}&lang=zh_CN&random=${random}`,
                    {
                        method: "POST",
                        body: toFormData({
                            version: version,
                        }),
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Accept": "application/json, text/plain, */*",
                        },
                    }
                );
            })
            .then((response) => response.json())
            .then((result) => console.info("设置小程序版本号成功~♡", result));
    });

    document.body.appendChild(button);
})();
