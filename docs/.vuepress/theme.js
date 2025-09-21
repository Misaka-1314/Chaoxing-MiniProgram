import { hopeTheme } from "vuepress-theme-hope";

export default hopeTheme(
    {
        docsDir: "docs",
        logo: "https://github.com/Misaka-1314.png",
        repo: "Misaka-1314/Chaoxing-MiniProgram",
        hostname: "https://doc.micono.eu.org",

        author: {
            name: "Misaka",
            url: "https://github.com/Misaka-1314",
        },
        navbar: ["/guide/", "/advance/", "/tools/"],

        pageInfo: ["Author", "Original", "Date", "Category", "ReadingTime"],

        markdown: {
            imgMark: true,      // 支持图片标记
            imgLazyload: true,  // 支持图片懒加载
            imgSize: true,      // 支持图片大小
            tabs: true,         // 支持表格
            gfm: true,          // 支持完整的 GFM 语法
            tasklist: true,     // 支持任务列表
            include: true,      // 支持 include 语法
            align: true,        // 支持对齐
            mark: true,         // 支持标记
            sub: true,          // 支持下标
            sup: true,          // 支持上标
            demo: true,         // 支持 demo
            plantuml: true,     // 支持 PlantUML
            codeTabs: true,     // 支持代码块分组
            highlighter: {
                type: "shiki",
                theme: "vitesse-light",
                darkTheme: "vitesse-dark",
                aliases: {
                    Caddyfile: "text",
                },
            },
        },
        plugins: {
            // 本地搜索
            slimsearch: {
                indexContent: true,
                suggestion: true,
            },
            // 目录自动生成
            catalog: {
                frontmatter: () => ({
                    toc: false,
                }),
            },
            // 图标
            icon: {
                assets: [
                    "https://at.alicdn.com/t/c/font_2410206_5vb9zlyghj.css",
                    "https://at.alicdn.com/t/c/font_4691245_adcpm925j5a.css",
                    "https://npm.elemecdn.com/font6pro@6.4.0/css/fontawesome.min.css",
                    "https://npm.elemecdn.com/font6pro@6.4.0/css/all.min.css",
                ]
            },
            // Giscus 评论
            comment: false,
            // 临时弹窗
            notice: [
                {
                    path: "/",
                    title: '温馨提示',
                    content: '<i class="fa-solid fa-light-emergency-on fa-bounce" style="color: red;"></i>&nbsp;<span style="color:rgb(223 96 96);font-weight:bold;">请勿在任何群聊、评论区发送您的账户密码！</span><br/><br/>本签到小程序由公众号【御坂网络 Misaka】提供技术支持',
                    actions: [],
                    showOnce: true,
                }
            ],
            // 水印
            watermark: {
                watermarkOptions: {
                    content: "御坂网络 Misaka 学习通签到小程序",
                    movable: true,
                },
            },
            // PWA
            pwa: false,
            // SEO
            seo: true,
        },
        contributors: false,
        changelog: false,
    },
    {
        check: true,
        compact: true,
        custom: true,
        debug: false,
    }
);
