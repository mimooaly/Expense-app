import React, { useEffect, useState } from "react";
import { database, auth } from "./firebaseConfig";
import { ref, onValue, push, remove, update, get } from "firebase/database";
import "./App.css";
import emptyImage from "./assets/empty.png";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Container,
  Box,
  Typography,
  Fab,
  TextField,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Tooltip,
  Checkbox,
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ExpensesFilter from "./components/ExpensesFilter";
import AddExpenseDialog from "./components/AddExpenseDialog";
import AddIcon from "@mui/icons-material/Add";
import { Trash2, Edit2 } from "react-feather";
import * as FeatherIcons from "react-feather";
import expensesCateg from "./data/ExpenseCategories";
import { onAuthStateChanged } from "firebase/auth";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useCategories } from "./hooks/useCategories";
import RecurringExpensesDialog from "./components/RecurringExpensesDialog";
import { useUserPreferences } from "./hooks/useUserPreferences";
import BulkActionsToolbar from "./components/BulkActionsToolbar";
import BulkEditDialogs from "./components/BulkEditDialogs";

export interface Expense {
  id: string;
  amount: number;
  category: string;
  categoryName: string;
  name: string;
  date: string;
  monthly: boolean;
  lastAdded: string;
  startDate: string;
  isPaused: boolean;
  nextDate: string;
}

interface ExpensesTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  selected: string[];
  onSelect: (id: string) => void;
  onSelectAll?: () => void;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: "asc" | "desc",
  orderBy: Key
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: "categoryName", label: "Category" },
  { id: "name", label: "Name" },
  { id: "amount", label: "Amount" },
  { id: "date", label: "Date" },
  { id: "monthly", label: "Recurring" },
  { id: "actions", label: "Actions" },
];

