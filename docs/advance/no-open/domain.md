---
title: 非开源版配置域名
index: false
icon: iconfont icon-state
category:
  - Advance
tag:
  - Advance
order: 10
---

自建小程序可以开启调试模式使用，或者在微信公众平台配置服务器域名。

如果你要上线正式版小程序，必须配置服务器域名，并且需要开发者将你的小程序加入白名单。

:::tip
依照我们的非开源版小程序授权协议，小程序不能用于盈利，如引流其他学习通相关产品、倒卖。
:::

:::tip
您可以拒绝同意我们的授权协议，我们也将因此拒绝为您提供服务。
同意协议后，您也可以随时撤回同意，修改小程序密钥并下线我们设计的小程序即可代表您中止协议。
:::

:::tabs#mode

@tab 开启调试模式使用

1. 点击小程序右上角三个点
2. 下方滑到最右边，点击 “开发调试” 开启调试模式。

@tab 设置小程序服务器域名

<img src="/image/guide/配置服务器域名.png" style="width: min(60vw, 420px)" />

#### request 合法域名  

```
https://a1-vip6.easemob.com;
https://rs.easemob.com;
https://api.map.baidu.com;
https://api.tianditu.gov.cn;
https://api.vore.top;
https://doh.pub;
https://hmma.baidu.com;
https://mooc1-api.chaoxing.com;
https://mooc1.chaoxing.com;
https://pan-yz.chaoxing.com;
https://passport2-api.chaoxing.com;
https://mobilewx.chaoxing.com;
https://mobilelearn.chaoxing.com;
https://widget-course.chaoxing.com;
https://passport2.chaoxing.com;
https://sso.chaoxing.com;
https://x.chaoxing.com;
https://i.chaoxing.com;
https://im.chaoxing.com;
https://kdxg.tust.edu.cn;
https://data-reporting.agora.io;
https://proxy.yangrucheng.top;
https://cx.misaka-network.top;
``` 

#### socket 合法域名  

```
wss://im-api-wechat-vip6.easemob.com
```

#### uploadFile 合法域名  

```
https://pan-yz.chaoxing.com  
```

#### downloadFile 合法域名  

```
https://pan-yz.chaoxing.com  
```

#### DNS 预解析域名

```
sso.chaoxing.com;
cx.misaka-network.top;
passport2-api.chaoxing.com;
mooc1-api.chaoxing.com;
api.map.baidu.com;
```

#### 预连接域名

```
https://sso.chaoxing.com;
https://cx.misaka-network.top;
https://passport2-api.chaoxing.com;
https://mooc1-api.chaoxing.com;
https://api.map.baidu.com;
```

:::

广告及轮播图相关内容，请阅读 [广告教程](./ad-setting.md)