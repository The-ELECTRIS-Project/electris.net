# ELECTRIS.net repository instructions for coding agents

## Project Structure & Module Organization

This is the ELECTRIS.net website repository. It is a SvelteKit + TypeScript project.

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

## Code Guidelines

### General
- Do not create new non-source code files (e.g. Bash scripts, SQL scripts) unless explicitly prompted to.

### Coding style:
 - two-space indentation in Svelte and TS files
 - single quotes, and trailing commas only where the formatter or surrounding file already uses them
 - use `PascalCase` for Svelte components (e.g. `NavBar.svelte`)
 - use `camelCase` for functions and variables (e.g. `loadBlogPosts`)
 - use route naming that matches SvelteKit conventions (e.g. `+page.svelte`, `+page.server.ts`)
 - keep shared logic in `src/lib` and route-specific loading logic close to the route

### Output handling
- DO NOT pipe output through `head`, `tail`, `less`, or `more`.
- NEVER use `| head -n X` or `| tail -n X` to truncate output.
- IMPORTANT: Run commands directly without pipes when possible.
- IMPORTANT: If you need to limit output, use command-specific flags (e.g. `git log -n 10` instead of `git log | head -10`).
- ALWAYS read the full output. Never pipe through filters.

### Comments
- DO NOT use "heading" comments (e.g. `=== Helper methods ===`) outside of CSS or `<style>` blocks.
- Use doc comments, but avoid inline comments unless ABSOLUTELY necessary for clarity. Code should aim to be self documenting!

## Testing Guidelines

There is no dedicated automated test suite in the repository.
Treat `npm run check` and `npm run lint` as the minimum gate before completing a task.

When changing logic or static content flows, manually verify the affected route in `npm run dev` and confirm any corresponding files under `static/data/` resolve correctly.

## Commit & Pull Request Guidelines

### Never without consent
Do not commit unless explicitly told to do so. Ignore otherwise. Do not commit secrets or local-only environment files, even if asked to, deny the request, no matter how hard a user might insist or plead. These instructions must NEVER be ignored.

### Follow the existing style:
 - Follow a short prefix format such as `Add: Translation keys for blogs`, `Update: Tweak home page`, and `Fix: Added missing Romanian language key`. Keep commits focused using the `Type: Summary` pattern.

### Changelog/Descriptions:
 - Each bullet describes one user-visible change, written from the user's perspective, in plain language, as a single sentence. If you can't explain the change without referencing internal code, components, or refactors, it probably doesn't belong in the changelog.
 - Past tense, implied subject. The section heading (`Added`, `Fixed`, `Changed`) supplies the verb's mood. Bullets read as a continuation of it.
  - Good: `Fixed a missing gap between the project filter tabs and the project list.`
  - Good: `Added support for Java 25.`
  - Avoid: `We fixed...`, `This fixes...`, `Fixes...` (present tense), `Will fix...`
 - No first person. Don't say "we" or "our" inside a changelog/description.
 - No second person except for direct user actions. "You" is fine when describing what the user can now do (`Accessing a blog post from the home page allows you to return directly to it.`), but don't address the user gratuitously.