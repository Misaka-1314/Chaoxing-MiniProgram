<script setup>
import UploadForm from '../../.vitepress/components/UploadForm.vue';
import UploadResult from '../../.vitepress/components/UploadResult.vue';
</script>

# 代码上传结果

:::tip
新创建的小程序，需要30秒同步到此表，上传需要至多24小时。
:::

<ClientOnly>
    <UploadResult />
</ClientOnly>

::: details 我也要上传小程序代码

请勿使用手机、平板填写，文档站未适配。
<ClientOnly>
    <UploadForm />
</ClientOnly>
:::