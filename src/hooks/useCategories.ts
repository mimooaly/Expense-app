import { useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "../firebaseConfig";
import expensesCateg from "../data/ExpenseCategories";
import React from "react";

export interface Category {
  id: string;
  name: string;
  icon: string;
  isCustom?: boolean;
}

export interface UseCategoriesReturn {
  categories: Category[];
  getCategoryIcon: (categoryId: string) => React.ReactElement | null;
  getCategoryName: (categoryId: string) => string;
  getCategoryById: (categoryId: string) => Category | undefined;
  loading: boolean;
}

export function useCategories(hiddenCategories: string[] = []): UseCategoriesReturn {
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [modifiedCategories, setModifiedCategories] = useState<Record<string, any>>({});

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Load custom categories
    const customCategoriesRef = ref(database, `customCategories/${user.uid}`);
    const userPrefsRef = ref(database, `userPreferences/${user.uid}/modifiedCategories`);

    const unsubscribeCustom = onValue(customCategoriesRef, (snapshot: any) => {
      const customData = snapshot.val() || {};
      const customCategoriesList = Object.entries(customData).map(([id, value]: [string, any]) => ({
        ...value,
        id: `custom_${id}`,
        isCustom: true,
      }));
      setCustomCategories(customCategoriesList);
    });

    const unsubscribePrefs = onValue(userPrefsRef, (prefsSnapshot: any) => {
      const modifiedData = prefsSnapshot.val() || {};
      setModifiedCategories(modifiedData);
    });

    return () => {
      unsubscribeCustom();
      unsubscribePrefs();
    };
  }, []); // No dependencies needed as we're using onValue

  // Memoize the combined categories to prevent unnecessary recalculations
  const categories = useMemo(() => {
    // Combine with default categories, applying modifications
    const allCategories = [
      ...expensesCateg.map((cat) => {
        const id = cat.id.toString();
        // Skip if category is in hiddenCategories
        if (hiddenCategories.includes(id)) {
          return null;
        }
        if (modifiedCategories[id]) {
          return {
            ...cat,
            ...modifiedCategories[id],
            id,
          };
        }
        return {
          ...cat,
          id,
        };
      }).filter(Boolean), // Remove null entries
      ...customCategories,
    ];

    // Sort categories: custom categories first, then default categories
    return allCategories.sort((a, b) => {
      if (a.isCustom && !b.isCustom) return -1;
      if (!a.isCustom && b.isCustom) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [customCategories, modifiedCategories, hiddenCategories]);

  const getCategoryIcon = (categoryId: string): React.ReactElement | null => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return null;
    return React.createElement('span', {
      style: { fontSize: 20, marginRight: 8, verticalAlign: 'middle' },
      children: category.icon
    });
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const getCategoryById = (categoryId: string): Category | undefined => {
    return categories.find(cat => cat.id === categoryId);
  };

  const loading = false; // Implementation of loading

  return {
    categories,
    getCategoryIcon,
    getCategoryName,
    getCategoryById,
    loading,
  };
} 