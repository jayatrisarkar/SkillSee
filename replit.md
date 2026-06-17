# SkillSee

A premium mobile app for saving videos and links, AI auto-categorizing content, and tracking learning progress. Tagline: "Save. Learn. Master."

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the Expo app (web preview)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54, expo-router v6
- Storage: AsyncStorage (local, no backend)
- Icons: @expo/vector-icons (Ionicons), expo-symbols
- UI: expo-linear-gradient, expo-blur, expo-image, expo-haptics

## Where things live

- `artifacts/mobile/app/` — all screens (expo-router file-based routing)
- `artifacts/mobile/app/(tabs)/` — tab screens: index, search, new (+ placeholder), insights, profile, categories
- `artifacts/mobile/app/add.tsx` — Add Link modal (the real add screen)
- `artifacts/mobile/context/LibraryContext.tsx` — all content/category state
- `artifacts/mobile/context/ThemeContext.tsx` — dark/light mode
- `artifacts/mobile/hooks/useColors.ts` — color hook (import from here, NOT ThemeContext)
- `artifacts/mobile/components/ConfirmModal.tsx` — universal replacement for Alert.alert

## Architecture decisions

- AsyncStorage only — no database, no backend, all data local
- `useColors()` must come from `@/hooks/useColors`, not `@/context/ThemeContext`
- `Alert.alert` is blocked in Replit iframe — use `ConfirmModal` everywhere
- Tab bar + button uses module-level `router` singleton (not `useRouter` hook) inside `tabBarButton` to avoid "Invalid hook call" crash
- Center tab placeholder named `new` (not `add`) to avoid route collision with `app/add.tsx`

## Product

- Save any video/link from any platform
- AI auto-categorizes content into skill sets
- Track streaks, progress, and completion stats
- Dark mode by default, light mode toggle

## User preferences

- Branding: indigo/purple gradients, dark default
- App name: SkillSee

## Gotchas

- Never use `useRouter` or any hook inside `tabBarButton` — use `import { router } from "expo-router"` (module-level singleton)
- Never create `(tabs)/add.tsx` — it collides with `app/add.tsx` (the modal). The center tab placeholder is `(tabs)/new.tsx`
- `Alert.alert` is blocked in Replit iframe — always use `ConfirmModal`
- Never use `NativeTabLayout` / `expo-router/unstable-native-tabs` — it has no center add button and `isLiquidGlassAvailable()` returns true on modern iOS, silently hiding the + button. Always use `ClassicTabLayout` (has BlurView glass on iOS anyway)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for Expo-specific patterns
