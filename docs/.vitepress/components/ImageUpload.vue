<!-- Script Setup -->
<script setup lang="js">
import { ref, onMounted, watch } from 'vue';
import { NButton, NCode, NInput, NSpace } from 'naive-ui';

const username = ref('');
const password = ref('');
const imageInfo = ref({});
const loading = ref(false);
const canUpload = ref(false);
const host = "https://cx.micono.eu.org";

watch(username, (newVal) => {
    localStorage.setItem('sign-username', newVal)
})
watch(password, (newVal) => {
    localStorage.setItem('sign-password', newVal)
})
onMounted(() => {
    username.value = localStorage.getItem('sign-username') || "";
    password.value = localStorage.getItem('sign-password') || "";
})

const login = () => {
    if (!username.value || !password.value) {
        alert("请正确输入账号密码")
        return;
    }
    loading.value = true;

    fetch(`/api/chaoxing/pan?username=${username.value}&password=${encodeURIComponent(password.value)}`, {
        method: 'GET',
        credentials: 'include',
    })
        .then(resp => resp.json())
        .then(res => {
            localStorage.setItem('pan-token', res._token);
            localStorage.setItem('pan-puid', res.puid);
            canUpload.value = true;
        })
        .finally(() => {
            loading.value = false;
        });

}

const upload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = event => {
        const file = event.target.files[0];
        if (!file) return;

        const token = localStorage.getItem('pan-token');
        const puid = localStorage.getItem('pan-puid');
        if (!token || !puid) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("puid", puid);

        fetch(`https://pan-yz.chaoxing.com/upload?_token=${token}`, {
            method: "POST",
            body: formData,
        })
            .then(res => res.json())
            .then(res => {
                const info = {
                    ...res.data,
                    "code": `<img src="${res.data.previewUrl}" referrerpolicy="no-referrer" />`,
                }
                imageInfo.value = info;
                console.info("上传图片", info, res);
            })
    };
    fileInput.click();
}

const copy = text => navigator.clipboard.writeText(text)
</script>

<!-- HTML -->
<template>
    <div class="main-container">
        <NSpace vertical>
            <NInput v-model:value="username" size="large" :disabled="loading" type="text" placeholder="账号（手机号）" />
            <NInput v-model:value="password" size="large" type="password" placeholder="密码" />
        </NSpace>

        <div class="button-container">
            <NButton type="info" :disabled="!canUpload" @click="upload" class="button">
                {{ canUpload ? '上传图片' : '登录后才能上传' }}
            </NButton>
            <NButton type="primary" v-if="!canUpload" :disabled="loading" :loading="loading" @click="login"
                class="button">
                登录账号
            </NButton>
        </div>

        <div v-if="imageInfo.previewUrl">
            <div>文件ID：{{ imageInfo.objectId }}</div>
            <div>文件名：{{ imageInfo.name }}</div>
            <div>
                <span>图片链接：</span>
                <a :href="imageInfo.previewUrl" rel="noreferrer" target="_blank">{{ imageInfo.previewUrl }}</a>
            </div>
        </div>
        <div class="image-wrapper" v-if="imageInfo.previewUrl">
            <img referrerpolicy="no-referrer" :src="imageInfo.previewUrl" class="image">
        </div>
        <NCode v-if="imageInfo.code" :code="imageInfo.code" word-wrap />

        <div class="button-container" v-if="imageInfo.previewUrl">
            <NButton type="info" @click="copy(imageInfo.code)" class="button">
                复制 HTML
            </NButton>
            <NButton type="info" @click="copy(imageInfo.previewUrl)" class="button">
                复制链接
            </NButton>
        </div>
    </div>
</template>

<!-- Style -->
<style>
.main-container {
    min-width: min(500px, 100%);
    max-width: 100%;
}

.button-container {
    display: flex;
    gap: 16px;
}

.button {
    display: flex;
    height: 45px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    margin: 12px 0;
    flex: 1;
}

.image-wrapper {
    display: inline-block;
    max-width: 300px;
}

.image {
    width: 100%;
    max-width: 300px;
    height: auto;
    border-radius: 8px;
    object-fit: contain;
    margin-top: 12px;
    display: block;
}
</style>