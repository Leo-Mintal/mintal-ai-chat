# Mintal AI Chat

简体中文 | [English](./README.en-US.md)

`mintal-ai-chat` 是 Mintal AI 的前端聊天工作台，基于 React 19 和 Vite 构建，负责承接账号登录、模型选择、对话历史浏览、额度展示以及管理员配额调整等交互能力。项目默认通过 `VITE_API_BASE_URL` 连接 `mintal-ai-go` 提供的后端接口。

## 功能概览

- 账号登录、注册、会话恢复与登出
- 聊天输入、思考链展示、消息复制与编辑
- 对话列表分页、历史记忆分页、会话重命名与删除
- 远程模型列表拉取与默认模型选择
- 用户额度查询、刷新与管理员额度调整面板
- 本地偏好持久化，例如 AI 气泡样式与思考开关

## 技术栈

- React 19
- TypeScript
- Vite 6
- `react-markdown`
- `lucide-react`

## 目录结构

```text
mintal-ai-chat/
├── components/          # 页面组件与基础 UI 组件
├── services/            # HTTP 客户端、鉴权、模型、会话等服务层
├── static/              # Vite 静态资源目录
├── scripts/             # 本地开发校验脚本
├── openspec/            # 需求规格与变更记录
├── App.tsx              # 应用入口与视图状态编排
├── package.json
├── vite.config.ts
└── README.md
```

## 环境要求

- Node.js 18+
- pnpm 8+ 或 npm 10+
- 一个可访问的 Mintal AI 后端服务

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

项目当前使用以下环境文件：

- `.env.development`：本地开发环境
- `.env.production`：生产构建环境
- `.env.local`：本地私有覆盖项，不建议提交

推荐的本地开发配置：

```bash
VITE_API_BASE_URL=/api/v1
VITE_ADMIN_PASSWORD=your-admin-password
VITE_LLM_CHAT_TIMEOUT_MS=600000
```

说明：

- 开发环境推荐将 `VITE_API_BASE_URL` 保持为 `/api/v1`，由 Vite 代理转发到 `http://127.0.0.1:18080`
- `VITE_ADMIN_PASSWORD` 用于前端管理员校验页
- `VITE_LLM_CHAT_TIMEOUT_MS` 用于控制长文本或慢模型请求的前端超时
- `.env.local` 中的 `GEMINI_API_KEY` 仅保留给旧实验配置，常规联调不依赖它

### 3. 启动开发环境

```bash
pnpm dev
```

默认会在 `http://localhost:3000` 启动开发服务器。

### 4. 生产构建与预览

```bash
pnpm build
pnpm preview
```

## 与后端联调

如果你同时维护 [mintal-ai-go](../mintal-ai-go/README.md)，建议采用下面的联调方式：

1. 在后端项目中启动 API 服务，默认地址为 `http://127.0.0.1:18080`
2. 在当前项目保留 `VITE_API_BASE_URL=/api/v1`
3. 通过 Vite 代理将 `/api/*` 请求转发到后端，避免本地跨域问题

仓库内已经提供了一个联调检查脚本，可在本地验证代理配置：

```bash
node scripts/check-dev-api-proxy.mjs
```

## 常用命令

```bash
pnpm dev       # 本地开发
pnpm build     # 打包生产构建
pnpm preview   # 预览构建结果
```

## 适合补充的后续内容

- 补充 `.env.example`，统一前端环境变量入口
- 增加关键交互的 E2E 或组件测试
- 在 README 中加入界面截图与典型联调流程

## License

如仓库未单独声明许可证，请按团队内部约定使用。
