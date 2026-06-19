import React, { createContext, useContext } from "react";

export const REVENUECAT_ENTITLEMENT_IDENTIFIER = "premium";

export function initializeRevenueCat() {
}

type SubscriptionContextValue = {
  customerInfo: null;
  offerings: null;
  isSubscribed: boolean;
  isLoading: boolean;
  purchase: (pkg: any) => Promise<void>;
  restore: () => Promise<void>;
  isPurchasing: boolean;
  isRestoring: boolean;
  purchaseError: null;
};

const defaultValue: SubscriptionContextValue = {
  customerInfo: null,
  offerings: null,
  isSubscribed: false,
  isLoading: false,
  purchase: async () => {},
  restore: async () => {},
  isPurchasing: false,
  isRestoring: false,
  purchaseError: null,
};

const Context = createContext<SubscriptionContextValue>(defaultValue);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  return <Context.Provider value={defaultValue}>{children}</Context.Provider>;
}

export function useSubscription() {
  return useContext(Context);
}
