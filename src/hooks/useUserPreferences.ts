import { useState, useEffect } from "react";
import { database, auth } from "../firebaseConfig";
import { ref, onValue, update } from "firebase/database";

export interface UserPreferences {
  defaultCurrency: string;
}

const defaultPreferences: UserPreferences = {
  defaultCurrency: "USD",
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
    const unsubscribe = onValue(preferencesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPreferences({
          ...defaultPreferences,
          ...data,
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

  return {
    preferences,
    loading,
    updatePreferences,
  };
}; 