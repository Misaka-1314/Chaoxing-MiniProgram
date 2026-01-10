<script setup>
import QRCode from '../../.vitepress/components/QRCode.vue';
import UploadForm from '../../.vitepress/components/UploadForm.vue';
import UploadResult from '../../.vitepress/components/UploadResult.vue';
</script>

# 代码上传结果

::: tip
新创建的小程序，需要10秒同步到此表，上传需要至多24小时。
:::

<ClientOnly>
    <UploadResult />
</ClientOnly>

::: details 我也要上传小程序代码
<div class="only-mobile">
    不支持使用手机、平板填写，文档站未适配移动端！
    请改用电脑填写！
</div>

<div class="only-desktop">
    请勿使用手机、平板填写，文档站未适配移动端！
    <ClientOnly>
        <UploadForm />
    </ClientOnly>
</div>
:::

::: details 生成小程序码
<ClientOnly>
    <QRCode />
</ClientOnly>
:::

<style>
@media (min-width: 960px) {
  .only-mobile {
    display: none;
  }
}

@media (max-width: 960px) {
  .only-desktop {
    display: none !important;
  }
}
</style>