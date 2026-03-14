# Changes

## 2026-03-15 - Testing Infrastructure, Bug Fixes & Feature Improvements

### Phase 1: Testing Infrastructure

- Installed Playwright, Vitest, @testing-library/react, jsdom, and related testing deps
- Configured Vitest in `vite.config.ts` with jsdom environment, setup file, and test inclusion patterns
- Created `playwright.config.ts` for E2E tests targeting localhost:5173 with Chromium
- Created `src/test/setup.ts` with DOMPurify mock, localStorage mock, and matchMedia mock
- Added `test`, `test:watch`, `test:ui`, `test:e2e`, and `test:e2e:ui` scripts to `package.json`

### Phase 2: Unit Tests

- `src/lib/sanitizer.test.ts` — 14 tests covering sanitizeHtml and createSandboxContent
- `src/lib/ai-providers.test.ts` — 40 tests covering AI_PROVIDERS, FREE_MODELS, API key management, provider status, model selection, and cleanHtmlOutput
- `src/types/index.test.ts` — 25 tests validating all TypeScript interfaces as runtime checks
- All 79 unit tests pass

### Phase 3: E2E Tests (52 tests, all passing)

- `tests/e2e/app.spec.ts` — Auth flow (login/logout, password validation, persistence)
- `tests/e2e/generation.spec.ts` — Prompt input, draft save/restore, HTML render
- `tests/e2e/history.spec.ts` — History sidebar, favorites, undo/redo stability
- `tests/e2e/export.spec.ts` — Export HTML, share, error states
- `tests/e2e/chat.spec.ts` — Chat widget stability
- `tests/e2e/theme.spec.ts` — Dark/light toggle, localStorage persistence, restore on reload
- `tests/e2e/viewport.spec.ts` — Mobile/tablet/desktop viewport rendering
- `tests/e2e/keyboard.spec.ts` — All keyboard shortcut handlers

### Phase 4: Bug Fixes

1. **Auth bug** — `siteAuth === false` was falling through to the main app render instead of showing the login screen. Fixed by changing the conditional to `siteAuth === null || siteAuth === false`.

2. **Escape key doesn't close modals** — The keydown handler only closed the sidebar on Escape but never closed the keyboard shortcuts, favorites, or gallery modals. Fixed by adding modal-close logic to the Escape handler, with priority order: shortcuts > favorites > gallery > sidebar.

3. **Theme persistence race condition** — The theme was being saved to localStorage with the default 'dark' value on the first render (from the auto-save effect), overwriting the user's saved preference before the session-load effect could read it. Fixed by initializing the `theme` state lazily from localStorage using `useState(() => { ... })`, so the initial value is always correct and no overwrite occurs.

4. **Added `showShortcuts`, `showFavorites`, `showGallery`, `sidebarOpen` to the keydown effect dependencies** — Prevents stale closures in the keyboard handler.

### Phase 5: Feature Improvements

1. **Prompt character counter** — Added a live `{count}/1000` counter to the prompt textarea in InputPanel. Color transitions from muted → yellow (>500) → red (>800) to warn about length.

2. **localStorage cleanup on startup** — Added a one-time cleanup effect to App.tsx that removes stale/deprecated keys (`visual-ai-dark-mode`, `visual-ai-code-editor`, `visual-ai-temp`), and trims visual history to 50 entries and prompt history to 100 entries on app init.

3. **ARIA accessibility improvements** — Added `role="dialog"`, `aria-modal="true"`, `aria-labelledby` to the keyboard shortcuts and favorites modals. Added `aria-label` to close buttons. Added `aria-hidden="true"` to decorative icons.

4. **ESC closes all modals** — Unified Escape handling closes shortcuts, favorites, and gallery modals before falling back to closing the sidebar.

### Phase 6: Code Quality

1. **JSDoc comments** added to key functions:
   - `sanitizer.ts`: `sanitizeHtml`, `createSandboxContent`
   - `ai-providers.ts`: `isApiKeyConfigured`, `getProviderStatus`, `generateUI`, `cleanHtmlOutput`

2. **Bundle splitting** — Added `build.rollupOptions.output.manualChunks` to vite.config.ts to split the bundle into logical chunks: `react-vendor`, `motion`, `charts`, `pdf`, `icons`. Main app chunk reduced from ~1.1MB to ~207KB.

3. **Removed unused `vi` imports** from test files to fix TypeScript strict-mode errors.

4. **Lazy theme initialization** — Changed `theme` state to use a lazy initializer reading from localStorage, preventing the initial-render write race condition.
