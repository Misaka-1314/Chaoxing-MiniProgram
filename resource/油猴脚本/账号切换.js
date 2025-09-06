// ==UserScript==
// @name         微信小程序快捷切换账号
// @namespace    https://mp.weixin.qq.com/
// @version      1.0.1
// @author       Misaka
// @match        https://mp.weixin.qq.com/wxamp/*
// @grant        none
// @updateURL    https://cdn.oplist.org/gh/Misaka-1314/Chaoxing-MiniProgram@main/resource/油猴脚本/账号切换.js
// @downloadURL  https://cdn.oplist.org/gh/Misaka-1314/Chaoxing-MiniProgram@main/resource/油猴脚本/账号切换.js
// ==/UserScript==

const getQueryParam = (name) => {
    const match = location.href.match(
        new RegExp("[?&]" + name + "=([^&]*)")
    );
    return match ? decodeURIComponent(match[1]) : null;
};

const toFormData = (obj) => Object.keys(obj)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
    .join("&");

const 获取小程序列表 = () => {
    const random = Math.random();
    const token = getQueryParam("token");
    localStorage.setItem("_misaka_当前页面", window.location.href);
    localStorage.setItem("_misaka_切换开关", "1");

    return new Promise(resolve => {
        fetch(`https://mp.weixin.qq.com/wxamp/cgi/getWxaList?token=${token}&lang=zh_CN&random=${random}`)
            .then(resp => resp.json())
            .then(res => {
                console.info("获取小程序列表", res);
                if (res.wax_list.length > 0)
                    resolve(res.wax_list.filter(item => item.type == 1).filter(item => !item.app_name.includes("测试号")))
                else
                    resolve([])
            })
    })
}

const 切换账号 = (username) => {
    const items = document.querySelectorAll(".account_item");
    const item = Array.from(items).find(item => item.querySelector(".account_email").innerText === username);
    console.info("找到账号元素", item);
    item.click();
}

(async () => {
    "use strict";

    const 切换开关 = localStorage.getItem("_misaka_切换开关");
    if (切换开关 == "1") {
        const token = getQueryParam("token");
        const 旧页面 = localStorage.getItem("_misaka_当前页面");
        const url = new URL(旧页面);
        url.searchParams.set("token", token);
        const 新页面 = url.toString();
        localStorage.setItem("_misaka_切换开关", "0");
        window.location.href = 新页面;
        return;
    }


    const 小程序列表 = await 获取小程序列表();

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "110px";
    container.style.right = "10px";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "flex-end";
    container.style.gap = "4px";
    container.style.backgroundColor = "rgba(255, 255, 255, 0.5)";

    小程序列表.forEach((item, index) => {
        const button = document.createElement("button");
        button.innerText = item.app_name || item.username;
        button.style.padding = "5px 8px";
        button.style.width = "100px";
        button.style.backgroundColor = "#072347";
        button.style.color = "#fff";
        button.style.fontSize = "12px";
        button.style.border = "none";
        button.style.borderRadius = "5px";
        button.style.cursor = "pointer";
        button.title = item.appid;
        if (index)
            button.addEventListener("click", () => 切换账号(item.username));
        else
            console.info("当前账号");
        container.appendChild(button);
    });

    document.body.appendChild(container);
})();
