---
name: Clerk hook in context provider crashes
description: Using useAuth() inside a React context Provider component causes "Invalid hook call" after Clerk initializes
---

# Rule
Never call `useAuth()` (or other Clerk hooks) inside a React context Provider component. Use the module-level bridge pattern instead.

**Why:** When Clerk initializes and triggers a re-render, `useAuth()` inside a context provider can cause "Invalid hook call" errors, likely due to timing issues with Clerk's internal context resolution across the multiple pnpm instances of `@clerk/clerk-expo`.

**How to apply:**
1. Create `context/clerkBridge.ts` — module-level variables + `registerClerkBridge(getToken, isSignedIn)`, `getApiHeaders()`, `isUserSignedIn()`, `onAuthStateChange(fn)`.
2. Create a `ClerkBridge` React component (renders null) that calls `useAuth()` and calls `registerClerkBridge` in a `useEffect`. Place it inside `ClerkProvider` in `_layout.tsx`.
3. Other contexts (LibraryContext etc.) call the module-level functions directly — no hooks needed.

This is the correct pattern for Expo SDK 54 + `@clerk/clerk-expo@^2.19.31` + React 19.
