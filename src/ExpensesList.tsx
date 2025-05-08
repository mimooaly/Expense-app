import React, { useEffect, useState } from "react";
import { database, auth } from "./firebaseConfig";
import { ref, onValue, push, remove, update } from "firebase/database";
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
} from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ExpensesFilter from "./components/ExpensesFilter";
import AddExpenseDialog from "./components/AddExpenseDialog";
import AddIcon from "@mui/icons-material/Add";
import { Trash2, Edit2, Plus } from "react-feather";
import * as FeatherIcons from "react-feather";
import expensesCateg from "./data/ExpenseCategories";
import { onAuthStateChanged } from "firebase/auth";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
}

interface ExpensesTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
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
  { id: "monthly", label: "Monthly" },
  { id: "actions", label: "Actions" },
];

const ExpensesTable: React.FC<ExpensesTableProps> = ({
  expenses,
  onDelete,
  onEdit,
}) => {
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<keyof Expense>("date");

  const handleRequestSort = (property: keyof Expense) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedExpenses = stableSort(expenses, getComparator(order, orderBy));

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
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
              <TableCell>
                <Box display="flex" alignItems="center">
                  {getCategoryIcon(
                    expensesCateg.find(
                      (cat: { id: number; name: string; icon: string }) =>
                        cat.name === expense.categoryName
                    )?.icon || ""
                  )}
                  <span style={{ marginLeft: 8 }}>{expense.categoryName}</span>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{expense.name}</TableCell>
              <TableCell>${expense.amount.toFixed(2)}</TableCell>
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

function getCategoryIcon(iconName: string) {
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
}

const ExpensesListMobile: React.FC<ExpensesTableProps> = ({
  expenses,
  onDelete,
  onEdit,
}) => (
  <List className="expenses-list-mobile">
    {expenses.map((expense) => (
      <ListItem key={expense.id} divider className="expense-list-item-mobile">
        <ListItemText
          primary={
            <div className="expense-list-item-mobile-primary">
              <Box display="flex" alignItems="center">
                {getCategoryIcon(
                  expensesCateg.find(
                    (cat: { id: number; name: string; icon: string }) =>
                      cat.name === expense.categoryName
                  )?.icon || ""
                )}
                <span className="expense-list-item-mobile-name">
                  {expense.name}
                </span>
              </Box>
            </div>
          }
          secondary={
            <>
              <span className="expense-list-item-mobile-amount">
                $
                {expense.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="expense-list-item-mobile-secondary">
                {expense.categoryName} •{" "}
                {new Date(expense.date).toLocaleDateString()}
              </span>
            </>
          }
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton edge="end" onClick={() => onEdit(expense)}>
            <Edit2 size={16} />
          </IconButton>
          <IconButton edge="end" onClick={() => onDelete(expense.id)}>
            <Trash2 size={16} />
          </IconButton>
        </Box>
      </ListItem>
    ))}
  </List>
);

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState({
    category: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchExpenses = (user: any) => {
      if (!user) {
        setExpenses([]);
        return;
      }

      const expensesRef = ref(database, `expenses/${user.uid}`);
      const unsubscribe = onValue(expensesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const expensesList = Object.entries(data).map(
            ([id, value]: [string, any]) => ({
              id,
              ...value,
            })
          );
          setExpenses(expensesList);
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
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
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
      await push(ref(database, `expenses/${user.uid}`), {
        ...values,
        categoryName:
          expensesCateg.find(
            (cat: { id: number; name: string; icon: string }) =>
              cat.id === parseInt(values.category)
          )?.name || "",
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
    const matchesCategory =
      !filters.category || Number(expense.category) === filters.category;
    const matchesMonth =
      !filters.month || new Date(expense.date).getMonth() + 1 === filters.month;
    const matchesYear =
      !filters.year || new Date(expense.date).getFullYear() === filters.year;
    const matchesSearch =
      !searchQuery ||
      expense.name.toLowerCase().includes(searchQuery.toLowerCase());
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

  // Handler to bulk add all recurring expenses to the expense list with today's date
  const handleBulkAddRecurring = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const today = new Date();
    const todayISOString = today.toISOString();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Check if any recurring expense already exists for the current month
    const alreadyExists = recurringExpenses.some((recExp) =>
      expenses.some(
        (exp) =>
          exp.name === recExp.name &&
          exp.category === recExp.category &&
          new Date(exp.date).getMonth() + 1 === currentMonth &&
          new Date(exp.date).getFullYear() === currentYear
      )
    );

    if (alreadyExists) {
      alert(
        "One or more recurring expenses already exist for this month. No expenses were added."
      );
      return;
    }

    try {
      for (const exp of recurringExpenses) {
        await push(ref(database, `expenses/${user.uid}`), {
          name: exp.name || "Untitled",
          amount: exp.amount !== undefined ? exp.amount : 0,
          category: exp.category || 1, // Default to first category id
          categoryName: exp.categoryName || "Uncategorized",
          date: todayISOString,
          monthly: exp.monthly !== undefined ? exp.monthly : true,
          startDate: exp.startDate || todayISOString,
        });
      }
      setIsRecurringDialogOpen(false);
    } catch (error) {
      console.error("Bulk add failed:", error);
      alert("Failed to add recurring expenses. See console for details.");
    }
  };

  return (
    <Container maxWidth="lg" className="page-glossy-background">
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
          <Box>
            <Button
              variant="text"
              onClick={() => setIsRecurringDialogOpen(true)}
              sx={{
                mr: 2,
                color: "success.dark",
                borderColor: "success.dark",
                "&:hover": {
                  borderColor: "success.dark",
                  backgroundColor: "success.light",
                },
              }}
            >
              Manage Recurring
            </Button>
            <Fab color="primary" onClick={handleOpen} sx={{ mr: 0 }}>
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
          }}
        >
          {!isMobile && (
            <ExpensesFilter
              category={filters.category}
              month={filters.month}
              year={filters.year}
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
            }}
          >
            <Box className="total-amount-display-wrapper">
              <Divider className="total-amount-divider" />
              <Typography
                className="total-amount-display"
                variant="body2"
                fontWeight="bold"
              >
                Total $
                {filteredExpenses
                  .reduce((sum, exp) => sum + exp.amount, 0)
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </Typography>
            </Box>
          </Box>
        </Box>

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
          />
        ) : (
          <ExpensesTable
            expenses={filteredExpenses}
            onDelete={handleDeleteClick}
            onEdit={handleEditClick}
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

        <Dialog
          open={isRecurringDialogOpen}
          onClose={() => setIsRecurringDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Recurring Expenses</DialogTitle>
          <DialogContent>
            {recurringExpenses.length === 0 ? (
              <Typography>No recurring expenses found.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recurringExpenses.map((exp) => (
                      <TableRow key={exp.id}>
                        <TableCell>{exp.name}</TableCell>
                        <TableCell>${exp.amount.toFixed(2)}</TableCell>
                        <TableCell>{exp.categoryName}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleDisableRecurring(exp)}
                            color="error"
                            size="small"
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleBulkAddRecurring}
              color="primary"
              variant="outlined"
              sx={{
                color: "success.dark",
                borderColor: "primary.main",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "primary.light",
                },
              }}
            >
              <Plus size={16} style={{ marginRight: 8 }} />
              Add all for this month expenses
            </Button>
            <Button
              onClick={() => setIsRecurringDialogOpen(false)}
              variant="contained"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
