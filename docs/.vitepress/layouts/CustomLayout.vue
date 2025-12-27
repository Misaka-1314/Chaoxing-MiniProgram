<template>
    <NConfigProvider :theme="naiveTheme">
        <NMessageProvider>
            <Layout />
        </NMessageProvider>
    </NConfigProvider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import {
    NConfigProvider,
    NMessageProvider,
    darkTheme
} from 'naive-ui'

const { isDark } = useData()
const { Layout } = DefaultTheme
const naiveTheme = computed(() => (isDark.value ? darkTheme : null))
</script>