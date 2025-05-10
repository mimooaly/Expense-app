import React, { useState, useEffect } from "react";
import { Box, TextField, MenuItem } from "@mui/material";
import expensesCateg from "../data/ExpenseCategories";
import { database, auth } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";
import * as FeatherIcons from "react-feather";

interface ExpensesFilterProps {
  category: string;
  month: number;
  year: number;
  onCategoryChange: (category: string) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  isCustom?: boolean;
}

const ExpensesFilter: React.FC<ExpensesFilterProps> = ({
  category,
  month,
  year,
  onCategoryChange,
  onMonthChange,
  onYearChange,
}) => {
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

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  const getCategoryIcon = (iconName: string) => {
    if (iconName === "folder") {
      return (
        <FeatherIcons.Folder
          size={18}
          style={{ marginRight: 8, verticalAlign: "middle" }}
        />
      );
    }
    let featherIconName;
    if (iconName === "github") {
      featherIconName = "GitHub";
    } else {
      featherIconName = iconName
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
    }
    const IconComponent = (FeatherIcons as any)[featherIconName];
    return IconComponent ? (
      <IconComponent
        size={18}
        style={{ marginRight: 8, verticalAlign: "middle" }}
      />
    ) : null;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: { xs: 0, sm: 2 },
      }}
    >
      <TextField
        select
        label="Category"
        value={category}
        size="small"
        onChange={(e) => onCategoryChange(e.target.value)}
        sx={{ minWidth: { sm: 120 }, width: { xs: "100%", sm: "auto" } }}
      >
        <MenuItem value="">All</MenuItem>
        {categories.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {getCategoryIcon(cat.icon)}
              {cat.name}
            </Box>
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Month"
        value={month}
        size="small"
        onChange={(e) => onMonthChange(Number(e.target.value))}
        sx={{ minWidth: { sm: 120 }, width: { xs: "100%", sm: "auto" } }}
      >
        <MenuItem value={0}>All</MenuItem>
        {months.map((month, index) => (
          <MenuItem key={month} value={index + 1}>
            {month}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Year"
        value={year}
        size="small"
        onChange={(e) => onYearChange(Number(e.target.value))}
        sx={{ minWidth: { sm: 120 }, width: { xs: "100%", sm: "auto" } }}
      >
        {years.map((yearItem) => (
          <MenuItem key={yearItem} value={yearItem}>
            {yearItem}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default ExpensesFilter;
