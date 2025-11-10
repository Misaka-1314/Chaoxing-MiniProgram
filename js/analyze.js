(() => {
    if (document.location.hostname.includes("localhost")) return;

    (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
        t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", "sdc8a364n2");

    var _hmt = _hmt || [];
    (() => {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?3fe37cfd4a01a35f38444863ed87148f";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
    })();
})();
