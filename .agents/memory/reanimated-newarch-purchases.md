---
name: Reanimated 4 + New Architecture + react-native-purchases
description: Critical build constraints for SkillSee's Android EAS build with Reanimated 4.x
---

## Rule
`react-native-reanimated@4.x` requires `newArchEnabled: true`. Setting it to `false` causes Gradle to fail with `:react-native-reanimated:assertNewArchitectureEnabledTask FAILED`.

`react-native-purchases` native SDK causes immediate launch crash on Android release builds (even with New Architecture enabled). Use the pure-JS stub in `lib/revenuecat.tsx` instead — never add `react-native-purchases` back to `dependencies`.

**Why:** Reanimated 4 dropped support for the old architecture. react-native-purchases@10.3.0 with RN 0.81.5 + New Architecture crashes the process before JS loads.

**How to apply:** 
- Always keep `newArchEnabled: true` in app.json
- Never add `react-native-purchases` to package.json dependencies
- Use the stub in `lib/revenuecat.tsx` (pure-JS, no native module)
- When RevenueCat is ready: add it as a devDependency and use Metro extraNodeModules alias, NOT as a real native dependency
