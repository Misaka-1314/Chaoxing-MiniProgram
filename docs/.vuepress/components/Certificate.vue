<!-- Script Setup -->
<script setup lang="js">
import { ref, computed } from 'vue';
import { useDarkMode } from "vuepress-theme-hope/client";
import { NForm, NFormItem, NInput, NButton, NCard, NCode, NRadio, NRadioGroup, NTabs, NTabPane } from 'naive-ui';


const form = ref({});
const acme = ref({});

const rules = {
    domain: {
        required: true,
        validator(rule, value) {
            const domains = (value || "").trim().split("\n").map(i => i.trim()).filter(i => i);
            // if (!value)
            //     return new Error("需要填写域名");
            // else if (!/^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.(?!-)(?:[A-Za-z0-9-]{1,63}\.)+[A-Za-z]{2,6}$/.test(value))
            //     return new Error("域名格式不正确");
            // else if (value.startsWith("*."))
            //     return new Error("填写时无需包含泛域名");
            return true;
        },
        trigger: ["input"],
    },
    email: {
        required: true,
        validator(rule, value) {
            value = (value || "").trim();
            if (!value)
                return new Error("需要填写邮箱");
            else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value))
                return new Error("邮箱格式不正确");
            return true;
        },
        trigger: ["input"],
    },
}


class AcmeClient {
    /**
     * 随机生成 RSA 私钥
     */
    static async generateRSAPrivateKeyPEM() {
        const ab2b64 = buf => {
            let binary = "";
            const bytes = new Uint8Array(buf);
            const chunk = 0x8000;
            for (let i = 0; i < bytes.length; i += chunk)
                binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
            return btoa(binary);
        };

        const toPEM = b64 => {
            let pem = "-----BEGIN PRIVATE KEY-----\n";
            for (let i = 0; i < b64.length; i += 64)
                pem += b64.substring(i, i + 64) + "\n";
            pem += "-----END PRIVATE KEY-----\n";
            return pem;
        };

        const keyPair = await crypto.subtle.generateKey({
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        }, true, ["encrypt", "decrypt"]);
        const pkcs8 = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
        return toPEM(ab2b64(pkcs8));
    };

    /**
     * JWS 签名（通过私钥）
     */
    static async signatureJWS({ privatePEM, url, nonce, payload = {} }) {
        // Base64Url 编码
        const base64url = str => btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        const ab2base64url = buf => {
            let binary = "";
            const bytes = new Uint8Array(buf);
            for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
            return base64url(binary);
        };

        // PEM -> ArrayBuffer
        const pemToArrayBuffer = pem => {
            const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
            const binary = atob(b64);
            const buf = new ArrayBuffer(binary.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < binary.length; i++)
                view[i] = binary.charCodeAt(i);
            return buf;
        };

        // 导入私钥
        const privateKey = await crypto.subtle.importKey(
            "pkcs8",
            pemToArrayBuffer(privatePEM),
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            true,
            ["sign"]
        );

        // 导出 JWK
        const jwk = await crypto.subtle.exportKey("jwk", privateKey);
        const { e, n } = jwk;

        // protected header
        const protectedHeader = {
            alg: "RS256",
            nonce,
            url,
            jwk: { kty: "RSA", e, n }
        };
        const protectedB64 = base64url(JSON.stringify(protectedHeader));
        const payloadB64 = base64url(JSON.stringify(payload));

        // 签名数据
        const signingInput = new TextEncoder().encode(protectedB64 + "." + payloadB64);
        const sigBuf = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, signingInput);
        const signatureB64 = ab2base64url(sigBuf);

