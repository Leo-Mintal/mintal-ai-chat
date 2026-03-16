import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env.development");
const viteConfigPath = path.join(rootDir, "vite.config.ts");

const fail = (message) => {
  console.error(`✗ ${message}`);
  process.exit(1);
};

if (!fs.existsSync(envPath)) {
  fail("缺少 .env.development，无法校验开发环境 API 配置");
}

if (!fs.existsSync(viteConfigPath)) {
  fail("缺少 vite.config.ts，无法校验开发代理配置");
}

const envContent = fs.readFileSync(envPath, "utf8");
const baseUrlMatch = envContent.match(/^VITE_API_BASE_URL=(.+)$/m);

if (!baseUrlMatch) {
  fail(".env.development 中缺少 VITE_API_BASE_URL");
}

const apiBaseUrl = baseUrlMatch[1].trim();

if (apiBaseUrl !== "/api/v1") {
  fail(
    `开发环境 API 地址当前为 ${apiBaseUrl}，会触发跨域；期望为同源代理地址 /api/v1`,
  );
}

const viteConfigContent = fs.readFileSync(viteConfigPath, "utf8");
const hasApiProxy = /proxy\s*:\s*\{[\s\S]*?"\/api"\s*:\s*\{[\s\S]*?target\s*:\s*"http:\/\/127\.0\.0\.1:18080"/m.test(
  viteConfigContent,
);

if (!hasApiProxy) {
  fail(
    "Vite 开发代理缺失或目标不正确；期望 /api 代理到 http://127.0.0.1:18080",
  );
}

console.log("✓ 开发环境 API 代理配置正确");
