// ==UserScript==
// @name         超星 Cookie 导入助手
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  在 chaoxing 页面右上角添加按钮导入 JSON 格式 Cookie，仅主页面生效
// @match        https://passport2.chaoxing.com/login*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (window.top !== window.self) return; // 只在顶层执行

    const btn = document.createElement("button");
    btn.innerText = "导入 Cookies";
    btn.style.position = "fixed";
    btn.style.top = "10px";
    btn.style.right = "10px";
    btn.style.zIndex = 9999;
    btn.style.padding = "6px 12px";
    btn.style.backgroundColor = "#2080F0";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
    document.body.appendChild(btn);

    btn.addEventListener("click", () => {
        const input = prompt(`请输入 JSON 格式的 Cookie：\n如 {"uid": "ab123"}`);
        if (!input) return;

        const cookies = JSON.parse(input);
        const domains = [".chaoxing.com"];
        const path = "/";

        for (const domain of domains) {
            for (const [key, value] of Object.entries(cookies)) {
                document.cookie = `${key}=${encodeURIComponent(decodeURIComponent(value))}; domain=${domain}; path=${path}`;
            }
        }
        fetch("https://sso.chaoxing.com/apis/login/userLogin4Uname.do")
            .then(resp => resp.json())
            .then(res => {
                console.info(res);
                window.location.href = "https://i.chaoxing.com/";
            });
    });
})();