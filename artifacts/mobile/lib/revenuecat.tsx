import React, { createContext, useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

export const REVENUECAT_ENTITLEMENT_IDENTIFIER = "premium";

export function initializeRevenueCat() {
  console.log("[RevenueCat] Native SDK not included in this build. IAP disabled.");
}

function useSubscriptionContext() {
  const customerInfoQuery = useQuery({
    queryKey: ["revenuecat", "customer-info"],
    queryFn: async () => null,
    staleTime: 60_000,
    retry: false,
  });

  const offeringsQuery = useQuery({
    queryKey: ["revenuecat", "offerings"],
    queryFn: async () => null,
    staleTime: 300_000,
    retry: false,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (_pkg: any) => {
      throw new Error("In-app purchases not available in this build.");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      throw new Error("Restore purchases not available in this build.");
    },
  });

  return {
    customerInfo: null,
    offerings: null,
    isSubscribed: false,
    isLoading: false,
    purchase: purchaseMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    purchaseError: purchaseMutation.error,
  };
}

type SubscriptionContextValue = ReturnType<typeof useSubscriptionContext>;
const Context = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useSubscriptionContext();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSubscription() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useSubscription must be inside SubscriptionProvider");
  return ctx;
}
