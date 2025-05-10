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

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Load custom categories and user preferences
    const customCategoriesRef = ref(database, `customCategories/${user.uid}`);
    const userPrefsRef = ref(database, `userPreferences/${user.uid}`);

    const unsubscribeCustom = onValue(customCategoriesRef, (snapshot) => {
      const customData = snapshot.val();
      const unsubscribePrefs = onValue(userPrefsRef, (prefsSnapshot) => {
        const prefsData = prefsSnapshot.val();
        const modifiedData = prefsData?.modifiedCategories || {};

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
          }),
          ...customCategoriesList,
        ];
        setCategories(allCategories);
      });
      return () => unsubscribePrefs();
    });
    return () => unsubscribeCustom();
  }, []);

  return categories;
} 