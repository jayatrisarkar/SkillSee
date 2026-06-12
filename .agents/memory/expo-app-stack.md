---
name: Content Library Expo App Stack
description: Key decisions for the Content Library mobile app — storage, charts, AI, navigation structure.
---

## Storage
- AsyncStorage keys: `@library:categories`, `@library:items`, `@library:profile`
- Default categories have stable IDs like `cat_dance`, `cat_coding` etc. (not random UUIDs)
- No backend DB; everything is local-only

## Charts
- `react-native-svg` (already installed) is used for all charts — ProgressRing, BarChart, ActivityHeatmap
- No external charting library needed

## AI / Classification
- OpenAI Replit integration is unavailable (awaiting_account_upgrade)
- Smart classification uses keyword/domain matching in `utils/classify.ts`
- AI Insights are generated locally in `utils/insights.ts`

## Navigation (4 tabs + modals)
- Tabs: Library (index), Search, Insights, Profile
- Modals (Stack): /add, /new-category, /edit-profile
- Stack screens: /content/[id], /category/[id]
- Categories tab exists at app/(tabs)/categories.tsx but is hidden via `href: null`

**Why:** Free tier limitation prevents OpenAI integration. Local-only approach keeps the app fast and private.
