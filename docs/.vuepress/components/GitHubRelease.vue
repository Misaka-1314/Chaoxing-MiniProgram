<!-- Script Setup -->
<script setup lang="js">
import { ref, onMounted } from 'vue';

const assets = ref([]);

onMounted(() => {
    fetch("/api/github/releases")
        .then(resp => resp.json())
        .then(res => {
            const latest = res[0];
            assets.value = (latest?.assets || []).map(item => ({
                ...item,
                "download_url": item.browser_download_url.replace("https://github.com", "https://ghproxy.net/github.com"),
            }));
        });
});
</script>

<!-- HTML -->
<template>
    <div>
        <div class="table-scroll" v-if="assets.length">
            <div class="table-content">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>序号</th>
                            <th>文件名</th>
                            <th>下载链接</th>
                            <th>预览</th>
                            <th>更新时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in assets" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td>{{ item.name }}</td>
                            <td><a :href="item.download_url" target="_blank">立即下载</a></td>
                            <td>
                                <img v-if="['.png', '.jpg'].some(suffix => item.name.endsWith(suffix))" class="image"
                                    :src="item.browser_download_url">
                                <span v-else>不支持预览</span>
                            </td>
                            <td>{{ item.updated_at }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<!-- Style -->
<style>
.table-scroll {
    width: 100%;
    margin: 16px 0;
    display: flex;
    flex-direction: column;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    max-height: 60vh;
    overflow-y: auto;
}

.data-table {
    min-width: max-content;
    table-layout: fixed;
    border-collapse: collapse;
}

.table-content {
    direction: ltr;
}

th,
td {
    padding: 12px 20px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid var(--tip-c-soft);
    font-size: 14px;
}

.image {
    max-width: 100px;
    max-height: 100px;
    object-fit: cover;
}
</style>
