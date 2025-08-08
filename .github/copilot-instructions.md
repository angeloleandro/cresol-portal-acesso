# AI Coding Agent Instructions

Concise, actionable guidance for working effectively in this repository. Tailored to Next.js 14 (App Router) + Supabase + Tailwind + enterprise video/content portal domain.

## 1. Core Architecture
- Next.js App Router under `app/` (route segments = folders with `page.tsx`). Avoid mixing old Pages Router patterns.
- Auth + RBAC: Supabase Auth + custom middleware (`middleware.ts`). Roles: `admin`, `sector_admin`, `user`. Always verify role both client (UI gating) and server (API route) before privileged actions.
- Data backend: Supabase (PostgreSQL). Client utils in `lib/supabase.ts`; storage & video helpers in `lib/` (e.g. `video-utils.ts`, `thumbnail-generator*.ts`). Prefer existing helpers over re‑implementing.
- Video subsystem: Modular in `app/components/VideoGallery/` with hooks (`VideoGallery.hooks.ts`), optimized variants (`hooks/useOptimizedVideoGallery.ts`), types (`VideoGallery.types.ts`), and components (Card, Modal, Player, Grid, Header, LoadingState). Use exported API surface from `VideoGallery/index.ts`.
- Design system: Tailwind driven. Brand tokens centralized (`lib/constants`, `tailwind.config.js`, `DESIGN_SYSTEM.md`). Reuse utility classes; do not inline arbitrary colors outside palette.

## 2. Key Conventions
- Absolute import alias `@/*` (see `tsconfig.json`). Use it to avoid long relative paths.
- Components live close to feature routes; shared primitives under `app/components/`.
- Hooks naming: `useOptimized*` variants exist for performance-focused implementations. Prefer them when available (e.g. `useOptimizedVideoGallery`, `useOptimizedImagePreload`).
- Types: Re-exported aggregator in `VideoGallery.types.ts`; keep cross-feature types in `app/types/` and import via `@/app/types/...`.
- Error handling: Central helpers in `lib/error-handler.ts` / `lib/error-handling.ts`. Route / API errors should funnel through these utilities.
- Styling: Avoid CSS modules; rely on Tailwind, `globals.css`, and design tokens. Use `clsx` for conditional classes.

## 3. Video Gallery Pattern (Important)
- Entry component: `VideoGallery.Root.tsx` exports default + `CompactVideoGallery`.
- State & data flow: `useOptimizedVideoGallery` fetches & filters ready videos (YouTube + processed direct uploads). It exposes `displayVideos`, `actions.openModal/closeModal`.
- Modal system: `VideoCleanModal` (lean) vs legacy / richer modals. Always pass `{ isOpen, video, onClose }` per `VideoModalProps`.
- Cards: `EnhancedVideoCard` (public), `AdminVideoCard` (with edit/delete), `CompactVideoCard` (list views). Use `VideoThumbnail` for thumbnails—never load raw `<img>` directly.
- Performance: Preloading config via `ThumbnailPerformanceProvider`. When adding thumbnail features, integrate with provider instead of ad-hoc preloads.
- Always check `upload_type` before deciding player: YouTube iframe vs direct `<video>` tag. Keep fallback error UI consistent with `CleanVideoPlayerError`.

## 4. Auth & Middleware
- `middleware.ts` enforces redirect logic. When adding protected routes, ensure path pattern and role logic are updated there.
- Server code requiring service-role key must stay server-side only (never expose in client bundles). Use `process.env` safely.

## 5. Data & Supabase Usage
- Use `getSupabaseClient()` (or provided exported client) for queries. Filter out incomplete video records (processing not ready) exactly like existing hooks—maintain UX consistency.
- Respect RLS: never assume unrestricted access. Add DB policy notes if introducing new tables.

## 6. Adding Features
- Co-locate new route UI under `app/<feature>/`. Export shared subcomponents under `app/components/<Domain>/`.
- Extend design tokens instead of ad-hoc HEX values.
- For new video-related behavior, update central types (`VideoGallery.types.ts`) and re-export if needed to avoid deep import paths.
- Follow existing animation pattern using `framer-motion` variants collected in `VideoGallery.animations`.

## 7. Performance & Accessibility
- Defer heavy rendering using intersection hooks (`useOptimizedInView`) when lists > threshold.
- Use keyboard navigation pattern from `useKeyboardNavigation` for grid-like interactive collections.
- Maintain ARIA attributes as demonstrated in gallery root & modal (role="dialog", `aria-modal`, labels, live regions).

## 8. Common Pitfalls / Gotchas
- Do NOT call non-existent hooks (e.g., use `useOptimizedImagePreload` not `useImagePreload` in optimized paths).
- Ensure modal cleanup: direct `<video>` players must pause & reset on unmount (see `CleanDirectVideoPlayer`).
- Watch for broken multi-line className splits (earlier corruption issue) — keep class strings on one line or valid JSX segments.
- Keep `export default` at file end without trailing stray braces—syntax drift previously caused TS1005.

## 9. Scripts & Dev Workflow
- Install: `npm install`
- Dev: `npm run dev` (port 4000) — confirm nothing else bound to 4000.
- Build: `npm run build`; Prod: `npm start`.
- Lint: `npm run lint` (ESLint + Next.js config). Add rules via `.eslintrc` (not present yet—consider before broad style changes).

## 10. When Modifying Video Gallery
Checklist:
1. Update types & re-exports.
2. Keep modal prop contract stable (`VideoModalProps`).
3. Maintain performance hooks (avoid unnecessary state in cards).
4. Test both YouTube and direct upload flows.
5. Validate keyboard + screen reader announcements still fire.

## 11. File Landmarks
- Auth: `lib/auth.ts`, `middleware-auth.ts`, `middleware.ts`.
- Storage/Video utils: `lib/video-utils.ts`, `lib/thumbnail-generator*.ts`.
- Gallery Core: `app/components/VideoGallery/*`.
- Optimized hooks: `hooks/useOptimizedVideoGallery.ts`.
- Design System Docs: `DESIGN_SYSTEM.md`, `ICON_MAPPING.md`.

## 12. Extending Icons / Tokens
- Add icons via central `Icon` component set—update mapping file (see `ICON_MAPPING.md`).
- Add tokens under `lib/constants/design-tokens/` and wire into Tailwind config if needed.

## 13. Error Handling Pattern
- Wrap async UI actions in try/catch and feed human messages to UI; technical details -> console only in dev.
- Use `error-handler.ts` helpers for consistent logging / shaping when expanding API routes.

## 14. Accessibility & i18n
- Portuguese (pt-BR) primary locale. Use `date-fns` with `ptBR` locale for dates.
- Avoid hardcoding English strings unless part of API contracts.

---
If something seems undocumented (e.g., new table, env var) surface it in PR description and update this file accordingly.
