import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getApiHeaders, isUserSignedIn, onAuthStateChange } from "./clerkBridge";
import { getPendingImport, clearPendingImport } from "./pendingImport";
import { useToast } from "./ToastContext";

export type ContentStatus = "none" | "learning" | "completed";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  url: string;
  notes: string;
  categoryId: string;
  tags: string[];
  status: ContentStatus;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
  thumbnailUrl?: string;
  description?: string;
}

interface LibraryContextType {
  categories: Category[];
  items: ContentItem[];
  isLoaded: boolean;
  isSyncing: boolean;
  addCategory: (name: string, icon: string, color: string) => Category;
  updateCategory: (id: string, updates: Partial<Omit<Category, "id" | "isDefault">>) => void;
  deleteCategory: (id: string, moveToId: string | null) => void;
  addItem: (data: Omit<ContentItem, "id" | "createdAt" | "updatedAt">) => ContentItem;
  updateItem: (id: string, updates: Partial<Omit<ContentItem, "id" | "createdAt">>) => void;
  deleteItem: (id: string) => void;
  getItemsByCategory: (categoryId: string, includeArchived?: boolean) => ContentItem[];
  clearAllItems: () => Promise<void>;
  resetCategories: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const CATEGORIES_KEY = "@library:categories";
const ITEMS_KEY = "@library:items";

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat_dance", name: "Dance", icon: "musical-notes-outline", color: "#EC4899", isDefault: true },
  { id: "cat_singing", name: "Singing", icon: "mic-outline", color: "#A855F7", isDefault: true },
  { id: "cat_instruments", name: "Instruments", icon: "musical-note-outline", color: "#F59E0B", isDefault: true },
  { id: "cat_coding", name: "Coding", icon: "code-slash-outline", color: "#22D3EE", isDefault: true },
  { id: "cat_finance", name: "Finance", icon: "trending-up-outline", color: "#10B981", isDefault: true },
  { id: "cat_fitness", name: "Gym & Fitness", icon: "barbell-outline", color: "#EF4444", isDefault: true },
  { id: "cat_cooking", name: "Cooking", icon: "restaurant-outline", color: "#F97316", isDefault: true },
  { id: "cat_art", name: "Art", icon: "color-palette-outline", color: "#8B5CF6", isDefault: true },
  { id: "cat_learning", name: "Learning", icon: "book-outline", color: "#3B82F6", isDefault: true },
];

// ─── API helpers ─────────────────────────────────────────────────────────────

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN ?? "";
  return domain ? `https://${domain}/api/library` : "/api/library";
}

function localItemToApi(item: ContentItem, idx: number) {
  return {
    id: item.id,
    categoryId: item.categoryId,
    title: item.title,
    url: item.url,
    notes: item.notes,
    platform: "other",
    thumbnail: item.thumbnailUrl,
    completed: item.status === "completed",
    position: idx,
  };
}

function localCategoryToApi(cat: Category) {
  return {
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    isDefault: cat.isDefault,
  };
}

function apiItemToLocal(row: any): ContentItem {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    notes: row.notes ?? "",
    categoryId: row.categoryId,
    tags: [],
    status: row.completed ? "completed" : "none",
    isArchived: false,
    createdAt: row.savedAt ? new Date(row.savedAt).getTime() : Date.now(),
    updatedAt: Date.now(),
    thumbnailUrl: row.thumbnail ?? undefined,
  };
}

