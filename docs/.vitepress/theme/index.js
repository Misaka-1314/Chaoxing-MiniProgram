// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme';
import CustomLayout from '../layouts/CustomLayout.vue';

export default {
    extends: DefaultTheme,

    Layout: CustomLayout,

    enhanceApp({ app }) {
    }
}