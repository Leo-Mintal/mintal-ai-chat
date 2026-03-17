# Mintal AI Chat

[简体中文](./README.md) | English

`mintal-ai-chat` is the frontend chat workspace for Mintal AI. It is built with React 19 and Vite, and provides user authentication, model selection, conversation history browsing, quota display, and admin-side quota adjustment. By default, the app talks to the backend through `VITE_API_BASE_URL`, which is typically served by `mintal-ai-go`.

## Highlights

- Sign in, sign up, session restore, and logout
- Chat input, thinking panel display, copy, and message editing
- Paginated conversation list, memory history loading, rename, and delete
- Remote model discovery with default model selection
- User quota lookup, manual refresh, and admin quota management
- Local preference persistence such as AI bubble style and thinking toggle

## Tech Stack

- React 19
- TypeScript
- Vite 6
- `react-markdown`
- `lucide-react`

## Project Structure

```text
mintal-ai-chat/
├── components/          # Screens and reusable UI components
├── services/            # HTTP, auth, model, and conversation services
├── static/              # Vite public assets
├── scripts/             # Local development validation scripts
├── openspec/            # Specs and change records
├── App.tsx              # App entry and view orchestration
├── package.json
├── vite.config.ts
└── README.md
```

## Requirements

- Node.js 18+
- pnpm 8+ or npm 10+
- A reachable Mintal AI backend service

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

The project currently uses these env files:

- `.env.development` for local development
- `.env.production` for production builds
- `.env.local` for private local overrides

Recommended local setup:

```bash
VITE_API_BASE_URL=/api/v1
VITE_ADMIN_PASSWORD=your-admin-password
VITE_LLM_CHAT_TIMEOUT_MS=600000
```

Notes:

- Keep `VITE_API_BASE_URL=/api/v1` during local development so Vite can proxy requests to `http://127.0.0.1:18080`
- `VITE_ADMIN_PASSWORD` protects the admin quota panel on the client side
- `VITE_LLM_CHAT_TIMEOUT_MS` helps when talking to slower models
- `GEMINI_API_KEY` in `.env.local` is only kept for legacy experiments and is not required for the standard backend-driven flow

### 3. Start the dev server

```bash
pnpm dev
```

The app runs on `http://localhost:3000` by default.

### 4. Build and preview

```bash
pnpm build
pnpm preview
```

## Backend Integration

If you also maintain [mintal-ai-go](../mintal-ai-go/README.md), this is the recommended local flow:

1. Start the backend API, usually at `http://127.0.0.1:18080`
2. Keep `VITE_API_BASE_URL=/api/v1` in this frontend
3. Let the Vite proxy forward `/api/*` requests to the backend to avoid CORS issues

The repository also includes a small validation script:

```bash
node scripts/check-dev-api-proxy.mjs
```

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm preview
```

## Suggested Next Improvements

- Add a dedicated `.env.example`
- Add component tests or E2E coverage for core chat flows
- Add screenshots and a fuller integration guide to the README

## License

If no separate license file is provided, use the repository according to your internal team agreement.
