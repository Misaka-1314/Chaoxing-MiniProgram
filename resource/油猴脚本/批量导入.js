// ==UserScript==
// @name         超星名单导入助手
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  批量导入名单
// @match        https://mooc2-ans.chaoxing.com/tcm/course-manage*
// @updateURL    https://cdn.oplist.org/gh/Misaka-1314/Chaoxing-MiniProgram@main/resource/油猴脚本/批量导入.js
// @downloadURL  https://cdn.oplist.org/gh/Misaka-1314/Chaoxing-MiniProgram@main/resource/油猴脚本/批量导入.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (window.top !== window.self) return; // 只在顶层执行

    const btn = document.createElement("button");
    btn.innerText = "导入名单";
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
        const input = prompt(`请输入 JSON 格式的名单：\n如 [{ "name": "张三", "mobile": "123456789" }]`);
        if (!input) return;

        const params = new URLSearchParams(window.location.search);

        const list = JSON.parse(input);
        const cpi = params.get("cpi");
        const courseId = params.get("courseid");
        const classId = params.get("clazzid");
        const fid = prompt("fid");

        list.forEach((item, index) => {
            fetch(`https://mooc2-ans.chaoxing.com/mooc2-ans/tcm/addstubyhand?loginName=${item.mobile}&cpi=${cpi}&realName=${item.name}&fid=${fid}&courseId=${courseId}&handAddStudentType=1&clazzId=${classId}`)
                .then(resp => resp.json())
                .then(res => {
                    console.info(item.name, res)
                })
        })
    });
})();
