<center><div align="center">

<img src="https://avatars.githubusercontent.com/u/163529042?v=4" width="300" height="300" style="border-radius: 50%"></img>

<img alt="stars" src="https://img.shields.io/github/stars/Misaka-1314/Chaoxing-MiniProgram.svg?style=for-the-badge&label=Stars&logo=undertale&logoColor=orange&color=orange"/></img>
<img alt="forks" src="https://img.shields.io/github/forks/Misaka-1314/Chaoxing-MiniProgram.svg?style=for-the-badge&label=Forks&logo=stackshare&logoColor=f92f60&color=f92f60"/></img>
<img alt="pr" src="https://img.shields.io/github/issues-pr-closed/Misaka-1314/Chaoxing-MiniProgram.svg?style=for-the-badge&label=PR&logo=addthis&logoColor=green&color=0AC18E"/></img>
<img alt="issues" src="https://img.shields.io/github/issues/Misaka-1314/Chaoxing-MiniProgram.svg?style=for-the-badge&label=Issues&logo=openbugbounty&logoColor=e38dff&color=e38dff"/></img>

</div></center>

<center><div align="center">

<img alt="status" src="https://uptime.betterstack.com/status-badges/v1/monitor/29xsn.svg"/></img>

</div></center>

<div align="center" style="font-weight:bold"><b>学习通快捷签到 自建微信小程序，签到如此简单！<a href="https://doc.micono.eu.org">阅读文档</a></b></div>  

## ✨ 历程

