---
title: 非开源版
icon: iconfont icon-study
category:
  - Advance
tag:
  - Advance
order: 15
---

:::warning
非开源版小程序，原则上仅用于自己和同学朋友使用。
明确禁止用于牟利（包括但不限于倒卖、引流其他产品等），除非分我。
:::

:::tip
开发者依靠激励广告获得收益，这是我们更新的动力！
不支持去除广告、公众号卡片，正式版允许更换轮播图（需要图床链接）。
:::

关注公众号【御坂网络 Misaka】，通知快人一步！

阅读公众号置顶文章，图文教程！

## 一、先做什么？

和 [开源版教程](./miniprogram.md) 一样，只需要跳过 **上传小程序代码** 步骤，这步由我们来完成！

## 二、填问卷自动上传小程序代码

[问卷链接](https://misaka-network.feishu.cn/share/base/form/shrcnXqq4R4neOKTGy3SKMtfUta) 请在电脑端打开，手机粘贴有问题。

支持修改填写记录，请勿重复填！
打开微信公众平台，点击侧边 [管理](#) 中的 [开发管理](#)

需要从微信公众平台获得的：

+ `AppID(小程序ID)` 明文，直接复制进问卷
+ `AppSecret(小程序密钥)` 密钥，长度为32的字符串
+ `小程序代码上传密钥` 密钥，以`.key`结尾文本文件，使用 Windows记事本 或 Mac预览 打开，并完整复制到问卷中！

需要操作的：

- 请关闭两处的 `IP白名单` 按钮 (开发者ID 和 小程序代码上传的)

## 常见错误

+ ❌ 把 `AppSecret(小程序密钥)` 和 `小程序代码上传密钥` 混淆，弄反。
+ ❌ 用 QQ、微信 转发 `小程序代码上传密钥`，因其中的转义符变成表情包，导致损坏。（应该直接在电脑填）
+ ❌ 擅自把 `小程序代码上传密钥` 的前后两行删除，导致密钥无效。
+ ❌ 小程序类目选成 游戏类目，导致不支持。
+ ❌ 未关闭IP白名单。
+ ❌ 发现错误后，换了个飞书账号又填一遍，导致去重时随机忽略一个 `AppID`。 

## 小程序上传结果

[上传结果链接](https://doc.micono.eu.org/advance/upload.html) 可能会更换链接

## 使用小程序

+ 务必打开开发调试（点击小程序右上角三点，右下角划到最右边）。

不会用？看视频教程吧！[前往视频教程](../guide/video.md)

## 为什么要自建小程序？

2024年4月，某人才举报了大量相关小程序，建议自建小程序备用！

## 半屏小程序

在 `账号设置` > `第三方设置` > `半屏小程序管理` 中添加

+ 御坂网络 `wxb42fe32e6e071916`
+ 腾讯频道 `wxf6b0c0f50d040b4c`
+ 腾讯问卷 `wxebadf544ddae62cb`
+ 腾讯文档 `wxd45c635d754dbf59`
+ 腾讯投票 `wxa2ad902d74975650`
