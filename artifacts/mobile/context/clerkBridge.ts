// Module-level auth bridge — no React hooks.
// A ClerkBridge component (see _layout.tsx) registers the token getter
// after Clerk initializes. LibraryContext calls these functions directly.

let _tokenGetter: (() => Promise<string | null>) | null = null;
let _isSignedIn = false;
let _listeners: Array<(signedIn: boolean) => void> = [];

export function registerClerkBridge(
  getToken: () => Promise<string | null>,
  isSignedIn: boolean,
) {
  _tokenGetter = getToken;
  const changed = _isSignedIn !== isSignedIn;
  _isSignedIn = isSignedIn;
  if (changed) _listeners.forEach((fn) => fn(isSignedIn));
}

export async function getApiHeaders(): Promise<Record<string, string>> {
  if (!_tokenGetter || !_isSignedIn) return {};
  const token = await _tokenGetter();
  if (!token) return {};
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export function isUserSignedIn(): boolean {
  return _isSignedIn;
}

export function onAuthStateChange(fn: (signedIn: boolean) => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter((l) => l !== fn); };
}
