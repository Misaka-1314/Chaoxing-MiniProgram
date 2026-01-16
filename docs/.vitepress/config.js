import { defineConfig } from 'vitepress';

export default defineConfig({
    lang: 'zh-CN',
    title: 'Misaka 学习通签到小程序文档',
    titleTemplate: 'Misaka 文档',
    description: '御坂学习小程序 文档',

    cleanUrls: true,
    assetsDir: 'misaka-assets',
    cacheDir: './.vitepress/.cache',
    metaChunk: true,
    lastUpdated: true,
    sitemap: {
        hostname: 'https://doc.micono.eu.org',
    },
    srcExclude: ['edge-functions/**'],

    head: [
        ['link', { rel: 'icon', href: '/logo.png' }],
        ['meta', { name: 'referrer', content: 'never' }],
        ['script', { type: 'text/javascript', src: '/js/analyze.js' }],
        ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
        ['script', { src: 'https://challenges.cloudflare.com/turnstile/v0/api.js', async: '', defer: '' }]
    ],

    markdown: {
        attrs: { disable: true },
        container: {
            tipLabel: '提示',
            warningLabel: '警告',
            dangerLabel: '危险',
            infoLabel: '信息',
            detailsLabel: '详细信息'
        }
    },

    themeConfig: {
        logo: '/logo.png',
        siteTitle: 'Misaka 文档',
        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/Misaka-1314/Chaoxing-MIniProgram'
            }
        ],
        outline: false,
        docFooter: {
            prev: '上一页',
            next: '下一页'
        },

        nav: [
            {
                text: "更多",
                items: [
                    {
                        text: '许可证',
                        link: 'https://github.com/Misaka-1314/Chaoxing-MiniProgram/blob/main/LICENSE'
                    },
                    {
                        text: '参与贡献',
                        link: 'https://github.com/Misaka-1314/Chaoxing-MiniProgram/blob/main/CODE_OF_CONDUCT.md'
                    }
                ]
            }
        ],

        lastUpdated: {
            text: '最后更新于'
        },

        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',

        notFound: {
            title: '页面未找到',
            quote:
                '但如果你不改变方向，并且继续寻找，你可能最终会到达你所前往的地方。',
            linkLabel: '前往首页',
            linkText: '带我回首页'
        },
        editLink: {
            text: '在 GitHub 上编辑此页',
            pattern: 'https://github.com/Misaka-1314/Chaoxing-MIniProgram/edit/main/docs/:path'
        },
        sidebar: [{
            text: '用户签到指南',
            collapsed: false,
            items: [
                { text: '简介', link: '/guide/' },
                { text: '签到类型', link: '/guide/type' },
                { text: '关于会员', link: '/guide/vip' },
                { text: '签到结果', link: '/guide/result' },
                { text: '使用教程', link: '/guide/tutorial' },
            ],
        }, {
            text: '开发者指南',
            collapsed: false,
            items: [
                {
                    text: '开源版',
                    items: [
                        { text: '小程序端开发', link: '/advance/open/develop' },
                        { text: '反代服务搭建', link: '/advance/open/server' }
                    ]
                },
                {
                    text: '非开源版',
                    items: [
                        { text: '自建小程序', link: '/advance/no-open/develop' },
                        { text: '上传代码', link: '/advance/no-open/upload' },
                        { text: '版本升级', link: '/advance/no-open/upgrade' },
                        { text: '添加广告', link: '/advance/no-open/ad-setting' }
                    ]
                }
            ],
        }, {
            text: '学习通介绍',
            collapsed: true,
            items: [
                { text: '实名认证', link: '/official/realname' },
            ],
        }, {
            text: '小工具',
            collapsed: false,
            items: [
                { text: '超星图床', link: '/tools/image' },
                { text: '设备特征码', link: '/tools/device' },
            ]
        }],
        footer: {
            message: '本文档未经许可，禁止转载文中文字及图片！非开源版小程序禁止未授权的商用，开源版小程序通过 AGPL-3.0 授权！',
            copyright: 'Copyright © 2024 - 2026 By github.com/misaka-1314'
        },
    },

    vite: {
        optimizeDeps: {
            include: ['naive-ui', 'vueuc']
        },
        ssr: {
            noExternal: ['naive-ui', 'vueuc']
        },
    },
})