+ 2024/03 我们开发了本项目，无需后端即可使用。
+ 2024/04 学习通的 mobilelearn 子域拦截UA中含有小程序的请求, 只能由服务器转发请求, 本项目失去了无后端开发的优势，暂停维护。
+ 2024/06 某人才同行大量举报学习通签到小程序。
+ 2024/09 基于本项目的小程序被举报封号，我们启动了自建小程序方案，鼓励用户注册小程序自用。
+ 2024/09 学习通官方以内容侵权为由投诉多个公众号的文章。
+ 2024/10 我们计划重启开源版本。
+ 2024/12 截至 2025年11月22日的 [小程序上传数据](https://doc.micono.eu.org/advance/no-open/upload-result.html)，已有1228个小程序成功上传，另有部分用户填写错误。有需要的同学可以填写问卷！
+ 2025/06 借助云边缘函数与 Cloudflare Worker，可以无需服务器转发请求，但此方案成本过高。
+ 2025/11 学习通加强了流控策略，大量用户收到 [LT1]操作失败 限流响应，我们在第一时间增加了代理IP数量。
+ 2025/11 经过我们的测试发现，部分教育网的流控策略较为宽松，甚至 500 QPS 仍未监测到限流异常，我们开始策划 [边缘代理](https://github.com/Misaka-1314/Chaoxing-EdgeProxy) 方案。
+ 2025/11 2025年11月17日上午10点59分，我们监控到学习通部分服务开始故障，随后所有服务崩溃，下午2点逐步恢复。学习通声称是运营商光缆故障，但我们认为与限流代码有关。
+ NOW 我们不再维护开源版，仅持续维护非开源版，因为我们依靠非开源版中的广告获得收益。

## 🎃 免责声明

本项目仅作为交流学习使用，通过本项目加深网络通信、接口编写、交互设计等方面知识的理解。
任何人或组织使用项目中代码进行的任何违法行为与本人无关。如有触及相关平台规定或者权益，烦请联系 [邮箱](mailto:complaint@micono.eu.org) 改正。

> 2022年2月11日，教育部等五部门关于加强普通高校在线客服课程教学管理的若干意见要求，严禁以任何形式传播考试内容及答案作弊手法。因此本项目不提供任何考试或作业答案！

## 🎉 版本对比

<table style="text-align: center" align="center">
    <tr>
        <th colspan="2">版本对比</th>
        <th>开源版</th>
        <th>
            <div>非开源版</div>
            <div>（普通用户）</div>
        </th>
        <th>
            <div>非开源版</div>
            <div>（会员用户）</div>
        </th>
    </tr>
    <tr>
        <td rowspan="7">签到功能</td>
        <td>位置签到</td>
        <td>地图自选位置</td>
        <td>地图自选位置</td>
        <td>一键获取教师设置的位置</td>
    </tr>
    <tr>
        <td>拍照签到</td>
        <td>上传任意图片</td>
        <td>上传任意图片</td>
        <td>一键借用同学签到照片</td>
    </tr>
    <tr>
        <td>手势签到</td>
        <td>可自行输入手势</td>
        <td>无需手势签到</td>
        <td>一键查看手势</td>
    </tr>
    <tr>
        <td>签到码签到</td>
        <td>可自行输入签到码</td>
        <td>无需签到码签到</td>
        <td>一键查看签到码</td>
    </tr>
    <tr>
        <td>二维码签到</td>
        <td>不支持绕过二维码，但可解决单手机签一人</td>
        <td>不支持绕过二维码</td>
        <td>不支持绕过二维码，但扫一次可签多用户</td>
    </tr>
    <tr>
        <td>群聊签到</td>
        <td>不支持</td>
        <td colspan="2">支持</td>
    </tr>
    <tr>
        <td>应用中心签到</td>
        <td>不支持</td>
        <td colspan="2">支持签到，但看不到签到结果</td>
    </tr>
    <tr>
        <td rowspan="2">其他差异</td>
        <td>滑块验证码</td>
        <td><a href="https://github.com/Misaka-1314/Chaoxing-MiniProgram/blob/39c95d5b4a20ce4e8b4f8e3ed7bd038cc15b4490/miniprogram/pages/home/home.js#L165">可接入免费接口</a></td>
        <td>支持自动通过</td>
        <td>支持自动通过</td>
    </tr>
    <tr>
        <td>多用户</td>
        <td>不支持</td>
        <td>可登录多账号，随时切换</td>
        <td>可一键为多账号签到</td>
    </tr>
    <tr>
        <td colspan="2">使用方式 / 用户协议</td>
        <td><a href="https://github.com/Misaka-1314/Chaoxing-MiniProgram/blob/main/LICENSE">GPLv3许可证</a></td>
        <td colspan="2">原则上仅供您和朋友使用，禁止倒卖/滥用</td>
    </tr>
    <tr>
        <td rowspan="2">部署教程</td>
        <td>服务端</td>
        <td><a href="https://doc.micono.eu.org/advance/open/server.html">自行部署教程</a></td>
        <td colspan="2">使用项目开发者的服务器</td>
    </tr>
    <tr>
        <td>小程序端</td>
        <td><a href="https://doc.micono.eu.org/advance/open/develop.html">自行部署教程</a></td>
        <td colspan="2">填写问卷并提供上传密钥</td>
    </tr>
    <tr>
        <td colspan="2">价格</td>
        <td>免费</td>
        <td>免费</td>
        <td>
            <div>免费</div>
            <div>（仅支持通过激励广告获取）</div>
        </td>
    </tr>
</table>


> 请注意：GPLv3 具有“传染性”，即在您开发的软件中使用 GPLv3 自由软件的整体或部分，都将使您的软件也变成 GPLv3 自由软件。

## 🗒️ 页面展示

#### 开源版

|                                                        **登录页**                                                        |                                                      **课程列表页**                                                      |                                                      **签到列表页**                                                      |                                                      **定位签到页**                                                      |                                                      **拍照签到页**                                                      |
| :----------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: |
| <div align="center"> <img src="https://github.com/user-attachments/assets/4e7bbb6b-cde4-4767-860b-f33c4a9fdb9c"/> </div> | <div align="center"> <img src="https://github.com/user-attachments/assets/f7179f80-e0cc-4eb8-bd8e-89b9465fa088"/> </div> | <div align="center"> <img src="https://github.com/user-attachments/assets/1c201277-8374-496f-b986-ea84a1fd659a"/> </div> | <div align="center"> <img src="https://github.com/user-attachments/assets/126dd771-215b-4f6d-a95a-d0c191398b1d"/> </div> | <div align="center"> <img src="https://github.com/user-attachments/assets/dfeab9f7-b155-4514-9519-2a8caf7dae44"/> </div> |

#### 非开源版

|                                                         **首页**                                                         |                                                        **登录页**                                                        |                                                    **批量扫码签到页**                                                    |                                                      **课程列表页**                                                      |
| :----------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: |
| <div align="center"> <img src="https://github.com/user-attachments/assets/6d354e43-6a51-4e70-8d3c-e8b53d52e625"/> </div> | <div align="center"> <img src="https://github.com/user-attachments/assets/71ef9c44-309b-489e-9ef7-4f08e3840d91"/> </div> | <div align="center"> <img src="https://github.com/user-attachments/assets/d73b4df3-c43f-4a6a-8f38-46e661654652"/> </div> | <div align="center"> <img src="https://github.com/user-attachments/assets/fb7c4141-330c-483e-8c1f-2461e0361bfb"/> </div> |

|                                                      **签到列表页**                                                      |                                                      **手势签到页**                                                      |                                                      **拍照签到页**                                                      |                                                      **定位签到页**                                                      |
| :----------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: |
| <div align="center"> <img src="https://github.com/user-attachments/assets/b3bbd3b8-d359-4c2a-be7d-aa3bce4c47f9"/> </div> | <div align="center"> <img src="https://github.com/user-attachments/assets/e2539952-d160-48ab-a99b-1e70234f16b6"/> </div> | <div align="center"> <img src="https://github.com/user-attachments/assets/63f9c939-7334-4c0b-8efd-d7a3db6d09cf"/> </div> | <div align="center"> <img src="https://github.com/user-attachments/assets/6807e267-10bd-49c0-9ea7-69b778ab5556"/> </div> |

## 🎗️ 交流学习

[加入用户交流群](https://doc.micono.eu.org/guide/)

> 我们依靠非开源版中的广告获得收益，未来可能提供更多增值服务。但已有的免费签到渠道永远不会关闭！

> 无论选择哪种版本，部署及使用过程均未收取任何费用，如果您遭到欺骗，请立即申请退款！

## 🏆 特别鸣谢

+ 本项目的 CDN 加速和安全保护由 [腾讯 EdgeOne](https://edgeone.ai/?from=github) 赞助！
