---
name: Hidden Tabs Pattern in Expo Router
description: How to keep a tab route accessible via router.push() but hidden from the tab bar UI.
---

## Rule
Add the tab screen with `options={{ href: null }}` in ClassicTabLayout (Tabs.Screen). For NativeTabs, simply omit the NativeTabs.Trigger for that screen.

## How to apply
When a route should be navigable but not visible in the tab bar:
- Keep the file in `app/(tabs)/` so it stays part of the tab group
- In ClassicTabLayout: `<Tabs.Screen name="categories" options={{ href: null }} />`
- Navigate to it via `router.push("/(tabs)/categories")`
- NativeTabs: just don't add a Trigger for it

**Why:** Moving the file out of `(tabs)/` breaks the nested layout context and tab-group navigation. Keeping it in the group but hiding from bar is the correct pattern.
