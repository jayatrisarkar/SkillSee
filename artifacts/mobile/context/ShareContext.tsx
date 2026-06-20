import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
} from "react";

import { ShareSaveModal, type SharePayload } from "@/components/ShareSaveModal";
import { useLibrary } from "@/context/LibraryContext";
import { categorizeContent, detectPlatform, type SourcePlatform } from "@/lib/categorize";
import { getAutoSave } from "@/lib/shareSettings";

interface ShareContextValue {
  triggerShare: (url: string, title?: string) => void;
}

const ShareContext = createContext<ShareContextValue | null>(null);

export function useShare() {
  const ctx = useContext(ShareContext);
  if (!ctx) throw new Error("useShare must be inside ShareProvider");
  return ctx;
}

function buildPayload(rawUrl: string, rawTitle: string): SharePayload {
  const platform: SourcePlatform = detectPlatform(rawUrl);
  const { categoryId } = categorizeContent(rawTitle, "", rawUrl);
  return { url: rawUrl, title: rawTitle || rawUrl, platform, suggestedCategoryId: categoryId };
}

export function ShareProvider({ children }: { children: React.ReactNode }) {
  const { addItem } = useLibrary();
  const [pending, setPending] = useState<SharePayload | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const processedRef = useRef<string | null>(null);

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
      } else {
        setPending(payload);
      }
    },
    [addItem]
  );

  const triggerShare = useCallback(
    (url: string, title = "") => {
      processedRef.current = null;
      processIntent(url, title);
    },
    [processIntent]
  );

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
  }

  function handleCancel() {
    setPending(null);
    processedRef.current = null;
  }

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
