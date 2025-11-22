// ==UserScript==
// @name         超星网页助手
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  在 chaoxing 页面右上角添加按钮导入 JSON 格式 Cookie，仅主页面生效
// @run-at       document-end
// @match        https://passport2.chaoxing.com/login*
// @match        https://i.chaoxing.com/*
// @match        https://mobilelearn.chaoxing.com/page/sign/endSign*
// @match        https://sso.chaoxing.com/apis/login/userLogin4Uname.do?misaka-referer=*
// @updateURL    https://raw.githubusercontent.com/Misaka-1314/Chaoxing-MiniProgram/refs/heads/main/resource/油猴脚本/超星网页助手.js
// @downloadURL  https://raw.githubusercontent.com/Misaka-1314/Chaoxing-MiniProgram/refs/heads/main/resource/油猴脚本/超星网页助手.js
// @author       Misaka-1314
// @icon         https://im.chaoxing.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

const createBtn = ({
    text, top, onclick = null, rule = null,
}) => {
    const url = new URL(location.href);
    if (rule && !rule(url)) return;
    const btn = document.createElement("button");
    Object.assign(btn.style, {
        position: "fixed",
        top: `${top}px`,
        right: "10px",
        zIndex: 9999,
        padding: "6px 12px",
        backgroundColor: "#CE88F4",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
    });
    btn.innerText = text;
    document.documentElement.insertBefore(btn, document.body);
    if (onclick) btn.onclick = onclick;
    return btn;
};

const clearPage = () => {
    document.body.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 32px;">自动操作中</div>';
};

const getCookie = name => {
    const cookieStr = document.cookie;
    if (!cookieStr) return null;

    return cookieStr
        .split(";")
        .map(c => c.trim())
        .reduce((val, c) => {
            const [k, v] = c.split("=");
            return k === name ? decodeURIComponent(v || "") : val;
        }, null);
};


(function () {
    'use strict';
    if (window.top !== window.self) return;

    if (location.hostname === "sso.chaoxing.com") {
        clearPage();
        const referer = new URL(location.href).searchParams.get("misaka-referer");
        if (referer) {
            location.replace(`https://${referer}`);
            const uid = getCookie("UID") || "0";
            GM_setValue(`cx.${uid}.expire`, Math.floor(Date.now() / 1e3 + 7 * 24 * 3600 - 300));
        }
        return;
    }

    createBtn({
        text: "导入登录态",
        top: 80,
        onclick: () => {
            const input = prompt("请输入 JSON 格式的 Cookie：\n例如：{\"uid\":\"123\"}");
            if (!input)
                return location.reload();

            let data;
            try { data = JSON.parse(input); } catch { return alert("JSON 格式不正确"); }

            const domains = [".chaoxing.com", "sso.chaoxing.com", "passport2.chaoxing.com", "i.chaoxing.com"];
            domains.forEach(host => {
                document.cookie = `xxtenc=; domain=${host}; path=/`;
                for (const [k, v] of Object.entries(data)) {
                    document.cookie = `${k}=${encodeURIComponent(decodeURIComponent(v))}; domain=${host}; path=/`;
                }
            });

            location.replace("https://sso.chaoxing.com/apis/login/userLogin4Uname.do?misaka-referer=i.chaoxing.com");
        }
    });


    createBtn({
        text: "续期登录态",
        top: 120,
        onclick: () => {
            clearPage();
            location.replace(
                "https://sso.chaoxing.com/apis/login/userLogin4Uname.do?misaka-referer=i.chaoxing.com"
            );
        },
        rule: url => url.hostname.startsWith("i."),
    });

    createBtn({
        text: "查看有效期",
        top: 160,
        onclick: () => {
            const uid = getCookie("UID") || "0";
            const expire = GM_getValue(`cx.${uid}.expire`, 0);
            if (!expire)
                return alert("未找到有效期记录，可能未续期过登录态！");
            const expireDate = new Date(expire * 1e3);
            alert(`登录态有效期至：${expireDate.toLocaleString()}`);
        },
        rule: url => url.hostname.startsWith("i."),
    });

    createBtn({
        text: "增强页面",
        top: 200,
        onclick: () => {
            const ul = document.querySelector('.edit-sta-list');
            ul.innerHTML = "";
            GM_addStyle("#upYiqianLi { display: none !important; }");
            const btn = (text, value) => `
            <li class="leave_radio">
                <label>
                    <span class="ipt-radio">
                        <input name="radio1" type="radio" value="${value}">
                        <i class="icon-radio"></i>
                    </span>
                    <span>${text}</span>
                </label>
            </li>
            `;
            ["未签到", "已签", "教师代签", "隐藏此账号", "请假", "缺勤", null, "病假", "事假", "迟到", "早退", null, "公假"].forEach((text, index) => {
                if (text)
                    ul.innerHTML += btn(text, index);
            });
        },
        rule: url => url.hostname === "mobilelearn.chaoxing.com",
    });
})();