function apiCategoryToLocal(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isDefault: row.isDefault ?? false,
  };
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(isUserSignedIn);
  const prevSignedIn = useRef<boolean | null>(null);
  const { showToast } = useToast();

  useEffect(() => onAuthStateChange(setIsSignedIn), []);

  // ── Local persistence ─────────────────────────────────────────────────────

  const saveCategories = useCallback(async (cats: Category[]) => {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  }, []);

  const saveItems = useCallback(async (its: ContentItem[]) => {
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(its));
  }, []);

  // ── Fire-and-forget cloud mutations ──────────────────────────────────────

  const pushCategoryUpdate = useCallback(async (cat: Category, method: "POST" | "DELETE") => {
    if (!isSignedIn) return;
    try {
      const headers = await getApiHeaders();
      if (!headers.Authorization) return;
      if (method === "DELETE") {
        await fetch(`${getApiBase()}/categories/${cat.id}`, { method: "DELETE", headers });
      } else {
        await fetch(`${getApiBase()}/categories`, {
          method: "POST",
          headers,
          body: JSON.stringify(localCategoryToApi(cat)),
        });
      }
    } catch {}
  }, [isSignedIn]);

  const pushItemMutation = useCallback(async (item: ContentItem, method: "POST" | "DELETE", idx = 0) => {
    if (!isSignedIn) return;
    try {
      const headers = await getApiHeaders();
      if (!headers.Authorization) return;
      if (method === "DELETE") {
        await fetch(`${getApiBase()}/items/${item.id}`, { method: "DELETE", headers });
      } else {
        await fetch(`${getApiBase()}/items`, {
          method: "POST",
          headers,
          body: JSON.stringify(localItemToApi(item, idx)),
        });
      }
    } catch {}
  }, [isSignedIn]);

  // ── Mutations (defined before syncNow so syncNow can call them) ───────────

  const addCategory = useCallback(
    (name: string, icon: string, color: string): Category => {
      const cat: Category = { id: makeId(), name, icon, color, isDefault: false };
      setCategories((prev) => {
        const next = [...prev, cat];
        saveCategories(next);
        return next;
      });
      pushCategoryUpdate(cat, "POST");
      return cat;
    },
    [saveCategories, pushCategoryUpdate]
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Omit<Category, "id" | "isDefault">>) => {
      setCategories((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
        saveCategories(next);
        const updated = next.find((c) => c.id === id);
        if (updated) pushCategoryUpdate(updated, "POST");
        return next;
      });
    },
    [saveCategories, pushCategoryUpdate]
  );

  const deleteCategory = useCallback(
    (id: string, moveToId: string | null) => {
      setCategories((prev) => {
        const cat = prev.find((c) => c.id === id);
        if (cat) pushCategoryUpdate(cat, "DELETE");
        const next = prev.filter((c) => c.id !== id);
        saveCategories(next);
        return next;
      });
      setItems((prev) => {
        let next: ContentItem[];
        if (moveToId) {
          next = prev.map((it) =>
            it.categoryId === id ? { ...it, categoryId: moveToId, updatedAt: Date.now() } : it
          );
        } else {
          next = prev.filter((it) => it.categoryId !== id);
        }
        saveItems(next);
        return next;
      });
    },
    [saveCategories, saveItems, pushCategoryUpdate]
  );

  const addItem = useCallback(
    (data: Omit<ContentItem, "id" | "createdAt" | "updatedAt">): ContentItem => {
      const item: ContentItem = {
        ...data,
        id: makeId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setItems((prev) => {
        const next = [item, ...prev];
        saveItems(next);
        pushItemMutation(item, "POST", 0);
        return next;
      });
      return item;
    },
    [saveItems, pushItemMutation]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<ContentItem, "id" | "createdAt">>) => {
      setItems((prev) => {
        const next = prev.map((it) =>
          it.id === id ? { ...it, ...updates, updatedAt: Date.now() } : it
        );
        saveItems(next);
        const updated = next.find((it) => it.id === id);
        if (updated) pushItemMutation(updated, "POST", next.indexOf(updated));
        return next;
      });
    },
    [saveItems, pushItemMutation]
  );

  const deleteItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const item = prev.find((it) => it.id === id);
        if (item) pushItemMutation(item, "DELETE");
        const next = prev.filter((it) => it.id !== id);
        saveItems(next);
        return next;
      });
    },
    [saveItems, pushItemMutation]
  );

  const getItemsByCategory = useCallback(
    (categoryId: string, includeArchived = false): ContentItem[] =>
      items.filter(
        (it) => it.categoryId === categoryId && (includeArchived || !it.isArchived)
      ),
    [items]
  );

  const clearAllItems = useCallback(async () => {
    setItems([]);
    await AsyncStorage.removeItem(ITEMS_KEY);
  }, []);

  const resetCategories = useCallback(async () => {
    setCategories(DEFAULT_CATEGORIES);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  }, []);

  // ── Cloud sync (defined after mutations so it can call addCategory/addItem) ─

  const syncNow = useCallback(async () => {
    if (!isSignedIn) return;
    const headers = await getApiHeaders();
    if (!headers.Authorization) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`${getApiBase()}/sync`, { headers });
      if (!res.ok) return;
      const { categories: cloudCats, items: cloudItems } = await res.json();
      const localCats = (await AsyncStorage.getItem(CATEGORIES_KEY));
      const localItemsRaw = (await AsyncStorage.getItem(ITEMS_KEY));

      const localCatsArr: Category[] = localCats ? JSON.parse(localCats) : DEFAULT_CATEGORIES;
      const localItemsArr: ContentItem[] = localItemsRaw ? JSON.parse(localItemsRaw) : [];

      if (cloudCats.length === 0 && cloudItems.length === 0 && (localCatsArr.length > 0 || localItemsArr.length > 0)) {
        // First sign-in — push local data to cloud
        await fetch(`${getApiBase()}/sync`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            categories: localCatsArr.map(localCategoryToApi),
            items: localItemsArr.map(localItemToApi),
          }),
        });
      } else if (cloudCats.length > 0 || cloudItems.length > 0) {
        // Cloud has data — use it as source of truth
        const mergedCats = cloudCats.map(apiCategoryToLocal);
        const mergedItems = cloudItems.map(apiItemToLocal);
        setCategories(mergedCats);
        setItems(mergedItems);
        await saveCategories(mergedCats);
        await saveItems(mergedItems);
      }

      // After cloud is reconciled, execute any pending playlist import.
      // Running here (not in a separate effect) prevents a race where a
      // concurrent cloud pull could overwrite locally-inserted items.
      const pending = await getPendingImport();
      if (pending) {
        await clearPendingImport();
        let totalItems = 0;
        const catNames: string[] = [];
        for (const catData of pending.cats) {
          const cat = addCategory(catData.name, catData.icon, catData.color);
          catNames.push(catData.name);
          for (const rawItem of catData.items) {
            addItem({
              title: rawItem.t,
              url: rawItem.u,
              notes: "",
              categoryId: cat.id,
              tags: [],
              status: "none",
              isArchived: false,
            });
            totalItems++;
          }
        }
        const itemWord = totalItems === 1 ? "item" : "items";
        const dest =
          catNames.length === 1
            ? catNames[0]
            : `${catNames.length} categories`;
        showToast(`${totalItems} ${itemWord} added to ${dest}`);
      }
    } catch {}
    setIsSyncing(false);
  }, [isSignedIn, saveCategories, saveItems, addCategory, addItem, showToast]);

  // ── Initial load ──────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const [catJson, itemJson] = await Promise.all([
          AsyncStorage.getItem(CATEGORIES_KEY),
          AsyncStorage.getItem(ITEMS_KEY),
        ]);
        if (catJson) setCategories(JSON.parse(catJson));
        if (itemJson) setItems(JSON.parse(itemJson));
      } catch {}
      setIsLoaded(true);
    }
    load();
  }, []);

  // ── Sync when sign-in state changes ───────────────────────────────────────

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && prevSignedIn.current !== true) {
      syncNow();
    }
    prevSignedIn.current = isSignedIn;
  }, [isSignedIn, isLoaded, syncNow]);

  return (
    <LibraryContext.Provider
      value={{
        categories,
        items,
        isLoaded,
        isSyncing,
        addCategory,
        updateCategory,
        deleteCategory,
        addItem,
        updateItem,
        deleteItem,
        getItemsByCategory,
        clearAllItems,
        resetCategories,
        syncNow,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextType {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
