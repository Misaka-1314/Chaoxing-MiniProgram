<!-- Script Setup -->
<script setup lang="js">
import { ref, onMounted } from 'vue';
import { NForm, NFormItem, NInput, NButton, NSpace, NText, useMessage } from 'naive-ui';

const host = "https://task.micono.eu.org";
const message = useMessage();
const form = ref({})

const rules = {
    appid: {
        required: true,
        trigger: ["blur", "input"],
        validator(rule, value) {
            const _value = (value || "").trim();
            if (!_value) return new Error("需要填写 AppID");

            if (_value.length !== 18 || !_value.startsWith("wx"))
                return new Error("AppID 明显错误，请检查");

            return true;
        },
    },
    secret: {
        required: true,
        trigger: ["blur"],
        validator: (rule, value) => {
            return new Promise((resolve, reject) => {
                const _value = (value || "").trim();
                const appid = (form.value.appid || "").trim();

                if (!appid || appid.length !== 18) {
                    return reject("请先填写正确格式的 AppID");
                }
                if (!_value) return reject("需要填写 AppSecret");
                if (_value.length !== 32) return reject("AppSecret 明显错误，请检查");

                fetch(`/api/weixin/token?appid=${appid}&secret=${_value}`)
                    .then(async resp => {
                        const res = await resp.json();
                        if (res.access_token)
                            resolve();
                        else
                            reject(`验证失败：${res.errmsg || '无效的凭证'}`);
                    })
                    .catch(err => {
                        reject("无法连接验证服务器，请检查网络");
                    })
            });
        },
    },
    key: {
        required: true,
        trigger: ["blur"],
        validator(rule, value) {
            if (!value) return new Error("需要小程序代码上传密钥");
            if (value.trim().length < 500)
                return new Error("密钥内容过短，请检查是否复制完整");
            return true;
        },
    },
    mobile:
    {
        required: true,
        trigger: ["blur", "input"],
        validator: (rule, value) => {
            const _value = (value || "").trim();
            if (!_value) return new Error("需要填写手机号");
            if (!/^1[3-9]\d{9}$/.test(_value)) {
                return new Error("手机号明显错误，请检查");
            }
            return true;
        },
    },
    name: {
        required: true,
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
            form.value.key = event.target.result;
            form.value = { ...form.value };
            console.info(form.value.key);
        }
        reader.onerror = () =>
            console.error('文件读取失败:', reader.error);
        reader.readAsText(file);
    };
    fileInput.onerror = e => console.error('文件选择失败', e);
    fileInput.click();
}

const submit = e => {
    form.value?.validate((errors, { warnings }) => {
        if (errors) {
            message.error("请检查输入内容！");
            return;
        }
        const body = {
            "appid": form.value.appid.trim(),
            "secret": form.value.secret.trim(),
            "key": form.value.key.trim(),
            "mobile": form.value.mobile.trim(),
            "name": form.value.name.trim(),
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
                    form.value.status = "success", form.value = { ...form.value };
            })
    });
};

onMounted(() => {
    const savedForm = localStorage.getItem("upload_form");
    if (savedForm) {
        form.value = JSON.parse(savedForm);
    }
});

</script>

<!-- HTML -->
<template>
    <NForm :model="form" ref="form" label-placement="top" :rules="rules">
        <NFormItem label="appid" path="appid">
            <template #label>
                <NSpace>
                    <NText>AppID</NText>
                </NSpace>
            </template>
            <NInput v-model:value="form.appid" placeholder="请复制并粘贴 AppID" />
        </NFormItem>
        <NFormItem label="secret" path="secret">
            <template #label>
                <NSpace>
                    <NText>AppSecret</NText>
                    <NText :depth="3">自行收藏好，后续需要用到</NText>
                </NSpace>
            </template>
            <NInput v-model:value="form.secret" placeholder="请复制并粘贴 AppSecret" />
        </NFormItem>
        <NFormItem label="key" path="key">
            <template #label>
                <NSpace>
                    <NText>小程序代码上传密钥</NText>
                    <NButton size="tiny" @click="readKeyFile">从文件中读取</NButton>
                </NSpace>
            </template>
            <NInput v-model:value="form.key" type="textarea" readonly placeholder="点击上方按钮从文件中读取" />
        </NFormItem>
        <NFormItem label="mobile" path="mobile">
            <template #label>
                <NSpace>
                    <NText>手机号</NText>
                    <NText :depth="3">你的学习通手机号，用于管理此小程序</NText>
                </NSpace>
            </template>
            <NInput v-model:value="form.mobile" placeholder="请输入手机号" />
        </NFormItem>
        <NFormItem label="name" path="name">
            <template #label>
                <NSpace>
                    <NText>小程序名称</NText>
                    <NText :depth="3">仅用于备注</NText>
                </NSpace>
            </template>
            <NInput v-model:value="form.name" placeholder="请输入小程序名称" />
        </NFormItem>
        <div class="cf-turnstile" size="flexible" data-sitekey="0x4AAAAAACITxajFbe2aEfkS"></div>
        <NButton type="primary" v-if="form?.status == 'success'" block disabled>已提交成功</NButton>
        <NButton type="primary" v-else block @click.prevent="submit">提交</NButton>
    </NForm>
</template>

<!-- Style -->
<style scoped></style>