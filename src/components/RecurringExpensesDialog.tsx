import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import { Trash2, Play, Pause } from "react-feather";
import { Expense } from "../ExpensesList";
import emptyImage from "../assets/empty.png";
import { useUserPreferences } from "../hooks/useUserPreferences";

interface RecurringExpensesDialogProps {
  open: boolean;
  onClose: () => void;
  recurringExpenses: Expense[];
  onTogglePause: (expense: Expense) => void;
  onDisableRecurring: (expense: Expense) => void;
  isExpenseInCurrentMonth: (expense: Expense) => boolean;
}

const RecurringExpensesDialog: React.FC<RecurringExpensesDialogProps> = ({
  open,
  onClose,
  recurringExpenses,
  onTogglePause,
  onDisableRecurring,
  isExpenseInCurrentMonth,
}) => {
  const { preferences } = useUserPreferences();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Recurring Expenses</DialogTitle>
      <DialogContent>
        {recurringExpenses.length === 0 ? (
          <Box className="empty-images">
            <img src={emptyImage} alt="No expensess" style={{ width: 200 }} />
            <Typography variant="body1" sx={{ mt: 2, width: "60%" }}>
              No recurring expenses found, Recurring expenses will be added
              automatically when you mark expenses as recurring
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Recurring expenses will be added automatically on the 1st of every
              month unless paused.
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recurringExpenses.map((exp) => {
                    const existsInCurrentMonth = isExpenseInCurrentMonth(exp);
                    return (
                      <TableRow key={exp.id}>
                        <TableCell>{exp.name}</TableCell>
                        <TableCell>
                          {exp.amount.toFixed(2)} {preferences.defaultCurrency}
                        </TableCell>
                        <TableCell>{exp.categoryName}</TableCell>
                        <TableCell>
                          {exp.isPaused ? (
                            <Typography color="text.secondary">
                              Paused
                            </Typography>
                          ) : existsInCurrentMonth ? (
                            <Typography color="success.main">
                              Added this month
                            </Typography>
                          ) : (
                            <Typography color="warning.main">
                              Will be added on 1st
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => onTogglePause(exp)}
                            color={exp.isPaused ? "success" : "warning"}
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            {exp.isPaused ? (
                              <Play size={16} />
                            ) : (
                              <Pause size={16} />
                            )}
                          </IconButton>
                          <IconButton
                            onClick={() => onDisableRecurring(exp)}
                            color="error"
                            size="small"
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecurringExpensesDialog;
