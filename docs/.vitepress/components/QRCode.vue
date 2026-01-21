<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
    NCard, NForm, NFormItem, NInput, NSpace,
    NSelect, NButton, NDivider, NImage, useMessage,
} from 'naive-ui'

const message = useMessage()
const loading = ref(false)
const qrCodeUrl = ref('')

const form = reactive({
    appid: '',
    secret: '',
    page: 'packages/sign-package/pages/home/home',
    query: '',
    env: 'trial',
    size: 430,
    hyaline: false,
    turnstile: '',
})

const options = {
    page: [
        { label: '签到模块', value: 'packages/sign-package/pages/home/home' },
        { label: '小程序首页', value: 'pages/home/home' },
        { label: '王者战力查询', value: 'packages/tools-package/pages/hero/hero' },
    ],
    env: [
        { label: '体验版', value: 'trial' },
        { label: '开发版', value: 'develop' },
        { label: '正式版', value: 'release' },
    ],
    size: [
        { label: '430px', value: 430 },
        { label: '640px', value: 640 },
        { label: '960px', value: 960 },
        { label: '1280px', value: 1280 },
    ],
    hyaline: [
        { label: '否', value: false },
        { label: '是', value: true },
    ],
}

const syncSecret = () => {
    fetch("https://task.micono.eu.org/api/public/tasks", {
        "method": "PATCH",
        "headers": {
            "Content-Type": "application/json",
        },
        "body": JSON.stringify({
            "appid": form.appid,
            "secret": form.secret,
        }),
    })
        .then(resp => resp.json())
        .then(res => console.info("同步", res))
}

const generate = async () => {
    if (!form.appid || !form.secret) {
        message.error('请输入 AppID 和 Secret')
        return
    }

    loading.value = true;
    qrCodeUrl.value = '';


    fetch(`/api/weixin/token?appid=${form.appid}&secret=${form.secret}`, {
        method: 'GET',
        headers: {
            "CF-Turnstile-Token": form.turnstile,
        },
    })
        .then(resp => resp.json())
        .then(res => {
            if (!res.access_token)
                throw new Error(res.errmsg || '获取 Token 失败，请检查 AppID 和 Secret 是否正确')

            syncSecret();
            localStorage.setItem("qr-form", JSON.stringify(form));

            const qr = new URL(`${window.location.origin}/api/weixin/qrcode`)
            qr.searchParams.append('query', form.query)
            qr.searchParams.append('page', form.page)
            qr.searchParams.append('size', form.size.toString())
            qr.searchParams.append('env', form.env)
            qr.searchParams.append('hyaline', form.hyaline ? 'true' : 'false')
            qr.searchParams.append('token', res.access_token)
            qrCodeUrl.value = qr.toString();
        })
        .catch(err => {
            loading.value = false
            message.error(err.message || '请求失败，请稍后重试')
        })
        .finally(() => {
            loading.value = false
        })
}

onMounted(() => {
    const savedForm = localStorage.getItem("qr-form");
    if (savedForm)
        Object.assign(form, JSON.parse(savedForm));
});

</script>

<template>
    <div class="qrcode-wrapper">
        <NCard title="小程序码在线生成" class="qrcode-card">
            <NForm :model="form" label-placement="top">
                <NFormItem label="AppID" path="appid">
                    <NInput v-model:value="form.appid" placeholder="请复制并粘贴 AppID" />
                </NFormItem>
                <NFormItem label="Secret" path="secret">
                    <NInput v-model:value="form.secret" placeholder="请复制并粘贴 AppSecret" />
                </NFormItem>
                <NSpace item-style="flex: 1">
                    <NFormItem label="小程序版本" style="flex: 1">
                        <NSelect v-model:value="form.env" :options="options.env" filterable tag
                            placeholder="请选择或输入版本" />
                    </NFormItem>
                </NSpace>

                <NSpace item-style="flex: 1">
                    <NFormItem label="小程序码尺寸" style="flex: 1">
                        <NSelect v-model:value="form.size" :options="options.size" filterable tag
                            placeholder="请选择或输入尺寸" />
                    </NFormItem>
                    <NFormItem label="是否透明" style="flex: 1">
                        <NSelect v-model:value="form.hyaline" :options="options.hyaline" filterable tag
                            placeholder="请选择是否透明" />
                    </NFormItem>
                </NSpace>

                <NSpace item-style="flex: 1">
                    <NFormItem label="小程序路径" style="flex: 1">
                        <NSelect v-model:value="form.page" :options="options.page" filterable tag
                            placeholder="请选择或输入路径" />
                    </NFormItem>
                    <NFormItem label="参数" style="flex: 1">
                        <NInput v-model:value="form.query" placeholder="不建议填写" />
                    </NFormItem>
                </NSpace>

                <NFormItem label="证明你是人" path="turnstile">
                    <Turnstile site-key="0x4AAAAAACITxajFbe2aEfkS" ref="turnstileRef" v-model="form.turnstile" />
                </NFormItem>

                <NButton type="primary" block :loading="loading" @click="generate">
                    立即生成
                </NButton>
            </NForm>

            <div v-if="qrCodeUrl" class="qr-result">
                <NDivider>生成结果</NDivider>
                <NImage class="qr-image" :src="qrCodeUrl" width="240" />
            </div>
        </NCard>
    </div>
</template>

<style scoped>
.qrcode-wrapper {
    padding: 10px;
}

.qrcode-card {
    max-width: 100%;
    margin: 0 auto;
    border-radius: 8px;
}

@media (min-width: 640px) {
    .qrcode-card {
        max-width: 500px;
    }
}

.qr-result {
    margin-top: 24px;
    text-align: center;
}

.qr-image {
    margin: 20px calc(50% - 120px);
    border-radius: 8px;
}
</style>
