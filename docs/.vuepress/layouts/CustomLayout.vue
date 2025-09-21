<template>
    <NConfigProvider :theme="naiveTheme">
        <NMessageProvider>
            <Layout />
        </NMessageProvider>
    </NConfigProvider>
</template>

<script setup>
import { computed } from 'vue';
import { useDarkMode, Layout } from "vuepress-theme-hope/client";
import { NMessageProvider, NConfigProvider, darkTheme } from "naive-ui";

const { isDarkMode } = useDarkMode();
const naiveTheme = computed(() => (isDarkMode.value ? darkTheme : null));
</script>
