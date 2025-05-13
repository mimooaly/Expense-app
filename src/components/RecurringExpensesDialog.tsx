import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import { Pause, Play, X } from "react-feather";
import { useCategories } from "../hooks/useCategories";
import emptyImage from "../assets/empty.png";

interface RecurringExpensesDialogProps {
  open: boolean;
  onClose: () => void;
  recurringExpenses: any[];
  onTogglePause: (expense: any) => void;
  onDisableRecurring: (expense: any) => void;
  isExpenseInCurrentMonth: (expense: any) => boolean;
}

const RecurringExpensesDialog: React.FC<RecurringExpensesDialogProps> = ({
  open,
  onClose,
  recurringExpenses,
  onTogglePause,
  onDisableRecurring,
  isExpenseInCurrentMonth,
}) => {
  const categories = useCategories();

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return null;
    return (
      <span style={{ fontSize: 20, marginRight: 8, verticalAlign: "middle" }}>
        {category.icon}
      </span>
    );
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Recurring Expenses</DialogTitle>
      <DialogContent>
        {recurringExpenses.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <img src={emptyImage} alt="No expenses" style={{ width: 200 }} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              No recurring expenses found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Recurring expenses will be added automatically when you mark
              expenses as recurring
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Recurring expenses will be added automatically on the 1st of every
              month unless paused.
            </Typography>
            <List>
              {recurringExpenses.map((expense) => (
                <ListItem
                  key={expense.id}
                  divider={false}
                  sx={{
                    mb: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    "&:last-child": {
                      mb: 0,
                    },
                  }}
                  secondaryAction={
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip
                        title={
                          expense.isPaused
                            ? "Resume recurring expense"
                            : "Pause recurring expense"
                        }
                      >
                        <IconButton
                          edge="end"
                          onClick={() => onTogglePause(expense)}
                          color={expense.isPaused ? "success" : "warning"}
                        >
                          {expense.isPaused ? (
                            <Play size={16} />
                          ) : (
                            <Pause size={16} />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Disable recurring expense">
                        <IconButton
                          edge="end"
                          onClick={() => onDisableRecurring(expense)}
                          color="error"
                        >
                          <X size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        {getCategoryIcon(expense.category)}
                        <span>{expense.name}</span>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {getCategoryName(expense.category)} •{" "}
                          {expense.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                        <br />
                        <Typography
                          component="span"
                          variant="body2"
                          color={expense.isPaused ? "error" : "success"}
                        >
                          {expense.isPaused
                            ? "Paused"
                            : isExpenseInCurrentMonth(expense)
                            ? "Added this month"
                            : "Will be added on 1st"}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecurringExpensesDialog;
