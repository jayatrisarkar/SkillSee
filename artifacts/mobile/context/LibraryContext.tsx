import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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
}

interface LibraryContextType {
  categories: Category[];
  items: ContentItem[];
  isLoaded: boolean;
  addCategory: (name: string, icon: string, color: string) => Category;
  updateCategory: (id: string, updates: Partial<Omit<Category, "id" | "isDefault">>) => void;
  deleteCategory: (id: string, moveToId: string | null) => void;
  addItem: (data: Omit<ContentItem, "id" | "createdAt" | "updatedAt">) => ContentItem;
  updateItem: (id: string, updates: Partial<Omit<ContentItem, "id" | "createdAt">>) => void;
  deleteItem: (id: string) => void;
  getItemsByCategory: (categoryId: string, includeArchived?: boolean) => ContentItem[];
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

const LibraryContext = createContext<LibraryContextType | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const saveCategories = useCallback(async (cats: Category[]) => {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  }, []);

  const saveItems = useCallback(async (its: ContentItem[]) => {
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(its));
  }, []);

  const addCategory = useCallback(
    (name: string, icon: string, color: string): Category => {
      const cat: Category = { id: makeId(), name, icon, color, isDefault: false };
      setCategories((prev) => {
        const next = [...prev, cat];
        saveCategories(next);
        return next;
      });
      return cat;
    },
    [saveCategories]
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Omit<Category, "id" | "isDefault">>) => {
      setCategories((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
        saveCategories(next);
        return next;
      });
    },
    [saveCategories]
  );

  const deleteCategory = useCallback(
    (id: string, moveToId: string | null) => {
      setCategories((prev) => {
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
    [saveCategories, saveItems]
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
        return next;
      });
      return item;
    },
    [saveItems]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<ContentItem, "id" | "createdAt">>) => {
      setItems((prev) => {
        const next = prev.map((it) =>
          it.id === id ? { ...it, ...updates, updatedAt: Date.now() } : it
        );
        saveItems(next);
        return next;
      });
    },
    [saveItems]
  );

  const deleteItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((it) => it.id !== id);
        saveItems(next);
        return next;
      });
    },
    [saveItems]
  );

  const getItemsByCategory = useCallback(
    (categoryId: string, includeArchived = false): ContentItem[] =>
      items.filter(
        (it) => it.categoryId === categoryId && (includeArchived || !it.isArchived)
      ),
    [items]
  );

  return (
    <LibraryContext.Provider
      value={{
        categories,
        items,
        isLoaded,
        addCategory,
        updateCategory,
        deleteCategory,
        addItem,
        updateItem,
        deleteItem,
        getItemsByCategory,
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
