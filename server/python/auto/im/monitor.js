const WebSocket = require('ws');
const jsdom = require('jsdom');
const axios = require('axios');
const fs = require('fs');

const JSDOM = new jsdom.JSDOM('', { url: 'https://im.chaoxing.com/webim/me' });
globalThis.window = JSDOM.window;
globalThis.WebSocket = WebSocket;
globalThis.location = JSDOM.window.location;

const webIM = require('./websdk3.1.4.js').default;
const args = process.argv.slice(2);

const conn = new webIM.connection({
    isMultiLoginSessions: true,
    https: true,
    url: "https://im-api-vip6-v2.easecdn.com/ws",
    apiUrl: "https://a1-vip6.easecdn.com",
    isAutoLogin: true,
    heartBeatWait: 4500,
    autoReconnectNumMax: 2,
    autoReconnectInterval: 2,
    appKey: "cx-dev#cxstudy",
    isHttpDNS: false,
});

const formatDate = date => {
    const pad = n => n.toString().padStart(2, '0');
    return (
        date.getFullYear() + '-' +
        pad(date.getMonth() + 1) + '-' +
        pad(date.getDate()) + ' ' +
        pad(date.getHours()) + ':' +
        pad(date.getMinutes()) + ':' +
        pad(date.getSeconds())
    );
}

const logger = (...msg) => {
    if (!fs.existsSync("log")) fs.mkdirSync("log", { recursive: true });
    console.info("✨ INFO", formatDate(new Date()), ...msg);
    const message = msg.map(i => JSON.stringify(i)).join(' ');
    fs.appendFileSync(`log/${args[0]}.log`, `[${formatDate(new Date())}] ${message}\n`);
}

const send = data => {
    const activeId = data.activeId;
    axios.post(`http://localhost:8000/api/users/${args[0]}/actives/${activeId}`, data, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

logger('[进程启动]', `UID: ${args[0]} USER: ${args[1]} PWD: ${args[2]}`);

conn.open({
    apiUrl: "https://a1-vip6.easecdn.com",
    user: args[1],
    pwd: args[2],
    appKey: "cx-dev#cxstudy",
});

conn.listen({
    onOpened: () => {
        logger('[监听开启]');
    },
    onClosed: () => {
        logger('[监听停止]');
        process.exit(0);
    },
    onTextMessage: async (message) => {
        logger('[收到消息]', message);

        const attachment = message?.ext?.attachment || {};
        if (attachment?.attachmentType != 15)
            return;
        if (attachment?.att_chat_course?.type != 1)
            return;
        if (attachment?.att_chat_course?.aid == 0)
            return;

        if (attachment.att_chat_course.url.includes("mobilelearn.chaoxing.com/newsign/preSign")) { // 课程签到 or 班级签到
            const classId = attachment.att_chat_course.courseInfo.classid;
            const courseId = attachment.att_chat_course.courseInfo.courseid;
            const activeId = attachment.att_chat_course.aid;
            send({
                "activeId": activeId,
                "classId": classId,
                "courseId": courseId,
                'raw': message,
            });
        } else if (attachment.att_chat_course.url.includes("mobilelearn.chaoxing.com/sign/preSign")) { // 群聊签到
            const activeId = attachment.att_chat_course.aid;
            send({
                "activeId": activeId,
                'raw': message,
            });
        }
    },
    onError: (msg) => {
        logger('[发生异常]', msg);
        process.exit(0);
    },
});

