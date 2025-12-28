<!-- Script Setup -->
<script setup lang="js">
import { ref, reactive, onMounted } from 'vue';
import { NForm, NFormItem, NInput, NButton, NSpace, NText, useMessage } from 'naive-ui';

const host = "https://task.micono.eu.org";
const message = useMessage();
const form = reactive({});
const formRef = ref(null);

const rules = {
    appid: {
        required: true,
        trigger: ["blur", "input"],
        validator(rule, value) {
            if (value.length !== 18 || !value.startsWith("wx")) {
                return new Error("AppID 明显错误，请检查");
            }
            return true;
        },
    },

    secret: {
        required: true,
        trigger: ["blur"],
        validator(rule, value) {
            return new Promise((resolve, reject) => {
                const appid = form.appid;

                if (!appid || appid.length !== 18 || !appid.startsWith("wx")) {
                    return reject(new Error("请先填写正确格式的 AppID"));
                }

                if (value.length !== 32) {
                    return reject(new Error("AppSecret 明显错误，请检查"));
                }

                fetch(`/api/weixin/token?appid=${appid}&secret=${value}`)
                    .then(async resp => {
                        const res = await resp.json();
                        if (res.access_token)
                            resolve();
                        else
                            reject(new Error(`验证失败：${res.errmsg || "无效的凭证"}`));

                    })
                    .catch(() => reject(new Error("无法连接验证服务器，请检查网络")));
            });
        },
    },

    key: {
        required: true,
        trigger: ["blur"],
        validator(rule, value) {
            if (!value || value.length < 500) {
                return new Error("密钥内容过短，请检查是否复制完整");
            }
            return true;
        },
    },

    mobile: {
        required: true,
        trigger: ["blur", "input"],
        validator(rule, value) {
            if (!/^1[3-9]\d{9}$/.test(value)) {
                return new Error("手机号明显错误，请检查");
            }
            return true;
        },
    },

    name: {
        required: true,
        trigger: ["blur", "input"],
        validator(rule, value) {
            if (!value) {
                return new Error("需要填写小程序名称");
            }
            return true;
        },
    },
};

const readKeyFile = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.key';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.onchange = e => {
        console.info("选择文件", e)
        const file = e.target.files[0];
        if (!file) {
            console.info("没有选择文件")
            return;
        }
        const reader = new FileReader();
        reader.onload = event => {
            console.info("读取文件", event);
            form.key = event.target.result;
            console.info(form.key);
        }
        reader.onerror = () =>
            console.error('文件读取失败:', reader.error);
        reader.readAsText(file);
    };
    fileInput.onerror = e => console.error('文件选择失败', e);
    fileInput.click();
}

const submit = e => {
    formRef.value.validate((errors, { warnings }) => {
        if (errors) {
            message.error("请检查输入内容！");
            return;
        }
        const body = {
            "appid": form.appid.trim(),
            "secret": form.secret.trim(),
            "key": form.key.trim(),
            "mobile": form.mobile.trim(),
            "name": form.name.trim(),
            "turnstile": form.turnstile,
        };
        localStorage.setItem("upload_form", JSON.stringify(body));
        fetch(`${host}/api/scheduler/public/tasks`, {
            "method": "PUT",
            "headers": {
                "Content-Type": "application/json",
            },
            "body": JSON.stringify(body),
        })
            .then(resp => resp.json())
            .then(res => {
                console.info("提交小程序", body, res);
                message.info(res.msg);
                if (res.status == 0)
                    form.status = "success";
            })
    });
};

onMounted(() => {
    const savedForm = localStorage.getItem("upload_form");
    if (savedForm) {
        const parsedData = JSON.parse(savedForm);
        Object.assign(form, parsedData);
    }

    window.onTurnstileSuccess = token => {
        form.turnstile = token;
    }
});

</script>

<!-- HTML -->
<template>
    <NForm :model="form" ref="formRef" label-placement="top" :rules="rules">
        <NFormItem path="appid">
            <template #label>
                <NSpace>
                    <NText>AppID</NText>
                </NSpace>
            </template>
            <NInput v-model:value.trim="form.appid" placeholder="请复制并粘贴 AppID" />
        </NFormItem>
        <NFormItem path="secret">
            <template #label>
                <NSpace>
                    <NText>AppSecret</NText>
                    <NText :depth="3">自行收藏好，后续需要用到</NText>
                </NSpace>
            </template>
            <NInput v-model:value.trim="form.secret" placeholder="请复制并粘贴 AppSecret" />
        </NFormItem>
        <NFormItem path="key">
            <template #label>
                <NSpace>
                    <NText>小程序代码上传密钥</NText>
                    <NButton size="tiny" @click="readKeyFile">从文件中读取</NButton>
                </NSpace>
            </template>
            <NInput v-model:value="form.key" type="textarea" readonly placeholder="点击上方按钮从文件中读取" />
        </NFormItem>
        <NFormItem path="mobile">
            <template #label>
                <NSpace>
                    <NText>手机号</NText>
                    <NText :depth="3">你的学习通手机号，用于管理此小程序</NText>
                </NSpace>
            </template>
            <NInput v-model:value.trim="form.mobile" placeholder="请输入手机号" />
        </NFormItem>
        <NFormItem path="name">
            <template #label>
                <NSpace>
                    <NText>小程序名称</NText>
                    <NText :depth="3">仅用于备注</NText>
                </NSpace>
            </template>
            <NInput v-model:value.trim="form.name" placeholder="请输入小程序名称" />
        </NFormItem>
        <NFormItem label="证明你是人" path="turnstile">
            <div class="cf-turnstile" size="flexible" data-sitekey="0x4AAAAAACITxajFbe2aEfkS"
                data-callback="onTurnstileSuccess"></div>
        </NFormItem>
        <NButton type="primary" v-if="form?.status == 'success'" block disabled>已提交成功</NButton>
        <NButton type="primary" v-else block @click.prevent="submit">提交</NButton>
    </NForm>
</template>

<!-- Style -->
<style scoped></style>