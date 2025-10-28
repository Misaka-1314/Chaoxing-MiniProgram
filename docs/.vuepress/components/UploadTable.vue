<!-- Script Setup -->
<script lang="js" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { NButton, NInput, NDropdown, useMessage, NMessageProvider } from 'naive-ui';

const message = useMessage();

const list = ref([]);
const version = ref('v3');
const updatetime = ref('正在获取');
const count = ref('NULL');
const search = ref('');
const msg = ref('正在加载数据，请稍候...');
const host = "https://cx.micono.eu.org";
const searchStatus = ref(null);
const dropdownStatusOptions = [
    { label: '全部', key: '' },
    { label: '上传成功', key: '成功' },
    { label: '上传失败', key: '失败' },
    { label: '上传中 / 排队中', key: '中' },
];
const dropdownSecretOptions = [
    { label: '全部', key: '' },
    { label: '已配置', key: '已配置' },
    { label: '未配置', key: '未配置' },
];
const dropdownTimeOptions = [
    { label: '全部', key: 0 },
    { label: '1h 内（含未上传）', key: 1 },
    { label: '1h - 1d', key: 2 },
    { label: '1d - 7d', key: 3 },
    { label: '7d 以上', key: 4 },
]
const dropdownStatusValue = ref(dropdownStatusOptions[0]);
const dropdownSecretValue = ref(dropdownSecretOptions[0]);
const dropdownTimeValue = ref(dropdownTimeOptions[0]);

watch(search, (newVal) => {
    localStorage.setItem('uploadTableSearch', newVal)
})

const filteredList = computed(() => {
    const keyword = search.value.trim().toLowerCase().slice(-8);
    const now = new Date().getTime();
    const _list = [...list.value]
        .map(item => ({
            ...item,
            "secret": item.secret ? "已配置" : "未配置",
            "style-class": (item.status || "").includes('失败') || !item.secret ? 'item-fail' : '',
            "button": (() => {
                if (!item.status || item.status == "上传中")
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
            "status": item.status || (item.upload_at ? "等待更新" : "排队中"),
        }))
        .filter(item => item.status.includes(dropdownStatusValue.value.key))
        .filter(item => item.secret.includes(dropdownSecretValue.value.key))
        .filter(item => {
            if (dropdownTimeValue.value.key == 0) // 全部
                return true;
            else if (dropdownTimeValue.value.key == 1)
                return item.delta <= 3600;
            else if (dropdownTimeValue.value.key == 2)
                return item.delta > 3600 && item.delta <= 24 * 3600;
            else if (dropdownTimeValue.value.key == 3)
                return item.delta > 24 * 3600 && item.delta <= 7 * 24 * 3600;
            else if (dropdownTimeValue.value.key == 4)
                return item.delta > 7 * 24 * 3600;
        });

    if (!keyword)
        return _list;
    else
        return _list.filter(item => item.appid.includes(keyword) || String(item.id).includes(keyword));
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


    Promise.allSettled([
        fetch(`${host}/api/task/list`, {
            method: 'GET',
            credentials: 'omit',
        })
            .then(r => r.json()),
        fetch("/api/github/update-time", {
            method: 'GET',
            credentials: 'omit',
        })
            .then(r => r.json()),
    ])
        .then(results => {
            console.info("请求结果:", results);
            const [res1, res2] = results;
            clearInterval(timer);

            if (res1.status == "fulfilled" && Array.isArray(res1.value.data)) {
                list.value = res1.value.data;
                count.value = list.value.length;
                msg.value = count.value ? '' : '暂无数据，请稍后再试！';
                localStorage.setItem('uploadTableData', JSON.stringify(list.value));
                message.success('数据加载成功');
            }

            if (res2.status == "fulfilled" && res2.value) {
                version.value = res2.value.data.version || '';
                updatetime.value = res2.value.data.datetime || '';
                message.success('版本信息获取成功');
            }
        })
        .catch(err => {
            clearInterval(timer);
            console.error('数据加载失败:', err);
            msg.value = '数据加载失败，请稍后重试！';
        })
})

const upgrade = (item) => { // 强制升级
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

const dropdownStatusChange = (key) => { // 修改筛选条件 Status
    const item = dropdownStatusOptions.find(i => i.key === key);
    console.info("修改 Status 筛选条件:", item);
    if (item) dropdownStatusValue.value = item;
}

const dropdownSecretChange = (key) => { // 修改筛选条件 Secret
    const item = dropdownSecretOptions.find(i => i.key === key);
    console.info("修改 Secret 筛选条件:", item);
    if (item) dropdownSecretValue.value = item;
}

const dropdownTimeChange = (key) => { // 修改筛选条件 Time
    const item = dropdownTimeOptions.find(i => i.key === key);
    console.info("修改 Time 筛选条件:", item);
    if (item) dropdownTimeValue.value = item;
}

const searchVverify = (val) => { // 验证搜索词长度
    if (0 < val.length && val.length < 2)
        searchStatus.value = 'warning';
    else if (val.startsWith('wx') && val.length != 18)
        searchStatus.value = 'warning';
    else if (val.length > 18)
        searchStatus.value = 'error';
    else
        searchStatus.value = null;
}
</script>

<!-- HTML -->
<template>
    <NMessageProvider>
        <div class="container">
            <p class="table-title">小程序版本号：{{ version }}，共计 {{ count }} 条问卷数据，代码最后更新时间：{{ updatetime }}</p>

            <NInput v-model:value="search" :status="searchStatus" placeholder="搜索 AppID" @input="searchVverify" />

            <div class="dropdown-container">
                <NDropdown trigger="hover" :options="dropdownStatusOptions" @select="dropdownStatusChange">
                    <NButton>按结果筛选：{{ dropdownStatusValue.label }}</NButton>
                </NDropdown>
                <NDropdown trigger="hover" :options="dropdownSecretOptions" @select="dropdownSecretChange">
                    <NButton>按 Secret 筛选：{{ dropdownSecretValue.label }}</NButton>
                </NDropdown>
                <NDropdown trigger="hover" :options="dropdownTimeOptions" @select="dropdownTimeChange">
                    <NButton>按上传时间筛选：{{ dropdownTimeValue.label }}</NButton>
                </NDropdown>
            </div>

            <div class="table-scroll">
                <div class="table-content">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>序号</th>
                                <th>操作</th>
                                <th>AppID</th>
                                <th>上传结果</th>
                                <th>上传时间</th>
                                <th>手机号</th>
                                <th>Secret</th>
                                <th>填写问卷时间</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="msg">
                                <td colspan="8" class="no-data">{{ msg }}</td>
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
                                <td>{{ item.upload_at }}</td>
                                <td>{{ item.mobile }}</td>
                                <td>{{ item.secret }}</td>
                                <td>{{ item.create_at }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </NMessageProvider>
</template>

<!-- Style -->
<style scoped>
.container {
    padding: 24px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
}

.dropdown-container {
    display: flex;
    margin-top: 16px;
    gap: 16px;
    justify-content: flex-start;
}

.table-title {
    font-size: 14px;
    opacity: 0.7;
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
    font-size: 16px;
    font-weight: 600;
}
</style>
