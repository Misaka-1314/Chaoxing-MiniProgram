<!-- Script Setup -->
<script lang="js" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { NButton } from 'naive-ui';

const list = ref([]);
const title = ref('');
const search = ref('');
const msg = ref('正在加载数据，请稍候...');
const focused = ref(false);
const host = "https://cx.micono.eu.org";


watch(search, (newVal) => {
    localStorage.setItem('uploadTableSearch', newVal)
})

const filteredList = computed(() => {
    const keyword = search.value.trim().toLowerCase().substring(-8);
    const _list = [...list.value].map(item => ({
        ...item,
        "secret": item.secret ? "已配置" : "未配置",
        "style-class": (item.status || "").includes('失败') ? 'item-fail' : '',
        "button": (() => {
            if (!item.status)
                return null;
            else if (item.status.includes("成功"))
                return {
                    'text': '强制更新',
                    'type': 'primary',
                }
            else
                return {
                    'text': '申请重传',
                    'type': 'warning',
                }
        })(),
        "status": `${item.status || "排队中"} ${item.upload_at || ''}`
    }));

    if (!keyword)
        return _list;
    else
        return _list.filter(item =>
            item.appid.includes(keyword) || String(item.id).includes(keyword)
        );
})

onMounted(() => {
    msg.value = '正在刷新数据，请稍候';
    search.value = localStorage.getItem('uploadTableSearch') || "";
    const timer = setInterval(() => {
        if ((msg.value.match(/\./g) || []).length >= 10)
            msg.value = '正在刷新数据，请稍候';
        else
            msg.value += '.';
    }, 1000);

    const savedData = localStorage.getItem('uploadTableData');
    if (savedData) list.value = JSON.parse(savedData)


    Promise.all([
        fetch(`${host}/api/task/list`, {
            method: 'GET',
            credentials: 'omit',
        }),
        fetch("/api/github/update-time", {
            method: 'GET',
            credentials: 'omit',
        })
    ])
        .then(([resp1, resp2]) => Promise.all([resp1.json(), resp2.json()]))
        .then(([res1, res2]) => {
            clearInterval(timer);
            if (res1.status === 0 && Array.isArray(res1.data)) {
                list.value = res1.data;
                msg.value = list.value.length ? '' : '暂无数据，请稍后再试！';
                title.value = `小程序版本号：v3，共计 ${list.value.length} 条问卷数据，代码最后更新时间：${res2.data}`;
                localStorage.setItem('uploadTableData', JSON.stringify(list.value));
            }
        })
        .catch(err => {
            clearInterval(timer);
            console.error('数据加载失败:', err);
            msg.value = '数据加载失败，请稍后重试！';
        })
})

const upgrade = (item) => {
    fetch(`${host}/api/task/force?id=${item.id}&_=${new Date().getTime()}`, {
        method: 'GET',
        credentials: 'omit',
    })
        .then(resp => resp.json())
        .then(res => {
            alert(`${item.appid} ${res.msg}`);
            if (window) window.location.reload();
        })
}
</script>

<!-- HTML -->
<template>
    <div class="container">
        <p v-if="title" class="table-title">{{ title }}</p>

        <input v-model="search" type="text" placeholder="搜索 AppID / 备注 / 上传结果" class="search-input"
            @focus="focused = true" @blur="focused = false" :class="{ focused }" />

        <div class="table-scroll">
            <div class="table-content">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>序号</th>
                            <th>操作</th>
                            <th>AppID</th>
                            <th>上传结果</th>
                            <th>手机号</th>
                            <th>Secret</th>
                            <th>填写问卷时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="msg">
                            <td colspan="7" class="no-data">{{ msg }}</td>
                        </tr>
                        <tr v-for="item in filteredList" :key="item.appid" :class="[item['style-class']]">
                            <td>{{ item.id }}</td>
                            <td>
                                <NButton @click="upgrade(item)" v-if="item.button" strong secondary
                                    :type="item.button.type">
                                    {{ item.button.text }}
                                </NButton>
                            </td>
                            <td class="item-appid">{{ item.appid }}</td>
                            <td>{{ item.status }}</td>
                            <td>{{ item.mobile }}</td>
                            <td>{{ item.secret }}</td>
                            <td>{{ item.create_at }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<!-- Style -->
<style scoped>
.container {
    padding: 24px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
}

.table-title {
    font-size: 14px;
    opacity: 0.5;
    font-weight: 600;
    margin: 16px 0;
}

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

.search-input {
    min-width: min(500px, 100%);
    max-width: 100%;
    padding: 12px 16px;
    background: var(--vp-c-grey-soft);
    border: none;
    border-radius: 4px;
    font-size: 16px;
    margin: 12px 0;
}

.item-fail {
    color: #b71c1c;
    background: rgba(255, 115, 0, 0.2);
}

.item-appid {
    font-family: "Roboto Mono", "Fira Code", "JetBrains Mono", Consolas,
        "Courier New", monospace;
}

.no-data {
    text-align: left;
}
</style>
