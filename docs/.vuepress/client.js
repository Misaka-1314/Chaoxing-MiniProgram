// client.js
import { defineClientConfig } from "@vuepress/client";
import InsertMiniprogram from "./components/InsertMiniprogram.vue";
import GitHubRelease from "./components/GitHubRelease.vue";
import UploadTable from "./components/UploadTable.vue";
import ImageUpload from "./components/ImageUpload.vue";
import Certificate from "./components/Certificate.vue";
import SignList from "./components/SignList.vue";

import CustomLayout from "./layouts/CustomLayout.vue";

export default defineClientConfig({
    enhance({ app, router, siteData }) {
        app.component("SignList", SignList);
        app.component("Certificate", Certificate);
        app.component("ImageUpload", ImageUpload);
        app.component("UploadTable", UploadTable);
        app.component("GitHubRelease", GitHubRelease);
        app.component("InsertMiniprogram", InsertMiniprogram);
    },
    layouts: {
        Layout: CustomLayout,
    },
});