        return {
            "protected": protectedB64,
            "payload": payloadB64,
            "signature": signatureB64
        };
    };

    /**
     * 签名 JWS（通过 kid）
     */
    static async signatureJWSByKid({ kid, url, nonce, payload = {} }) {
        // Base64Url 编码
        const base64url = str => btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        const ab2base64url = buf => {
            let binary = "";
            const bytes = new Uint8Array(buf);
            for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
            return base64url(binary);
        };

        // PEM -> ArrayBuffer
        const pemToArrayBuffer = pem => {
            const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
            const binary = atob(b64);
            const buf = new ArrayBuffer(binary.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < binary.length; i++)
                view[i] = binary.charCodeAt(i);
            return buf;
        };

        // 导入私钥
        const privateKey = await crypto.subtle.importKey(
            "pkcs8",
            pemToArrayBuffer(privatePEM),
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            true,
            ["sign"]
        );

        // 导出 JWK
        const jwk = await crypto.subtle.exportKey("jwk", privateKey);
        const { e, n } = jwk;

        // protected header
        const protectedHeader = {
            alg: "RS256",
            nonce,
            url,
            kid,
        };
        const protectedB64 = base64url(JSON.stringify(protectedHeader));
        const payloadB64 = base64url(JSON.stringify(payload));

        // 签名数据
        const signingInput = new TextEncoder().encode(protectedB64 + "." + payloadB64);
        const sigBuf = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, signingInput);
        const signatureB64 = ab2base64url(sigBuf);

        return {
            "protected": protectedB64,
            "payload": payloadB64,
            "signature": signatureB64
        };
    }

    /**
     * 获取 Nonce
     */
    static async getNonce() {
        const resp = await fetch('https://acme-v02.api.letsencrypt.org/acme/new-nonce', { method: 'HEAD' });
        const nonce = resp.headers.get('Replay-Nonce');
        if (!nonce)
            throw new Error('无法获取 Replay-Nonce');
        return nonce;
    }

    /**
     * 创建 ACME 账户
     * @param email
     * @param privateKey
     */
    async createAccount(email, privateKey = "") {
        if (!privateKey)
            privateKey = await AcmeClient.generateRSAPrivateKeyPEM();

        const jws = await AcmeClient.signatureJWS({
            "privatePEM": privateKey,
            "url": 'https://acme-v02.api.letsencrypt.org/acme/new-acct',
            "nonce": await AcmeClient.getNonce(),
            "payload": {
                "termsOfServiceAgreed": true,
                "contact": [`mailto:${email}`],
            },
        });
        const resp = await fetch('https://acme-v02.api.letsencrypt.org/acme/new-acct', {
            "method": 'POST',
            "headers": { 'Content-Type': 'application/jose+json' },
            "body": JSON.stringify(jws),
        });
        const res = await resp.json();
        if (res.status !== 'valid')
            throw new Error(`创建账户失败: ${JSON.stringify(res)}`);
        return null;
    }

    async orderCertificate(domains = []) {
        // Logic to order a certificate for the specified domains
    }

    async getChallenges() {
        // Logic to retrieve challenges for domain validation
    }

    async verifyChallenge(challenge) {
        // Logic to verify a specific challenge
    }
}


</script>

<!-- HTML -->
<template>
    <NTabs type="segment" animated>
        <NTabPane name="simplify" tab="精简模式">
            <NCard title="第一步：配置账户与证书">
                <NForm :model="form" ref="form" label-placement="top" :rules="rules">
                    <NFormItem label="邮箱" path="email">
                        <NInput v-model:value="form.email" placeholder="请输入可以收件的邮箱" />
                    </NFormItem>
                    <NFormItem label="域名" path="domain">
                        <NInput v-model:value="form.domain" type="textarea" placeholder="请输入域名，每行一个" />
                    </NFormItem>
                </NForm>
            </NCard>
            <NCard title="第二步：验证域名归属">
            </NCard>
            <NCard title="第三步：下载证书">
            </NCard>
        </NTabPane>
        <NTabPane name="advanced" tab="高级模式">
            <NCard title="第一步：注册 ACME 账户">
                <NForm :model="form" ref="form" label-placement="top" :rules="rules">
                    <NFormItem label="邮箱" path="email">
                        <NInput v-model:value="form.email" placeholder="请输入可以收件的邮箱" />
                    </NFormItem>
                    <NFormItem label="私钥" path="privateKey">
                        <NInput v-model:value="form.privateKey" type="textarea" placeholder="请输入账户私钥" />
                    </NFormItem>
                </NForm>
            </NCard>
            <NCard title="第二步：证书配置">
                <NForm :model="form" ref="form" label-placement="top" :rules="rules">
                    <NFormItem label="域名" path="domain">
                        <NInput v-model:value="form.domain" type="textarea" placeholder="请输入域名，每行一个" />
                    </NFormItem>
                    <NFormItem label="私钥" path="privateKey">
                        <NInput v-model:value="form.privateKey" type="textarea" placeholder="请输入证书私钥" />
                    </NFormItem>
                </NForm>
            </NCard>
            <NCard title="第三步：验证域名归属">

            </NCard>
            <NCard title="第四步：下载证书">

            </NCard>
        </NTabPane>
    </NTabs>
</template>

<!-- Style -->
<style scoped>
.label-title {
    margin: 8px 0;
    font-size: 16px;
    font-weight: 600;
}

.label-description {
    margin: 8px 0;
    margin-left: 8px;
    font-size: 12px;
    font-weight: 600;
    opacity: 0.6;
}
</style>
