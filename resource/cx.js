// ==UserScript==
// @name         显示学习通网页版发起签到隐藏功能
// @match        *://mobilelearn.chaoxing.com/*
// ==/UserScript==

(function () {
    'use strict';

    function processElement(element) {
        if (element.style && element.style.display === 'none') {
            element.style.display = '';
        }

        const children = element.children;
        for (let i = 0; i < children.length; i++) {
            processElement(children[i]);
        }
    }

    function findAndProcess() {
        const elements = document.querySelectorAll('.btm-set-box');
        elements.forEach(element => {
            processElement(element);
        });
    }
    setInterval(findAndProcess, 500);
})();