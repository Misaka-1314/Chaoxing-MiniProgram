<script lang="js" setup>
import { ref, onMounted, h, reactive, computed, watch } from 'vue';
import {
  NButton, NDataTable, useModal, NCode, NText, NInput, NTag,
  NSpace, NSpin, useMessage, NCollapse, NCollapseItem, useThemeVars
} from 'naive-ui';

const host = "https://task.micono.eu.org";
const message = useMessage();
const modal = useModal();
const themeVars = useThemeVars();

const list = ref([]);
const loading = ref(false);
const details = reactive({});
const keyword = ref('');

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100, 99999],
  itemCount: computed(() => list.value.length),
  onChange: page => {
    pagination.page = page;
  },
  onUpdatePageSize: pageSize => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
  }
})

watch(keyword, newVal => {
  if (newVal)
    pagination.pageSize = 99999;
});

watch(() => pagination.pageSize, newVal => {
  if (newVal != pagination.pageSizes.at(-1))
    keyword.value = "";
})

const filteredList = computed(() => {
  const filtered = list.value.filter(item => item.appid.includes(keyword.value));
  const start = (pagination.page - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return filtered.slice(start, end);
})

const columns = [
  {
    title: '序号',
    key: 'index',
    align: 'center',
    width: 100,
  }
  ,
  {
    title: 'AppID',
    key: 'appid',
    align: 'center',
    width: 200,
    render: row => h(NText, { code: true }, { default: () => row.appid })
  },
  {
    title: '版本号',
    key: 'version',
    align: 'center',
    width: 150,
  },
  {
    title: 'Secret',
    key: 'secret',
    align: 'center',
    width: 120,
    render: row => row.secret
      ? h(NTag, { type: 'success', size: 'small' }, { default: () => '已填写' })
      : h(NTag, { type: 'warning', size: 'small' }, { default: () => '未填写' })
  },
  {
    title: '详情',
    key: 'actions',
    align: 'center',
    width: 120,
    render: (row) => {
      return h(
        NButton,
        {
          strong: true,
          tertiary: true,
          size: 'small',
          type: 'primary',
          quaternary: true,
          onClick: () => {
            if (!details[row.id]) {
              fetchDetail(row.id);
            }

            modal.create({
              title: () => h(NText, { strong: true }, { default: () => `任务 ID - ${row.id}` }),
              preset: 'card',
              style: { width: '600px' },
              content: () => {
                const data = details[row.id];

                if (!data) {
                  return h(
                    NSpace,
                    { justify: 'center', style: { padding: '20px 0' } },
                    { default: () => h(NSpin, { size: 'medium' }) }
                  );
                }

                return h(NSpace, { vertical: true, size: 'small' }, {
                  default: () =>
                    [
                      { label: '小程序 AppID', value: data.appid },
                      { label: '版本号', value: data.version || '未知' },
                      { label: '手机号', value: data.mobile || '隐藏' },
                      {
                        label: 'Secret',
                        value: data.secret
                          ? h(NTag, { type: 'success', size: 'small' }, { default: () => '已填写' })
                          : h(NSpace, { size: 'small', align: 'center' }, {
                            default: () => [
                              h(NTag, { type: 'warning', size: 'small' }, { default: () => '未填写' }),
                              h(NText, { type: 'warning', style: { fontSize: '12px' } }, {
                                default: () => '下一版本更新后，无法使用签到码/手势功能'
                              })
                            ]
                          })
                      },
                      { label: '问卷填写时间', value: data.create_time || null },
                      { label: '上传开始时间', value: data.upload_begin_time || null },
                      { label: '上传成功时间', value: data.upload_success_time || null },
                      { label: '上传耗时', value: data.upload_duration ? `${data.upload_duration} 秒` : null },
                      { label: '下次重试时间', value: data.upload_locker_expire || null },
                      { label: '上传节点', value: data.upload_node?.slice(0, 15) || null }
                    ]
                      .filter(item => item.value)
                      .map(item =>
                        h('div', { style: { display: 'flex', alignItems: 'flex-start', lineHeight: '2' } }, [
                          h(NText, {
                            depth: 3,
                            style: { width: '120px', flexShrink: 0 }
                          }, { default: () => item.label }),
                          h('div', { style: { flex: 1, wordBreak: 'break-all' } }, [
                            typeof item.value === 'string' ? item.value : item.value
                          ])
                        ])
                      )
                      .concat([
                        h(NCollapse, { style: 'margin-top: 12px;' }, {
                          default: () => h(NCollapseItem, { title: '查看代码上传日志', name: 'logs' }, {
                            default: () => h(NCode, {
                              code: data.upload_logs || '暂无日志信息哦...',
                              language: 'log',
                              showLineNumbers: true,
                              style: {
                                fontSize: '11px',
                                backgroundColor: themeVars.value.codeColor,
                                padding: '12px',
                                borderRadius: '4px',
                                maxHeight: '150px',
                                overflow: 'auto',
                              }
                            })
                          })
                        })
                      ])
                });
              }
            });
          }
        },
        { default: () => '更多信息' }
      );
    }
  }
];

const fetchListData = () => {
  loading.value = true;
  fetch(
    `${host}/api/scheduler/public/tasks`, {
    credentials: 'omit',
    mode: 'cors'
  })
    .then(resp => resp.json())
    .then(res => {
      if (res.status === 0) {
        list.value = res.data.tasks.map((item, index) => ({
          ...item,
          index: res.data.tasks.length - index,
        }));
        message.success('数据加载成功啦~♡');
      }
    })
    .catch(err => {
      message.error('欸？？获取数据失败了...');
      console.error(err);
    })
    .finally(() => {
      loading.value = false;
    });
};

const fetchDetail = id => {
  fetch(
    `${host}/api/scheduler/public/tasks/${id}`, {
    credentials: 'omit',
    mode: 'cors'
  })
    .then(resp => resp.json())
    .then(res => {
      if (res.status === 0) {
        details[id] = res.data;
      }
    })
    .catch(err => {
      message.error('呜呜，详情加载失败了...');
      console.error(err);
    });
};

onMounted(() => {
  fetchListData();
});
</script>

<template>
  <NSpace vertical size="large">
    <NInput v-model:value="keyword" round placeholder="输入完整 AppID，进行搜索" />
    <NDataTable :loading="loading" :columns="columns" :data="filteredList" :pagination="pagination" remote />
  </NSpace>
</template>

<style scoped>
:deep(.n-pagination) {
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  row-gap: 12px;
}
</style>