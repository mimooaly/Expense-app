import React from "react";
import { Box, TextField, MenuItem } from "@mui/material";
import expensesCateg from "../data/ExpenseCategories";

interface ExpensesFilterProps {
  category: number;
  month: number;
  year: number;
  onCategoryChange: (category: number) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const ExpensesFilter: React.FC<ExpensesFilterProps> = ({
  category,
  month,
  year,
  onCategoryChange,
  onMonthChange,
  onYearChange,
}) => {
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

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      <TextField
        select
        label="Category"
        value={category}
        size="small"
        onChange={(e) => onCategoryChange(Number(e.target.value))}
        sx={{ minWidth: 120 }}
      >
        <MenuItem value={0}>All</MenuItem>
        {expensesCateg.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            {cat.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Month"
        value={month}
        size="small"
        onChange={(e) => onMonthChange(Number(e.target.value))}
        sx={{ minWidth: 120 }}
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
        sx={{ minWidth: 120 }}
      >
        <MenuItem value={0}>All</MenuItem>
        {years.map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default ExpensesFilter;
