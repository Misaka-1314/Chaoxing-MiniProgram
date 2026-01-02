<script setup>
import { ref, onMounted } from 'vue';
import {
    NCard, NDescriptions, NDescriptionsItem, NTag, NText,
    NInput, NButton, NSpace, NSpin, useMessage
} from 'naive-ui';

const message = useMessage()

const uid = ref('')
const name = ref('')
const deviceCode = ref('')
const loading = ref(true)

const loadExternalScript = (src) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve()
            return
        }
        const script = document.createElement('script')
        script.src = src
        script.onload = resolve
        script.onerror = reject
        document.body.appendChild(script)
    })
}

const getDeviceInfo = async () => {
    loading.value = true
    uid.value = ''
    name.value = ''
    deviceCode.value = ''

    try {
        window.AppUtils.getUserInfo('', res => {
            uid.value = res?.puid || '获取失败';
            name.value = res?.name || '获取失败';

            window.jsBridge.bind('CLIENT_DEVICE_FLAG', object => {
                loading.value = false;

                if (!object || !object.flagInfo)
                    return message.error('未获取到设备特征码')

                deviceCode.value = object.flagInfo.replace(/[\r\n]+$/, '')
                message.success('设备信息获取成功')
            })
            window.jsBridge.postNotification('CLIENT_DEVICE_FLAG', {})
        })
    } catch (err) {
        loading.value = false
        console.info("获取失败", err)
        message.error(`获取信息失败：${err}`)
    }
}

const copyDeviceCode = async () => {
    if (!deviceCode.value) return
    try {
        await navigator.clipboard.writeText(deviceCode.value)
        message.success('设备特征码已复制')
    } catch {
        message.error('复制失败，请手动复制')
    }
}

onMounted(async () => {
    await loadExternalScript('https://mobilelearn-static.chaoxing.com/mobilelearn/js/jquery.min.js')
    await loadExternalScript('https://mobilelearn-static.chaoxing.com/mobilelearn/front/mobile/sign/js/CXJSBridge.js')
    await loadExternalScript('https://mobilelearn-static.chaoxing.com/mobilelearn/front/mobile/common/app.utils.js')
    loading.value = false;
})
</script>

<template>
    <NCard title="学习通设备特征码获取" :bordered="false" class="custom-card">
        <NSpin :show="loading">
            <NDescriptions bordered label-placement="left" :column="1" size="large" class="custom-descriptions"
                label-style="width: 100px">
                <NDescriptionsItem label="用户 UID">
                    <NText type="info" strong>
                        {{ uid || '等待获取...' }}
                    </NText>
                </NDescriptionsItem>

                <NDescriptionsItem label="用户姓名">
                    <NTag type="success" :bordered="false" v-if="name">
                        {{ name }}
                    </NTag>
                    <span v-else style="color: #999">未获取</span>
                </NDescriptionsItem>

                <NDescriptionsItem label="设备特征码">
                    <div class="code-container">
                        <NInput v-model:value="deviceCode" type="textarea" readonly placeholder="点击下方按钮获取特征码~"
                            :autosize="{ minRows: 2, maxRows: 4 }" class="custom-input" />
                    </div>
                </NDescriptionsItem>
            </NDescriptions>

            <NSpace vertical size="large" style="margin-top: 24px">
                <NButton block type="primary" size="large" @click="getDeviceInfo" ghost>
                    <template #icon>✨</template>
                    立即获取设备信息
                </NButton>

                <NButton block type="success" size="large" :disabled="!deviceCode" @click="copyDeviceCode">
                    <template #icon>📋</template>
                    一键复制特征码
                </NButton>
            </NSpace>
        </NSpin>
    </NCard>
</template>

<style scoped>
.custom-card {
    max-width: 450px;
    margin: 20px auto;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;
}

.custom-card:hover {
    transform: translateY(-4px);
}

.custom-descriptions {
    background-color: #fafafa;
    border-radius: 8px;
    overflow: hidden;
}

.custom-input {
    font-family: monospace;
    background-color: #f4f4f5 !important;
}

.code-container {
    padding: 4px 0;
}
</style>