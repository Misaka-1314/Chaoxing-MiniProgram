<!-- Script Setup -->
<script setup lang="js">
import { ref } from 'vue';
import { NForm, NFormItem, NInput, NButton } from 'naive-ui';


const host = "https://cx.micono.eu.org";
const form = ref({})

const rules = {
    appid: {
        required: true,
        validator(rule, value) {
            form.value.status = "";
            let _value = (value || "").trim();
            if (!_value)
                return new Error("需要填写 AppID");
            else if (!_value.startsWith("wx") || _value.length != 18)
                return new Error("AppID 格式不正确");
            return true;
        },
        trigger: ["blur"],
    },
    secret: {
        required: true,
        validator: (rule, value) => {
            return new Promise((resolve, reject) => {
                let _value = (value || "").trim();
                if (!form.value.appid || form.value.appid.length !== 18)
                    reject("请先填写上方的 AppID");
                else if (!_value)
                    reject("需要填写 AppSecret");
                else if (_value.length != 32)
                    reject("AppSecret 格式不正确");
                else
                    fetch(`${host}/api/weixin/token?appid=${form.value.appid}&secret=${_value}`)
                        .then(resp => resp.json())
                        .then(res => {
                            if (res.access_token)
                                resolve();
                            else
                                reject(`验证失败：${res.errmsg}`);
                        })
                        .catch(err => resolve())
            });
        },
        trigger: ["blur"],
    },
    key: {
        required: true,
        validator(rule, value) {
            if (!value)
                return new Error("需要小程序代码上传密钥");
            else if (value.length < 1000)
                return new Error("小程序代码上传密钥格式不正确");
            return true;
        },
    },
    mobile: [{
        required: true,
        validator: (rule, value) => {
            let _value = (value || "").trim();
            if (!_value)
                return new Error("需要填写手机号");
            else if (_value.length != 11)
                return new Error("手机号格式不正确");
            return true;
        },
        trigger: ["blur"],
    }, {
        level: 'warning',
        validator: (rule, value) => {
            let _value = (value || "").trim();
            if (!_value.startsWith("1"))
                return new Error("填错手机号将无法进入小程序自定义信息修改页");
            return true;
        },
        trigger: ["blur"],
    }]
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
            alert("请检查输入内容！")
            return;
        }
        const body = {
            "appid": form.value.appid.trim(),
            "secret": form.value.secret.trim(),
            "key": form.value.key.trim(),
            "mobile": form.value.mobile.trim(),
            "name": form.value.name.trim(),
        };
        fetch(`${host}/api/task/submit`, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
            },
            "body": JSON.stringify(body),
        })
            .then(resp => resp.json())
            .then(res => {
                console.info("提交小程序", body, res);
                alert(res.msg)
                if (res.status == 0)
                    form.value.status = "success", form.value = { ...form.value };
            })
    });
};

</script>

<!-- HTML -->
<template>
    <div class="container">
        <NForm :model="form" ref="form" label-placement="top" :rules="rules">
            <NFormItem label="appid" path="appid">
                <template #label>
                    <span class="label-title">AppID</span>
                </template>
                <NInput v-model:value="form.appid" placeholder="请复制并粘贴 AppID" />
            </NFormItem>
            <NFormItem label="secret" path="secret">
                <template #label>
                    <span class="label-title">AppSecret</span>
                </template>
                <NInput v-model:value="form.secret" placeholder="请复制并粘贴 AppSecret" />
            </NFormItem>
            <NFormItem label="key" path="key">
                <template #label>
                    <span class="label-title">小程序代码上传密钥</span>
                    <NButton class="label-description" @click="readKeyFile">从文件中读取</NButton>
                </template>
                <NInput v-model:value="form.key" type="textarea" readonly placeholder="点击上方按钮从文件中读取" />
            </NFormItem>
            <NFormItem label="mobile" path="mobile">
                <template #label>
                    <span class="label-title">手机号</span>
                    <span class="label-description">你的学习通手机号，用于管理此小程序</span>
                </template>
                <NInput v-model:value="form.mobile" placeholder="请输入手机号" />
            </NFormItem>
            <NFormItem label="name" path="name">
                <template #label>
                    <span class="label-title">小程序名称</span>
                    <span class="label-description">（选填）</span>
                </template>
                <NInput v-model:value="form.name" placeholder="请输入小程序名称" />
            </NFormItem>
            <NButton type="primary" size="large" v-if="form?.status == 'success'" block disabled>已提交成功
            </NButton>
            <NButton type="primary" size="large" v-else block @click.prevent="submit">提交</NButton>
        </NForm>
    </div>
</template>

<!-- Style -->
<style scoped>
.container {
    padding: 24px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
}

.label-title {
    margin: 8px 0;
    font-size: 16px;
    font-weight: 600;
}

.label-description {
    margin: 8px 0;
    margin-left: 8px;
    font-size: 12px;
    font-weight: 600;
    opacity: 0.6;
}

.width-font {
    font-family: "Courier New", Consolas, monospace;
}
</style>
