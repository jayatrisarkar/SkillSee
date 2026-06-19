import React, { createContext, useContext } from "react";
import { Platform } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";

export const REVENUECAT_ENTITLEMENT_IDENTIFIER = "premium";

const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const TEST_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;

function getApiKey(): string | null {
  if (Platform.OS === "android") return ANDROID_KEY ?? TEST_KEY ?? null;
  if (Platform.OS === "ios") return IOS_KEY ?? TEST_KEY ?? null;
  return TEST_KEY ?? null;
}

let _configured = false;

export function initializeRevenueCat() {
  if (Platform.OS === "web") return;
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "RevenueCat API key not configured. Set EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY in EAS."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Purchases = require("react-native-purchases").default;
  Purchases.configure({ apiKey });
  _configured = true;
}

function getPurchases() {
  if (!_configured || Platform.OS === "web") return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("react-native-purchases").default;
}

function useSubscriptionContext() {
  const customerInfoQuery = useQuery({
    queryKey: ["revenuecat", "customer-info"],
    queryFn: async () => {
      const Purchases = getPurchases();
      if (!Purchases) return null;
      return Purchases.getCustomerInfo();
    },
    staleTime: 60_000,
    retry: false,
  });

  const offeringsQuery = useQuery({
    queryKey: ["revenuecat", "offerings"],
    queryFn: async () => {
      const Purchases = getPurchases();
      if (!Purchases) return null;
      return Purchases.getOfferings();
    },
    staleTime: 300_000,
    retry: false,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: any) => {
      const Purchases = getPurchases();
      if (!Purchases) throw new Error("Purchases not configured");
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo;
    },
    onSuccess: () => customerInfoQuery.refetch(),
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      const Purchases = getPurchases();
      if (!Purchases) throw new Error("Purchases not configured");
      return Purchases.restorePurchases();
    },
    onSuccess: () => customerInfoQuery.refetch(),
  });

  const isSubscribed =
    customerInfoQuery.data?.entitlements?.active?.[
      REVENUECAT_ENTITLEMENT_IDENTIFIER
    ] !== undefined;

  return {
    customerInfo: customerInfoQuery.data ?? null,
    offerings: offeringsQuery.data ?? null,
    isSubscribed,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
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
