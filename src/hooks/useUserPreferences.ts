import { useState, useEffect } from "react";
import { database, auth } from "../firebaseConfig";
import { ref, onValue, update} from "firebase/database";

export interface UserPreferences {
  defaultCurrency: string;
  hiddenCategories?: string[];
}

const defaultPreferences: UserPreferences = {
  defaultCurrency: "USD",
  hiddenCategories: [],
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const preferencesRef = ref(database, `userPreferences/${user.uid}`);
    const unsubscribe = onValue(preferencesRef, (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        setPreferences({
          ...defaultPreferences,
          ...data,
          hiddenCategories: data.hiddenCategories || [],
        });
      } else {
        setPreferences(defaultPreferences);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const preferencesRef = ref(database, `userPreferences/${user.uid}`);
      await update(preferencesRef, newPreferences);
      setPreferences((prev) => ({
        ...prev,
        ...newPreferences,
      }));
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw error;
    }
  };

  const hideCategory = async (categoryId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const hiddenCategories = [...(preferences.hiddenCategories || []), categoryId];
      await updatePreferences({ hiddenCategories });
    } catch (error) {
      console.error("Error hiding category:", error);
      throw error;
    }
  };

  const showCategory = async (categoryId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const hiddenCategories = (preferences.hiddenCategories || []).filter(id => id !== categoryId);
      await updatePreferences({ hiddenCategories });
    } catch (error) {
      console.error("Error showing category:", error);
      throw error;
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
    hideCategory,
    showCategory,
  };
}; 