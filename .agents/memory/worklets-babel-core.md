---
name: react-native-worklets babel/core version lock
description: react-native-worklets@0.5.1 Babel plugin relies on undeclared @babel/generator and @babel/traverse; bumping @babel/core breaks pnpm deduplication and causes iOS/Android Metro 500 while web/dev pass.
---

# react-native-worklets@0.5.1 — @babel/core version sensitivity

## The rule

Pin `@babel/core` in `artifacts/mobile/package.json` to `~7.25.2`. Do not bump it past 7.25.x as part of security scans or dep upgrades without verifying the production iOS bundle.

**Why:** `react-native-worklets@0.5.1`'s Babel plugin (bundled rollup bundle) does bare `require('@babel/generator')` and `require('@babel/traverse')` — neither is in its declared `dependencies`. With `@babel/core@7.25.x`, pnpm's deduplication happened to install those at a location that Node.js traversal finds. With `@babel/core@7.29.x`, they resolve to a different pnpm virtual-store path that worklets' plugin can't reach, crashing Metro with `Cannot find module '@babel/generator'`.

**How to apply:** When a security task bumps `@babel/core` in `artifacts/mobile/package.json`, revert it to `~7.25.2`. The GHSA vulnerability in @babel/core is a build-tool risk, not a server runtime risk — acceptable to leave at 7.25.x until worklets is upgraded to a version that declares its Babel deps properly.

**Symptom:** Metro HTTP 500 on iOS/Android production bundle (`dev=false&minify=true`), but web/dev bundles pass fine. Error message: `[BABEL] Cannot find module '@babel/generator'` or `'@babel/traverse'` in the require stack of `react-native-worklets/plugin/index.js`.

**Verification:** `curl -s -o /dev/null -w "%{http_code}" "http://localhost:<METRO_PORT>/artifacts/mobile/node_modules/expo-router/entry.bundle?platform=ios&dev=false&hot=false&lazy=false&minify=true" --max-time 90` should return 200.
