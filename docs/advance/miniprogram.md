---
title: 开源小程序
icon: iconfont icon-study
category:
  - Advance
tag:
  - Advance
order: 10
---

> 本开源小程序部署教程仅供有小程序开发基础的人阅读，不提供任何形式的指导！

[非开源版部署教程](./no-open.html)

## 前置步骤

1. 注册小程序 [微信公众平台](https://mp.weixin.qq.com)
2. 设置小程序名称、类目等 (不能选游戏类目)
3. 小程序备案 (免费，必须) + 小程序微信认证 (非企业30元/年，可选)
4. 申请小程序开发接口 (需要 `wx.chooseLocation` 和 `wx.getLocation`，可去淘宝代开通)
5. 设置小程序服务器域名 (需要已备案的域名用于反代官方服务器)

服务器域名
1. request域名  
    ```
    https://api.map.baidu.com  
    https://api.tianditu.gov.cn  
    https://mooc1-api.chaoxing.com  
    https://pan-yz.chaoxing.com  
    https://passport2-api.chaoxing.com  
    https://passport2.chaoxing.com  
    https://sso.chaoxing.com  
    https://mobilewx.chaoxing.com  
    https://cx-proxy.example.com // 更换为你的反代域名 
    ``` 
2. uploadFile域名  
    ```
    https://pan-yz.chaoxing.com  
    ```

## 上传小程序代码

1. 注册 [百度地图开放平台](https://lbsyun.baidu.com) 和 [天地图开放平台](http://lbs.tianditu.gov.cn) 的密钥
2. 在 `miniprogram/utils` 目录下创建 `config.js` 并填入下面的内容。
    ```js
    const config = {
        baseUrl: "https://cx-proxy.example.com", // 更换为你的反代域名
        repository: "Misaka-1314/Chaoxing-WechatMiniProgram", // 开源仓库地址

        baiduMapKey: '', // 百度地图开发平台
        tianMapKey: '', // 天地图开放平台

        notice: "本小程序由公众号御坂网络Misaka免费提供，谨防倒卖！",
        
        swiperList: [
            "/static/swiper/1.png",
            "/static/swiper/2.png",
            "/static/swiper/3.png",
            "/static/swiper/4.png",
        ],
    }
    module.exports = config;
    ```
3. 上传代码
