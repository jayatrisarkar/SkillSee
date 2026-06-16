---
name: expo-router v6 tabBarButton hook crash
description: Why tabBarButton always crashes with "Invalid hook call" and the correct fix.
---

## Rule
Never call any hook (useRouter, useColors, etc.) inside `tabBarButton`. Use the module-level `router` singleton from `expo-router` instead.

**Why:** React Navigation's BottomTabBar renders `tabBarButton` during the tab bar's own render cycle, which may happen before or outside the full React component tree context. Hooks called there violate React's rules-of-hooks and produce "Invalid hook call in BottomTabNavigator".

**How to apply:**
```tsx
import { Tabs, router } from "expo-router";

const AddButton = () => (
  <TouchableOpacity onPress={() => router.push("/add")}>
    ...
  </TouchableOpacity>
);

// In Tabs.Screen options:
tabBarButton: AddButton,
```

Also: the tab screen component itself (`(tabs)/add.tsx`) should NOT use `useRouter()` at top level during initialization — use a plain `<View />` placeholder. The `router` singleton is confirmed exported from expo-router@6.0.24 (`exports.router = imperative_api_1.router`).

**Confirmed:** `<Redirect>` from expo-router inside a tab screen also causes the crash for the same reason.

## Additional gotcha — route name collision
The placeholder tab file inside `(tabs)/` must NOT share the same name as a root-level screen. E.g. `(tabs)/add.tsx` + `app/add.tsx` both resolve to `/add`, causing `router.push("/add")` to switch to the blank tab instead of opening the root modal. Fix: rename the placeholder (e.g. `(tabs)/new.tsx`) so only the root screen owns `/add`.
