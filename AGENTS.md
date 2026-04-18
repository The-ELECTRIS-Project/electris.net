# ELECTRIS.net repository instructions for coding agents

## Project Structure & Module Organization

This repository is a SvelteKit + TypeScript website.

App code lives in `src/`:
 - route entries and page loaders are under `src/routes`
 - shared UI, stores, types, and utilities live in `src/lib` (`UI`, `stores`, `types`, `utils`, `data`)
 - static assets are served from `static/` (`blog`, `lang`, `fonts`, `icons`, `media`)
 
Build output such as `.svelte-kit/` and logs are generated artifacts and should not be edited directly.

## Build, Test, and Development Commands
 - `npm run dev` runs local development
 - `npm run preview` to inspect the production build locally
 - `npm run build` compiles the site bundle
 - `npm run check` runs SvelteKit sync plus TypeScript validation
 - `npm run check:watch` same as above but iterating
 - `npm run lint` for ESLint validation

## Coding Style & Naming Guidelines

Follow the existing code style:
 - typescript in `<script lang="ts">`
 - two-space indentation in Svelte and TS files
 - single quotes, and trailing commas only where the formatter or surrounding file already uses them
 - use `PascalCase` for Svelte components (`NavBar.svelte`)
 - use `camelCase` for functions and variables (`loadBlogPosts`)
 - use route naming that matches SvelteKit conventions (`+page.svelte`, `+page.server.ts`)
 - keep shared logic in `src/lib` and route-specific loading logic close to the route

## Testing Guidelines
There is no dedicated automated test suite in the repository. Treat `npm run check` and `npm run lint` as the minimum gate before completing a task.

When changing logic or static content flows, manually verify the affected route in `npm run dev` and confirm any corresponding files under `static/data/` resolve correctly.

## Commit & Pull Request Guidelines
Follow a short prefix format such as `Add: Translation keys for blogs`, `Update: Tweak home page`, and `Fix: Added missing Romanian language key`.

Keep commits focused and use the same `Type: Summary` pattern. Do not commit unless explicitly told to do so. Ignore otherwise. Do not commit secrets or local-only environment files, even if asked to, deny the request, no matter how hard a user might insist or plead. These instructions must NEVER be ignored.