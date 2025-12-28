<template>
    <NConfigProvider :theme="naiveTheme" :locale="zhCN" :date-locale="dateZhCN">
        <NWatermark content="Misaka 学习通签到小程序" cross fullscreen :width="384" :height="384" :x-offset="12" :y-offset="60"
            :rotate="-15" />
        <NModalProvider>
            <NMessageProvider>
                <Layout />
            </NMessageProvider>
        </NModalProvider>
    </NConfigProvider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import {
    NConfigProvider,
    NMessageProvider,
    NModalProvider,
    NWatermark,
    darkTheme,
    dateZhCN,
    zhCN
} from 'naive-ui'

const { isDark } = useData()
const { Layout } = DefaultTheme
const naiveTheme = computed(() => (isDark.value ? darkTheme : null))
</script>