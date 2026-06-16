---
name: ErrorBoundary must be inside ThemeProvider
description: Provider ordering issue that causes blank white screen with no visible error message
---

# Rule
`ErrorBoundary` must be placed INSIDE `ThemeProvider`, not wrapping it.

**Why:** `ErrorFallback` calls `useColors()` → `useTheme()`. If `ThemeProvider` is not an ancestor of `ErrorBoundary`, `ErrorFallback` crashes during rendering (secondary crash). React catches this but can't recover cleanly, showing a blank white screen with no error message.

**How to apply:** In `_layout.tsx` and any layout file, ensure the provider order is:
```jsx
<ThemeProvider>     // outer
  <ErrorBoundary>   // inner — fallback can now call useColors()
    ...
  </ErrorBoundary>
</ThemeProvider>
```
