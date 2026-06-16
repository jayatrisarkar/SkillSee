// ClerkBridge — renders null, just keeps the module-level bridge in sync.
// This is the ONLY component that calls useAuth(). It lives inside ClerkProvider
// so the hook is always valid, but it doesn't create a React context of its own.
import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { registerClerkBridge } from "./clerkBridge";

export function ClerkBridge() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    registerClerkBridge(
      () => getToken().then((t) => t ?? null),
      !!isSignedIn,
    );
  }, [getToken, isSignedIn]);

  return null;
}
