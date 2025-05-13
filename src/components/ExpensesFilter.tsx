import React from "react";
import { Box, TextField, MenuItem, CircularProgress } from "@mui/material";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { useCategories } from "../hooks/useCategories";

interface Category {
  id: string;
  name: string;
  icon: string;
  isCustom?: boolean;
}

interface ExpensesFilterProps {
  category: string;
  month: number;
  year: number;
  categories: Category[];
  extraCategoryNames?: string[];
  onCategoryChange: (category: string) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const ExpensesFilter: React.FC<ExpensesFilterProps> = ({
  category,
  month,
  year,
  extraCategoryNames = [],
  onCategoryChange,
  onMonthChange,
  onYearChange,
}) => {
  const { preferences } = useUserPreferences();
  const { categories: userCategories } = useCategories(
    preferences.hiddenCategories || []
  );

  if (!userCategories || userCategories.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 60,
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  const getCategoryIcon = (category: Category) => {
    return (
      <span style={{ fontSize: 20, marginRight: 8, verticalAlign: "middle" }}>
        {category.icon}
      </span>
    );
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
        onChange={(e) => onCategoryChange(String(e.target.value))}
        sx={{ minWidth: { sm: 120 }, width: { xs: "100%", sm: "auto" } }}
      >
        <MenuItem value="">All</MenuItem>
        {userCategories.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {getCategoryIcon(cat)}
              {cat.name}
            </Box>
          </MenuItem>
        ))}
        {/* Extra category names for backward compatibility - only show if not in main categories */}
        {extraCategoryNames
          .filter(
            (catName) => !userCategories.some((cat) => cat.name === catName)
          )
          .map((catName) => (
            <MenuItem key={catName} value={catName}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 20,
                    marginRight: 8,
                    verticalAlign: "middle",
                  }}
                >
                  📁
                </span>
                {catName}
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
        <MenuItem value={0}>All</MenuItem>
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
