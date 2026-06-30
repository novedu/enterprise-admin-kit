# Enterprise Admin Kit

A modern enterprise-level admin starter based on Vue3 + TypeScript.

## Features

- RBAC permission model with route, menu, button and field control
- Dynamic route and menu generation from login response
- Schema Form with Input, Select, Date, Radio and Upload renderers
- TablePage CRUD generator with search, table, pagination and actions
- AI Chat with mocked SSE streaming, Markdown rendering, code highlight, stop and regenerate
- Realtime notification service with simulated WebSocket events
- Dashboard with metrics, server status and ECharts visualization
- Axios request layer with interceptor, retry, loading, error and business error handling
- Pinia stores with local persistence
- Element Plus + UnoCSS responsive admin UI
- ESLint, Prettier, Husky, Commitlint and Vitest ready

## Tech Stack

Vue3, TypeScript, Vite, Pinia, Vue Router, Element Plus, Axios, ECharts, UnoCSS, Mock.js, Vitest, ESLint, Prettier, Husky and Commitlint.

## Quick Start

```bash
npm install
npm run dev
```

Browser mock is enabled by default. To use the standalone Node mock server:

```bash
npm run dev:mock-server
VITE_USE_BROWSER_MOCK=false npm run dev
```

Demo accounts:

```text
admin / admin123
user / user123
```

## Project Structure

```text
src
├── api
├── assets
├── components
├── composables
├── directives
├── hooks
├── layouts
├── pages
├── plugins
├── router
├── schemas
├── services
├── store
├── types
└── utils
```

## Interview Talking Points

- Why RBAC is split into route, directive, button and field layers
- Why menus are generated from backend data instead of hard-coded locally
- Why TablePage owns CRUD orchestration while Schema controls rendering
- Why dynamic forms use a component mapping instead of branching in pages
- Why AI Chat models streaming as chunks and keeps stop/regenerate behavior in a composable
- How Axios interceptors normalize business errors, retry transient failures and keep UI feedback consistent

## Roadmap

- i18n
- Dark theme token switcher
- Virtual table
- Excel export
- Monaco editor
- Markdown editor
- Micro frontend shell
