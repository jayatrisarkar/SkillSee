/**
 * ShareContext — handles system share intents (Android ACTION_SEND / iOS Share Extension).
 *
 * To plug in AI categorization later:
 *   Replace categorizeContent() in lib/categorize.ts — same signature, no other changes needed.
 */

import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

import { ShareSaveModal, type SharePayload } from "@/components/ShareSaveModal";
import { useLibrary } from "@/context/LibraryContext";
import { categorizeContent, detectPlatform, type SourcePlatform } from "@/lib/categorize";
import { getAutoSave } from "@/lib/shareSettings";

// ── Safe import of expo-share-intent ─────────────────────────────────────────
// expo-share-intent requires a native dev build; falls back gracefully on web.

type ShareIntentResult = {
  hasShareIntent: boolean;
  shareIntent: { text?: string; webUrl?: string; title?: string } | null;
  resetShareIntent: () => void;
};

const noopIntentHook = (): ShareIntentResult => ({
  hasShareIntent: false,
  shareIntent: null,
  resetShareIntent: () => {},
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _ShareIntentProvider: React.ComponentType<{ children: React.ReactNode }> | null = null;
// Always assign a stable hook reference at module load time (not render time)
let _useShareIntentHook: () => ShareIntentResult = noopIntentHook;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("expo-share-intent");
  if (mod.ShareIntentProvider && mod.useShareIntentContext) {
    _ShareIntentProvider = mod.ShareIntentProvider;
    _useShareIntentHook = mod.useShareIntentContext;
  }
} catch {
  // Native module unavailable (web dev, Expo Go without dev build)
}

// Stable references — these never change after module load, so hook rules are satisfied.
const ShareIntentProvider = _ShareIntentProvider;
const useShareIntentHook = _useShareIntentHook;

// ── ShareContext public API ───────────────────────────────────────────────────

interface ShareContextValue {
  /** Trigger the share save flow from within the app (e.g. for testing). */
  triggerShare: (url: string, title?: string) => void;
}

const ShareContext = createContext<ShareContextValue | null>(null);

export function useShare() {
  const ctx = useContext(ShareContext);
  if (!ctx) throw new Error("useShare must be inside ShareProvider");
  return ctx;
}

// ── ShareHandler: always-rendered, always calls the (possibly noop) hook ─────

function ShareHandler({ children }: { children: React.ReactNode }) {
  const { addItem } = useLibrary();
  const [pending, setPending] = useState<SharePayload | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const processedRef = useRef<string | null>(null);

  // This hook is either the real expo-share-intent hook or the noop.
  // The reference is stable (set at module load), so React rules are satisfied.
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentHook();

  function buildPayload(rawUrl: string, rawTitle: string): SharePayload {
    const platform: SourcePlatform = detectPlatform(rawUrl);
    const { categoryId } = categorizeContent(rawTitle, "", rawUrl);
    return { url: rawUrl, title: rawTitle || rawUrl, platform, suggestedCategoryId: categoryId };
  }

  const processIntent = useCallback(
    async (rawUrl: string, rawTitle: string) => {
      if (!rawUrl || processedRef.current === rawUrl) return;
      processedRef.current = rawUrl;

      const payload = buildPayload(rawUrl, rawTitle);
      const autoSave = await getAutoSave();

      if (autoSave) {
        const { categoryId } = categorizeContent(rawTitle, "", rawUrl);
        addItem({
          title: rawTitle || rawUrl,
          url: rawUrl,
          notes: "",
          categoryId,
          tags: [],
          status: "none",
          isArchived: false,
          thumbnailUrl: undefined,
          description: undefined,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        resetShareIntent();
      } else {
        setPending(payload);
      }
    },
    [addItem, resetShareIntent]
  );

  useEffect(() => {
    if (!hasShareIntent || !shareIntent) return;
    const rawUrl = (shareIntent as any).webUrl || (shareIntent as any).text || "";
    const rawTitle = (shareIntent as any).title || "";
    if (rawUrl) processIntent(rawUrl, rawTitle);
  }, [hasShareIntent, shareIntent, processIntent]);

  function handleSave(categoryId: string, title: string) {
    if (!pending) return;
    setIsSaving(true);
    addItem({
      title,
      url: pending.url,
      notes: "",
      categoryId,
      tags: [],
      status: "none",
      isArchived: false,
      thumbnailUrl: pending.thumbnailUrl,
      description: undefined,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(false);
    setPending(null);
    processedRef.current = null;
    resetShareIntent();
  }

  function handleCancel() {
    setPending(null);
    processedRef.current = null;
    resetShareIntent();
  }

  const triggerShare = useCallback(
    (url: string, title = "") => {
      processedRef.current = null;
      processIntent(url, title);
    },
    [processIntent]
  );

  return (
    <ShareContext.Provider value={{ triggerShare }}>
      <ShareSaveModal
        visible={!!pending}
        payload={pending}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />
      {children}
    </ShareContext.Provider>
  );
}

// ── ShareProvider: wraps with native ShareIntentProvider when available ───────

export function ShareProvider({ children }: { children: React.ReactNode }) {
  const needsNativeWrapper = Platform.OS !== "web" && ShareIntentProvider !== null;

  if (needsNativeWrapper && ShareIntentProvider) {
    return (
      <ShareIntentProvider>
        <ShareHandler>{children}</ShareHandler>
      </ShareIntentProvider>
    );
  }

  return <ShareHandler>{children}</ShareHandler>;
}
