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
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Recurring Expenses</DialogTitle>
      <DialogContent
        sx={{
          px: { xs: 3, sm: 3 },
          py: { xs: 1, sm: 2 },
        }}
      >
        {recurringExpenses.length === 0 ? (
          <Box className="empty-images" sx={{ textAlign: "center" }}>
            <img
              src={emptyImage}
              alt="No expensess"
              style={{ width: 160, maxWidth: "80vw" }}
            />
            <Typography
              variant="body1"
              sx={{ mt: 2, width: { xs: "100%", sm: "60%" }, mx: "auto" }}
            >
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
            {isMobile ? (
              <Box>
                {recurringExpenses.map((exp) => {
                  const existsInCurrentMonth = isExpenseInCurrentMonth(exp);
                  return (
                    <Paper key={exp.id} sx={{ mb: 2, p: 3 }} elevation={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {exp.name}
                        </Typography>
                        <Box>
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
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Amount:{" "}
                        <b>
                          {exp.amount.toFixed(2)} {preferences.defaultCurrency}
                        </b>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Category: <b>{exp.categoryName}</b>
                      </Typography>
                      <Typography
                        variant="body2"
                        color={
                          exp.isPaused
                            ? "text.secondary"
                            : existsInCurrentMonth
                            ? "success.main"
                            : "warning.main"
                        }
                      >
                        {exp.isPaused
                          ? "Paused"
                          : existsInCurrentMonth
                          ? "Added this month"
                          : "Will be added on 1st"}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                sx={{ maxHeight: { xs: 320, sm: "none" }, overflowX: "auto" }}
              >
                <Table size="small" sx={{ minWidth: 500 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>Name</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        Amount
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        Category
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recurringExpenses.map((exp) => {
                      const existsInCurrentMonth = isExpenseInCurrentMonth(exp);
                      return (
                        <TableRow key={exp.id}>
                          <TableCell>{exp.name}</TableCell>
                          <TableCell>
                            {exp.amount.toFixed(2)}{" "}
                            {preferences.defaultCurrency}
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
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: { xs: 1, sm: 3 }, pb: { xs: 1, sm: 2 } }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth={true}
          sx={{ maxWidth: { xs: "100%", sm: 200 } }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecurringExpensesDialog;
