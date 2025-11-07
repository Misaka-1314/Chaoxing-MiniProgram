// ==UserScript==
// @name         微信小程序设置最低版本
// @namespace    https://mp.weixin.qq.com/
// @version      1.0.1
// @author       Misaka
// @match        https://mp.weixin.qq.com/wxamp/*
// @grant        none
// @updateURL    https://cdn.oplist.org/gh/Misaka-1314/Chaoxing-MiniProgram@main/resource/油猴脚本/设置最低版本.js
// @downloadURL  https://cdn.oplist.org/gh/Misaka-1314/Chaoxing-MiniProgram@main/resource/油猴脚本/设置最低版本.js
// ==/UserScript==

(() => {
    "use strict";

    const button = document.createElement("button");
    button.id = "one-latest-version";
    button.innerText = "设置最低版本~♡";
    button.style.position = "fixed";
    button.style.top = "60px";
    button.style.right = "10px";
    button.style.zIndex = "9999";
    button.style.padding = "10px 15px";
    button.style.backgroundColor = "#ff69b4";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";

    const toFormData = (obj) =>
        Object.keys(obj)
            .map(
                (key) =>
                    encodeURIComponent(key) + "=" + encodeURIComponent(obj[key])
            )
            .join("&");

    const getQueryParam = (name) => {
        const match = location.href.match(
            new RegExp("[?&]" + name + "=([^&]*)")
        );
        return match ? decodeURIComponent(match[1]) : null;
    };

    button.addEventListener("click", async () => {
        const random = Math.random();
        const token = getQueryParam("token");

        let count = 0;
        document.getElementById("one-latest-version").disabled = true;
        document.getElementById("one-latest-version").innerText = `正在执行~♡`;
        document.getElementById("one-latest-version").style.backgroundColor =
            "#006CBE";
        setInterval(
            () =>
            (document.getElementById(
                "one-latest-version"
            ).innerText = `正在执行~♡ ${++count} s`),
            1000
        );

        fetch(`https://mp.weixin.qq.com/wxamp/cgi/route?path=${encodeURIComponent('/wxopen/wasysnotify?action=update&all=1')}&token=${token}&lang=zh_CN&random=${random}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json, text/plain, */*",
            },
        })
            .then((response) => response.json())
            .then(() => {
                console.info("通知已读成功~♡");
            });

        fetch(`https://mp.weixin.qq.com/wxamp/cgi/config/basicConfig?token=${token}&lang=zh_CN&random=${random}`)
            .then((response) => response.json())
            .then((result) => {
                const historyList = result.historyList || [];
                if (!historyList.length) return;
                const version = historyList[0]?.version;
                return fetch(
                    `https://mp.weixin.qq.com/wxamp/cgi/setting/modifyMinWxaVersion?token=${token}&lang=zh_CN&random=${random}`, {
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
            .then((result) => {
                console.info("设置小程序版本号成功~♡", result)
                window.location.reload();
            });
    });

    document.body.appendChild(button);
})();
