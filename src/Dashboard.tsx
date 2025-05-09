import React, { useEffect, useState } from "react";
import { database, auth } from "./firebaseConfig"; // Assuming firebaseConfig is accessible
import { ref, onValue } from "firebase/database";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  Container,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Paper,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  TrendingUp,
  PieChart as PieChartFeather,
  Table as TableFeather,
} from "react-feather";
import * as FeatherIcons from "react-feather";
import expensesCateg from "./data/ExpenseCategories";

// Assuming Expense interface is similar to ExpensesList
export interface Expense {
  id: string;
  amount: number;
  category: string;
  categoryName: string;
  name: string;
  date: string; // ISO string date
  monthly: boolean;
  // ... any other relevant fields
}

type TimePeriod = "1M" | "3M" | "6M" | "YTD";

// Helper to get start date based on period
const getStartDateForPeriod = (period: TimePeriod): Date => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1); // January 1st of current year

  switch (period) {
    case "1M":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "3M":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "6M":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "YTD":
      return startOfYear;
    default:
      return now;
  }
};

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [expensesOverTimeData, setExpensesOverTimeData] = useState<
    { date: string; amount: number }[]
  >([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("3M");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setAllExpenses([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const expensesRef = ref(database, `expenses/${currentUser.uid}`);
    const unsubscribe = onValue(expensesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const expensesList = Object.entries(data).map(
          ([id, value]: [string, any]) => ({
            id,
            ...value,
            date: value.date,
            amount: Number(value.amount) || 0,
          })
        );
        setAllExpenses(expensesList);
      } else {
        setAllExpenses([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Add helper function to get week number
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Add helper function to get week start date
  const getWeekStartDate = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  // Update the data processing for expenses over time
  useEffect(() => {
    const startDate = getStartDateForPeriod(timePeriod);
    const endDate = new Date();

    const newFilteredExpenses = allExpenses.filter((exp) => {
      const expenseDate = new Date(exp.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    // Process data based on time period
    let processedData;
    if (timePeriod === "1M") {
      // Group by days for monthly view
      processedData = newFilteredExpenses.reduce((acc, expense) => {
        const date = new Date(expense.date);
        const dayKey = date.toISOString().split("T")[0];

        const existingEntry = acc.find((item) => item.date === dayKey);
        if (existingEntry) {
          existingEntry.amount += expense.amount;
        } else {
          acc.push({ date: dayKey, amount: expense.amount });
        }
        return acc;
      }, [] as { date: string; amount: number }[]);
    } else {
      // Group by months for longer periods
      processedData = newFilteredExpenses.reduce((acc, expense) => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        const existingEntry = acc.find((item) => item.date === monthKey);
        if (existingEntry) {
          existingEntry.amount += expense.amount;
        } else {
          acc.push({ date: monthKey, amount: expense.amount });
        }
        return acc;
      }, [] as { date: string; amount: number }[]);
    }

    // Sort by date
    processedData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setFilteredExpenses(newFilteredExpenses);
    setExpensesOverTimeData(processedData);
  }, [allExpenses, timePeriod]);

  // Update the formatXAxisTick function
  const formatXAxisTick = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timePeriod === "1M") {
      // For monthly view, show day and month
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    } else {
      // For longer periods, show month and year
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
    }
  };

  const handleTimePeriodChange = (
    event: React.MouseEvent<HTMLElement>,
    newPeriod: TimePeriod | null
  ) => {
    if (newPeriod !== null) {
      setTimePeriod(newPeriod);
    }
  };

  // --- Data processing for charts ---
  // Category Spending Data (for Pie/Bar chart and Table)
  const categorySpendingData = filteredExpenses.reduce((acc, expense) => {
    const category = expense.categoryName || "Uncategorized";
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  const pieChartData = Object.entries(categorySpendingData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort for "most spent"

  const categoryTableData = pieChartData; // Already sorted

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  // Add category icon mapping function
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

  if (!currentUser) {
    return (
      <Container>
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Please log in to view the dashboard.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Track and analyze your spending patterns
        </Typography>
      </Box>

      <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
        <ToggleButtonGroup
          value={timePeriod}
          exclusive
          onChange={handleTimePeriodChange}
          aria-label="time period"
          size={isMobile ? "small" : "medium"}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: "12px",
            padding: "4px",
            "& .MuiToggleButton-root": {
              border: "none",
              borderRadius: "8px !important",
              px: { xs: 2, sm: 3 },
              py: 1,
              color: theme.palette.text.secondary,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
              "&.Mui-selected": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
            },
          }}
        >
          <ToggleButton value="1M">1M</ToggleButton>
          <ToggleButton value="3M">3M</ToggleButton>
          <ToggleButton value="6M">6M</ToggleButton>
          <ToggleButton value="YTD">YTD</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Expenses Over Time Chart */}
        <Box sx={{ width: "100%" }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUp
                  size={24}
                  style={{ marginRight: 8, color: theme.palette.primary.main }}
                />
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Expenses Over Time
                </Typography>
              </Box>
              {loading ? (
                <Skeleton variant="rectangular" height={350} />
              ) : expensesOverTimeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={expensesOverTimeData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.divider}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={theme.palette.text.secondary}
                      tick={{ fill: theme.palette.text.secondary }}
                      tickFormatter={formatXAxisTick}
                      interval={timePeriod === "1M" ? 0 : "preserveStartEnd"}
                    />
                    <YAxis
                      stroke={theme.palette.text.secondary}
                      tick={{ fill: theme.palette.text.secondary }}
                      tickFormatter={(value) =>
                        `$${value.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                      formatter={(value: number) => [
                        <span style={{ color: "#8b0000" }}>
                          $
                          {value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>,
                      ]}
                      labelFormatter={(dateStr) => {
                        const date = new Date(dateStr);
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography sx={{ m: "auto", textAlign: "center", py: 4 }}>
                  No data for this period.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Charts and Table Row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            "& > *": { flex: 1 },
          }}
        >
          {/* Most Spent Categories Pie Chart */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PieChartFeather
                  size={24}
                  style={{
                    marginRight: 8,
                    color: theme.palette.secondary.main,
                  }}
                />
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Top Categories
                </Typography>
              </Box>
              {loading ? (
                <Skeleton variant="rectangular" height={400} />
              ) : pieChartData.length > 0 ? (
                <Box sx={{ position: "relative", height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData.slice(0, 10)}
                        cx="50%"
                        cy="45%"
                        innerRadius={80}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {pieChartData.slice(0, 10).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          padding: "8px 12px",
                          fontSize: "0.75rem",
                        }}
                        formatter={(value: number, name: string) => [
                          <span style={{ color: "#8b0000" }}>
                            $
                            {value.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>,
                          name,
                        ]}
                        itemStyle={{
                          padding: "2px 0",
                        }}
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        formatter={(value, entry: any) => (
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontSize: "0.75rem",
                            }}
                          >
                            {value}
                          </Typography>
                        )}
                        wrapperStyle={{
                          paddingTop: "10px",
                          fontSize: "0.75rem",
                        }}
                        iconSize={10}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box className="total-amount-display-wrapper-pie">
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                      }}
                    >
                      $
                      {pieChartData
                        .reduce((sum, item) => sum + item.value, 0)
                        .toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography sx={{ m: "auto", textAlign: "center", py: 4 }}>
                  No data for this period.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Category Spending Table */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TableFeather
                  size={24}
                  style={{ marginRight: 8, color: theme.palette.success.main }}
                />
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Spending by Category
                </Typography>
              </Box>
              {loading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : categoryTableData.length > 0 ? (
                <Paper elevation={0}>
                  <TableContainer className="no-shadow">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Category
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold" }}>
                            Total Amount
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categoryTableData.map((row) => (
                          <TableRow
                            key={row.name}
                            hover
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {getCategoryIcon(
                                  expensesCateg.find(
                                    (cat) => cat.name === row.name
                                  )?.icon || ""
                                )}
                                {row.name}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              $
                              {row.value.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              ) : (
                <Typography sx={{ m: "auto", textAlign: "center", py: 4 }}>
                  No data for this period.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardPage;
