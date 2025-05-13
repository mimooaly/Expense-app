import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "../firebaseConfig";
import expensesCateg from "../data/ExpenseCategories";

export interface Category {
  id: string;
  name: string;
  icon: string;
  isCustom?: boolean;
}

export function useCategories(hiddenCategories: string[] = []) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Load custom categories and user preferences
    const customCategoriesRef = ref(database, `customCategories/${user.uid}`);
    const userPrefsRef = ref(database, `userPreferences/${user.uid}/modifiedCategories`);

    const unsubscribeCustom = onValue(customCategoriesRef, (snapshot: any) => {
      const customData = snapshot.val();
      const unsubscribePrefs = onValue(userPrefsRef, (prefsSnapshot: any) => {
        const modifiedData = prefsSnapshot.val() || {};

        // Convert custom categories to array with prefixed IDs
        const customCategoriesList = customData
          ? Object.entries(customData).map(([id, value]: [string, any]) => ({
              ...value,
              id: `custom_${id}`,
              isCustom: true,
            }))
          : [];

        // Get modified default categories
        const modifiedCategoriesMap = Object.entries(modifiedData).reduce(
          (acc, [id, value]: [string, any]) => {
            acc[id] = value;
            return acc;
          },
          {} as Record<string, any>
        );

        // Combine with default categories, applying modifications
        const allCategories = [
          ...expensesCateg.map((cat) => {
            const id = cat.id.toString();
            // Skip if category is in hiddenCategories
            if (hiddenCategories.includes(id)) {
              return null;
            }
            if (modifiedCategoriesMap[id]) {
              return {
                ...cat,
                ...modifiedCategoriesMap[id],
                id,
              };
            }
            return {
              ...cat,
              id,
            };
          }).filter(Boolean), // Remove null entries
          ...customCategoriesList,
        ];

        // Sort categories: custom categories first, then default categories
        allCategories.sort((a, b) => {
          if (a.isCustom && !b.isCustom) return -1;
          if (!a.isCustom && b.isCustom) return 1;
          return a.name.localeCompare(b.name);
        });

        setCategories(allCategories);
      });
      return () => unsubscribePrefs();
    });
    return () => unsubscribeCustom();
  }, [hiddenCategories]); // Add hiddenCategories as a dependency

  return categories;
} 