const ExpensesTable: React.FC<ExpensesTableProps> = ({
  expenses,
  onDelete,
  onEdit,
  selected,
  onSelect,
  onSelectAll,
}) => {
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<keyof Expense>("date");
  const categories = useCategories();
  const { preferences } = useUserPreferences();

  const handleRequestSort = (property: keyof Expense) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedExpenses = stableSort(expenses, getComparator(order, orderBy));

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return null;

    if (category.icon === "folder") {
      return (
        <FeatherIcons.Folder
          size={20}
          style={{ marginRight: 8, verticalAlign: "middle" }}
        />
      );
    }

    let featherIconName;
    if (category.icon === "github") {
      featherIconName = "GitHub";
    } else {
      featherIconName = category.icon
        .split("-")
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
    }
    const IconComponent = (FeatherIcons as any)[featherIconName];
    return IconComponent ? (
      <IconComponent
        size={20}
        style={{ marginRight: 8, verticalAlign: "middle" }}
      />
    ) : null;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={
                  selected.length > 0 && selected.length < expenses.length
                }
                checked={
                  expenses.length > 0 && selected.length === expenses.length
                }
                onChange={onSelectAll}
              />
            </TableCell>
            {headCells.map((headCell) => (
              <TableCell
                key={headCell.id}
                sortDirection={orderBy === headCell.id ? order : false}
              >
                {headCell.id !== "actions" ? (
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : "asc"}
                    onClick={() =>
                      handleRequestSort(headCell.id as keyof Expense)
                    }
                  >
                    {headCell.label}
                  </TableSortLabel>
                ) : (
                  headCell.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedExpenses.map((expense, idx) => (
            <TableRow
              key={expense.id}
              className={`expense-row ${
                idx % 2 === 0 ? "expense-row-even" : "expense-row-odd"
              }`}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.includes(expense.id)}
                  onChange={() => onSelect(expense.id)}
                />
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  {getCategoryIcon(expense.category)}
                  <span style={{ marginLeft: 8 }}>
                    {getCategoryName(expense.category)}
                  </span>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#000000" }}>
                {expense.name}
              </TableCell>
              <TableCell sx={{ color: "#8b0000", fontWeight: 500 }}>
                {expense.amount.toFixed(2)} {preferences.defaultCurrency}
              </TableCell>
              <TableCell>
                {new Date(expense.date).toLocaleDateString()}
              </TableCell>
              <TableCell>{expense.monthly ? "Yes" : "No"}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(expense)}>
                  <Edit2 size={16} />
                </IconButton>
                <IconButton onClick={() => onDelete(expense.id)}>
                  <Trash2 size={16} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ExpensesListMobile: React.FC<ExpensesTableProps> = ({
  expenses,
  onDelete,
  onEdit,
  selected,
  onSelect,
}) => {
  const categories = useCategories();
  const { preferences } = useUserPreferences();

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return null;

    if (category.icon === "folder") {
      return (
        <FeatherIcons.Folder
          size={18}
          style={{ marginRight: 8, verticalAlign: "middle" }}
        />
      );
    }

    let featherIconName;
    if (category.icon === "github") {
      featherIconName = "GitHub";
    } else {
      featherIconName = category.icon
        .split("-")
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
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

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  return (
    <List className="expenses-list-mobile">
      {expenses.map((expense) => (
        <ListItem
          key={expense.id}
          divider
          className="expense-list-item-mobile"
          secondaryAction={
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <IconButton edge="end" onClick={() => onEdit(expense)}>
                <Edit2 size={16} />
              </IconButton>
              <IconButton edge="end" onClick={() => onDelete(expense.id)}>
                <Trash2 size={16} />
              </IconButton>
            </Box>
          }
        >
          <Checkbox
            checked={selected.includes(expense.id)}
            onChange={() => onSelect(expense.id)}
            sx={{ mr: 1 }}
          />
          <ListItemText
            primary={
              <div className="expense-list-item-mobile-primary">
                <Box display="flex" alignItems="center">
                  {getCategoryIcon(expense.category)}
                  <span
                    className="expense-list-item-mobile-name"
                    style={{
                      maxWidth: "150px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {expense.name}
                  </span>
                </Box>
              </div>
            }
            secondary={
              <>
                <span className="expense-list-item-mobile-amount">
                  {expense.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {preferences.defaultCurrency}
                </span>
                <span className="expense-list-item-mobile-secondary">
                  {getCategoryName(expense.category)} •{" "}
                  {new Date(expense.date).toLocaleDateString()}
                </span>
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

const exportToCSV = (expenses: Expense[], currency: string) => {
  // Create CSV header
  const headers = ["Category", "Name", "Amount", "Date", "Monthly"];
  const csvContent = [
    headers.join(","),
    ...expenses.map((expense) =>
      [
        expense.categoryName,
        `"${expense.name}"`,
        `${expense.amount.toFixed(2)} ${currency}`,
        new Date(expense.date).toLocaleDateString(),
        expense.monthly ? "Yes" : "No",
      ].join(",")
    ),
  ].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `expenses_${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    month: 0,
    year: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkActionAnchor, setBulkActionAnchor] = useState<null | HTMLElement>(
    null
  );
  const [isBulkCategoryDialogOpen, setIsBulkCategoryDialogOpen] =
    useState(false);
  const [isBulkAmountDialogOpen, setIsBulkAmountDialogOpen] = useState(false);
  const [isBulkDateDialogOpen, setIsBulkDateDialogOpen] = useState(false);
  const [isBulkRecurringDialogOpen, setIsBulkRecurringDialogOpen] =
    useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const categories = useCategories();
  const { preferences } = useUserPreferences();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchExpenses = (user: any) => {
      if (!user) {
        setExpenses([]);
        return;
      }

      const expensesRef = ref(database, `expenses/${user.uid}`);
      const unsubscribe = onValue(expensesRef, async (snapshot: any) => {
        const data = snapshot.val();
        if (data) {
          const expensesList = Object.entries(data).map(
            ([id, value]: [string, any]) => ({
              id,
              ...value,
            })
          );

          // Handle duplicate recurring expenses
          const recurringExpensesMap = new Map<string, Expense>();

          // First pass: find duplicates and keep the one with highest amount
          expensesList.forEach((expense) => {
            if (expense.monthly) {
              const key = `${expense.name}_${expense.category}`;
              const existing = recurringExpensesMap.get(key);

              if (!existing || expense.amount > existing.amount) {
                recurringExpensesMap.set(key, expense);
              }
            }
          });

          // Second pass: mark duplicates as non-recurring
          const updatedExpenses = await Promise.all(
            expensesList.map(async (expense) => {
              if (expense.monthly) {
                const key = `${expense.name}_${expense.category}`;
                const highestAmountExpense = recurringExpensesMap.get(key);

                if (
                  highestAmountExpense &&
                  highestAmountExpense.id !== expense.id
                ) {
                  // This is a duplicate, mark it as non-recurring
                  try {
                    await update(
                      ref(database, `expenses/${user.uid}/${expense.id}`),
                      {
                        monthly: false,
                      }
                    );
                    return { ...expense, monthly: false };
                  } catch (error) {
                    console.error("Error updating duplicate expense:", error);
                    return expense;
                  }
                }
              }
              return expense;
            })
          );

          setExpenses(updatedExpenses);
        } else {
          setExpenses([]);
        }
      });

      return unsubscribe;
    };

    // Initial fetch
    const user = auth.currentUser;
    const unsubscribe = fetchExpenses(user);

    // Listen for auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user: any) => {
      fetchExpenses(user);
    });

    return () => {
      if (unsubscribe) unsubscribe();
      unsubscribeAuth();
    };
  }, []);

  const handleAddExpense = async (values: any) => {
    const user = auth.currentUser;
    if (!user) return;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Check if an expense with the same name and category already exists for the current month
    const alreadyExists = expenses.some(
      (exp) =>
        exp.name === values.name &&
        exp.category === values.category &&
        new Date(exp.date).getMonth() + 1 === currentMonth &&
        new Date(exp.date).getFullYear() === currentYear
    );

    if (alreadyExists) {
      alert(
        "An expense with the same name and category already exists for this month. No expense was added."
      );
      return;
    }

    try {
      // Get category name based on whether it's a custom or default category
      let categoryName = "";
      if (values.category.startsWith("custom_")) {
        // For custom categories, get the name from the customCategories node
        const customCategoryRef = ref(
          database,
          `customCategories/${user.uid}/${values.category.replace(
            "custom_",
            ""
          )}`
        );
        const snapshot = await get(customCategoryRef);
        if (snapshot.exists()) {
          categoryName = snapshot.val().name;
        }
      } else {
        // For default categories, get the name from expensesCateg
        categoryName =
          expensesCateg.find((cat) => cat.id === parseInt(values.category))
            ?.name || "";
      }

      const today = new Date();
      const todayISOString = today.toISOString();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      await push(ref(database, `expenses/${user.uid}`), {
        ...values,
        categoryName,
        isPaused: false,
        nextDate: nextMonth.toISOString().split("T")[0],
        lastAdded: values.monthly ? todayISOString : "",
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setExpenseToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      await remove(ref(database, `expenses/${user.uid}/${expenseToDelete}`));
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setExpenseToDelete(null);
  };

  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditDialogOpen(true);
  };

  const handleOpen = () => {
    setIsAddDialogOpen(true);
  };

  const handleClose = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedExpense(null);
  };

  const handleEdit = async (expense: Expense) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await update(ref(database, `expenses/${user.uid}/${expense.id}`), {
        ...expense,
        categoryName:
          expensesCateg.find(
            (cat: { id: number; name: string; icon: string }) =>
              cat.id === parseInt(expense.category)
          )?.name || "",
      });
      setIsEditDialogOpen(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    // Category: "" means All
    const matchesCategory =
      !filters.category ||
      expense.categoryName === filters.category ||
      expense.category === filters.category;

    // Month: 0 means All
    const expenseMonth = new Date(expense.date).getMonth() + 1;
    const matchesMonth =
      !filters.month || expenseMonth === Number(filters.month);

    // Year: 0 means All
    const expenseYear = new Date(expense.date).getFullYear();
    const matchesYear = !filters.year || expenseYear === Number(filters.year);

    // Search (if you want to keep it)
    const search = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !search ||
      expense.name.toLowerCase().includes(search) ||
      (expense.categoryName &&
        expense.categoryName.toLowerCase().includes(search));

    return matchesCategory && matchesMonth && matchesYear && matchesSearch;
  });

  const recurringExpenses = expenses.filter((e) => e.monthly);

  // Handler to mark a recurring expense as not monthly
  const handleDisableRecurring = async (expense: Expense) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await update(ref(database, `expenses/${user.uid}/${expense.id}`), {
        monthly: false,
      });
    } catch (error) {
      console.error("Error disabling recurring:", error);
    }
  };

  const handleTogglePause = async (expense: Expense) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await update(ref(database, `expenses/${user.uid}/${expense.id}`), {
        isPaused: !expense.isPaused,
      });
    } catch (error) {
      console.error("Error toggling pause:", error);
    }
  };

  const isExpenseInCurrentMonth = (expense: Expense) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Check if the expense exists in the current month
    const existsThisMonth = expenses.some(
      (exp) =>
        exp.name === expense.name &&
        exp.category === exp.category &&
        new Date(exp.date).getMonth() === currentMonth &&
        new Date(exp.date).getFullYear() === currentYear
    );

    // If it exists this month, return true
    if (existsThisMonth) {
      console.log(`Expense ${expense.name} exists in current month's list`);
      return true;
    }

    // If it's paused, return false
    if (expense.isPaused) {
      console.log(`Expense ${expense.name} is paused`);
      return false;
    }

    // If it was added this month (based on lastAdded), return true
    if (expense.lastAdded) {
      const lastAdded = new Date(expense.lastAdded);
      if (
        lastAdded.getMonth() === currentMonth &&
        lastAdded.getFullYear() === currentYear
      ) {
        console.log(
          `Expense ${expense.name} was added this month (lastAdded: ${expense.lastAdded})`
        );
        return true;
      }
    }

    console.log(
      `Expense ${expense.name} will be added on 1st (lastAdded: ${expense.lastAdded})`
    );
    return false;
  };

  const checkAndAddRecurringExpenses = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const todayISOString = today.toISOString();

    // Only run on the 1st of the month
    if (today.getDate() !== 1) return;

    try {
      // Get all expenses
      const expensesRef = ref(database, `expenses/${user.uid}`);
      const snapshot = await get(expensesRef);
      const data = snapshot.val();
      if (!data) return;

      const expensesList = Object.entries(data).map(
        ([id, value]: [string, any]) => ({
          id,
          ...value,
        })
      );

      // Filter active recurring expenses
      const activeRecurringExpenses = expensesList.filter(
        (exp) => exp.monthly && !exp.isPaused
      );

      // Check and add each recurring expense
      for (const exp of activeRecurringExpenses) {
        // Check if already added this month
        const existsThisMonth = expensesList.some(
          (e) =>
            e.name === exp.name &&
            e.category === exp.category &&
            new Date(e.date).getMonth() === currentMonth &&
            new Date(e.date).getFullYear() === currentYear
        );

        if (!existsThisMonth) {
          // Add the expense
          await push(ref(database, `expenses/${user.uid}`), {
            name: exp.name,
            amount: exp.amount,
            category: exp.category,
            categoryName: exp.categoryName,
            date: todayISOString,
            monthly: false, // The new instance is not recurring
          });

          // Update lastAdded date of the recurring expense
          await update(ref(database, `expenses/${user.uid}/${exp.id}`), {
            lastAdded: todayISOString,
          });
        }
      }
    } catch (error) {
      console.error("Error auto-adding recurring expenses:", error);
    }
  };

  // Add useEffect for auto-adding recurring expenses
  useEffect(() => {
    // Check immediately when component mounts
    checkAndAddRecurringExpenses();

    // Set up interval to check every hour
    const interval = setInterval(checkAndAddRecurringExpenses, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelected((prev) =>
      prev.length === filteredExpenses.length
        ? []
        : filteredExpenses.map((exp) => exp.id)
    );
  };

  const handleBulkActionClick = (event: React.MouseEvent<HTMLElement>) => {
    setBulkActionAnchor(event.currentTarget);
  };

  const handleBulkActionClose = () => {
    setBulkActionAnchor(null);
  };

  const handleBulkCategoryChange = async (categoryId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const updates: { [key: string]: any } = {};
      selected.forEach((id) => {
        updates[`expenses/${user.uid}/${id}/category`] = categoryId;
      });
      await update(ref(database), updates);
      setIsBulkCategoryDialogOpen(false);
      setSelected([]);
    } catch (error) {
      console.error("Error updating categories:", error);
    }
  };

  const handleBulkAmountChange = async (amount: number) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const updates: { [key: string]: any } = {};
      selected.forEach((id) => {
        updates[`expenses/${user.uid}/${id}/amount`] = amount;
      });
      await update(ref(database), updates);
      setIsBulkAmountDialogOpen(false);
      setSelected([]);
    } catch (error) {
      console.error("Error updating amounts:", error);
    }
  };

  const handleBulkDateChange = async (date: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const updates: { [key: string]: any } = {};
      selected.forEach((id) => {
        updates[`expenses/${user.uid}/${id}/date`] = date;
      });
      await update(ref(database), updates);
      setIsBulkDateDialogOpen(false);
      setSelected([]);
    } catch (error) {
      console.error("Error updating dates:", error);
    }
  };

  const handleBulkRecurringChange = async (isRecurring: boolean) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const updates: { [key: string]: any } = {};
      selected.forEach((id) => {
        updates[`expenses/${user.uid}/${id}/monthly`] = isRecurring;
      });
      await update(ref(database), updates);
      setIsBulkRecurringDialogOpen(false);
      setSelected([]);
    } catch (error) {
      console.error("Error updating recurring status:", error);
    }
  };

  const handleBulkDelete = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const updates: { [key: string]: any } = {};
      selected.forEach((id) => {
        updates[`expenses/${user.uid}/${id}`] = null;
      });
      await update(ref(database), updates);
      setIsBulkDeleteDialogOpen(false);
      setSelected([]);
    } catch (error) {
      console.error("Error deleting expenses:", error);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    if (iconName === "folder") {
      return (
        <FeatherIcons.Folder
          size={20}
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
        size={20}
        style={{ marginRight: 8, verticalAlign: "middle" }}
      />
    ) : null;
  };

  return (
    <Container
      maxWidth="lg"
      className="page-glossy-background, marginContainer"
    >
      <Box sx={{ my: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">Expenses</Typography>
          <Box margin={0}>
            <Button
              variant="text"
              onClick={() => setIsRecurringDialogOpen(true)}
              className="manage-recurring-button"
              sx={{
                mr: 2,
                color: "success.dark",
                borderColor: "success.dark",
              }}
            >
              Manage Recurring
            </Button>
            <Fab
              color="primary"
              className="add-expense-button"
              onClick={handleOpen}
              sx={{ mr: 0 }}
            >
              <AddIcon />
            </Fab>
          </Box>
        </Box>

        {isMobile ? (
          <Accordion
            sx={{
              mb: 2,
              boxShadow: "none",
              "&:before": { display: "none" },
              border: "1px solid rgba(0, 0, 0, 0.12)",
              borderRadius: 1,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="filters-search-panel-content"
              id="filters-search-panel-header"
            >
              <Typography>Filters & Search</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 1, sm: 2 } }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  padding: 1,
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    marginBottom: 1,
                  }}
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <FeatherIcons.Search
                          size={20}
                          style={{ marginRight: 8 }}
                        />
                      ),
                    },
                  }}
                />
                <ExpensesFilter
                  category={filters.category}
                  month={filters.month}
                  year={filters.year}
                  categories={categories}
                  onCategoryChange={(category) =>
                    setFilters({ ...filters, category })
                  }
                  onMonthChange={(month) => setFilters({ ...filters, month })}
                  onYearChange={(year) => setFilters({ ...filters, year })}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        ) : (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <FeatherIcons.Search size={20} style={{ marginRight: 8 }} />
                  ),
                },
              }}
            />
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: { xs: 2, sm: 0 },
            mb: 2,
          }}
        >
          {!isMobile && (
            <ExpensesFilter
              category={filters.category}
              month={filters.month}
              year={filters.year}
              categories={categories}
              onCategoryChange={(category) =>
                setFilters({ ...filters, category })
              }
              onMonthChange={(month) => setFilters({ ...filters, month })}
              onYearChange={(year) => setFilters({ ...filters, year })}
            />
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", sm: "flex-start" },
              width: { xs: "100%", sm: "auto" },
              gap: 2,
            }}
          >
            <Box className="total-amount-display-wrapper">
              <Divider className="total-amount-divider" />
              <Typography
                className="total-amount-display"
                variant="body2"
                fontWeight="bold"
              >
                Total{" "}
                {filteredExpenses
                  .reduce((sum, exp) => sum + exp.amount, 0)
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                {preferences.defaultCurrency}
              </Typography>
            </Box>
            {!isMobile && (
              <Tooltip title="Export to Excel">
                <Button
                  variant="text"
                  size="small"
                  onClick={() =>
                    exportToCSV(filteredExpenses, preferences.defaultCurrency)
                  }
                  sx={{
                    color: "primary.dark",
                    marginBottom: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <FeatherIcons.FileText size={18} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.875rem",
                        width: "100px",
                        marginRight: "20px",
                      }}
                    >
                      Export CSV
                    </Typography>
                  </Box>
                </Button>
              </Tooltip>
            )}
          </Box>
        </Box>

        {selected.length > 0 && (
          <BulkActionsToolbar
            selectedCount={selected.length}
            totalCount={filteredExpenses.length}
            onBulkActionClick={handleBulkActionClick}
            onBulkActionClose={handleBulkActionClose}
            onCategoryClick={() => setIsBulkCategoryDialogOpen(true)}
            onAmountClick={() => setIsBulkAmountDialogOpen(true)}
            onDateClick={() => setIsBulkDateDialogOpen(true)}
            onRecurringClick={() => setIsBulkRecurringDialogOpen(true)}
            onDeleteClick={() => setIsBulkDeleteDialogOpen(true)}
            onSelectAll={handleSelectAll}
            anchorEl={bulkActionAnchor}
          />
        )}

        <BulkEditDialogs
          isCategoryDialogOpen={isBulkCategoryDialogOpen}
          isAmountDialogOpen={isBulkAmountDialogOpen}
          isDateDialogOpen={isBulkDateDialogOpen}
          isRecurringDialogOpen={isBulkRecurringDialogOpen}
          onCategoryDialogClose={() => setIsBulkCategoryDialogOpen(false)}
          onAmountDialogClose={() => setIsBulkAmountDialogOpen(false)}
          onDateDialogClose={() => setIsBulkDateDialogOpen(false)}
          onRecurringDialogClose={() => setIsBulkRecurringDialogOpen(false)}
          onCategoryChange={handleBulkCategoryChange}
          onAmountChange={handleBulkAmountChange}
          onDateChange={handleBulkDateChange}
          onRecurringChange={handleBulkRecurringChange}
          categories={categories}
          getCategoryIcon={getCategoryIcon}
        />

        {filteredExpenses.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <img src={emptyImage} alt="No expenses" style={{ width: 200 }} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              No expenses found
            </Typography>
          </Box>
        ) : isMobile ? (
          <ExpensesListMobile
            expenses={filteredExpenses}
            onDelete={handleDeleteClick}
            onEdit={handleEditClick}
            selected={selected}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
          />
        ) : (
          <ExpensesTable
            expenses={filteredExpenses}
            onDelete={handleDeleteClick}
            onEdit={handleEditClick}
            selected={selected}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
          />
        )}

        <AddExpenseDialog
          open={isAddDialogOpen}
          onClose={handleClose}
          onSave={handleAddExpense}
        />

        <AddExpenseDialog
          open={isEditDialogOpen}
          onClose={handleClose}
          onSave={handleEdit}
          isEdit
          initialValues={selectedExpense}
        />

        <Dialog open={isDeleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Expense</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this expense?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <RecurringExpensesDialog
          open={isRecurringDialogOpen}
          onClose={() => setIsRecurringDialogOpen(false)}
          recurringExpenses={recurringExpenses}
          onTogglePause={handleTogglePause}
          onDisableRecurring={handleDisableRecurring}
          isExpenseInCurrentMonth={isExpenseInCurrentMonth}
        />

        <Dialog
          open={isBulkDeleteDialogOpen}
          onClose={() => setIsBulkDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Selected Expenses</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selected.length} selected expense
              {selected.length !== 1 ? "s" : ""}? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsBulkDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
