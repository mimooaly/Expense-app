import React, { useEffect, useState, useMemo } from "react";
import { database, auth } from "./firebaseConfig";
import { ref, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
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
  Skeleton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { useUserPreferences } from "./hooks/useUserPreferences";
import { useCategories } from "./hooks/useCategories";
import * as FeatherIcons from "react-feather";

ChartJS.register(
  ArcElement,
  ChartJSTooltip,
  ChartJSLegend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

export interface Expense {
  id: string;
  amount: number;
  category: string;
  categoryName: string;
  name: string;
  date: string; // ISO string date
  monthly: boolean;
  isPaused: boolean;
  nextDate?: string;
}

type TimePeriod = "3M" | "6M" | "YTD" | "MTD";

const getStartDateForPeriod = (period: TimePeriod): Date => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  switch (period) {
    case "3M":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "6M":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "YTD":
      return startOfYear;
    case "MTD":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    default:
      return now;
  }
};

// Define a color palette that complements green with yellow accents
const PIE_COLORS = [
  "#4CAF50", // primary green
  "#81C784", // light green
  "#66BB6A", // medium green
  "#43A047", // dark green
  "#2E7D32", // darker green
  "#1B5E20", // darkest green
  "#FFC107", // amber yellow
  "#FFD54F", // light amber
  "#FFB300", // dark amber
  "#FFA000", // darker amber
  "#FF8F00", // darkest amber
  "#689F38", // olive green
];

// Add module declarations for firebase/database and firebase/auth if not already present
// (in a real project, this would go in a separate .d.ts file, but for now, add here for linter silence)
// @ts-ignore
declare module "firebase/database";
// @ts-ignore
declare module "firebase/auth";

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("MTD");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { preferences } = useUserPreferences();
  const { categories } = useCategories(preferences.hiddenCategories || []);
  const [lineChartKey, setLineChartKey] = useState(0);
  const [pieChartKey, setPieChartKey] = useState(0);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  // Get current month name for the MTD button
  const currentMonthName = new Date().toLocaleString(undefined, {
    month: "long",
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user: any) => {
      setCurrentUser(user);
      if (!user) setAllExpenses([]);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const expensesRef = ref(database, `expenses/${currentUser.uid}`);
    const unsubscribe = onValue(expensesRef, (snapshot: any) => {
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

  // Filter by time period
  const startDate = getStartDateForPeriod(timePeriod);
  const endDate = new Date();
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((exp) => {
      const expenseDate = new Date(exp.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }, [allExpenses, startDate, endDate]);

  // Get category icon
  const getCategoryIcon = (emoji: string) => (
    <span style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>
      {emoji}
    </span>
  );

  // Expenses Over Time (Line Chart)
  const expensesOverTimeData = useMemo(() => {
    const categoryExpensesMap = new Map<string, Map<string, number>>();
    categories.forEach((category) => {
      categoryExpensesMap.set(category.name, new Map());
    });

    if (timePeriod === "MTD") {
      filteredExpenses.forEach((exp) => {
        const dayKey = new Date(exp.date).toISOString().split("T")[0];
        const categoryName = exp.categoryName || "Uncategorized";
        const categoryMap = categoryExpensesMap.get(categoryName) || new Map();
        categoryMap.set(dayKey, (categoryMap.get(dayKey) || 0) + exp.amount);
        categoryExpensesMap.set(categoryName, categoryMap);
      });

      const now = new Date();
      const daysInMonth = now.getDate();
      const year = now.getFullYear();
      const month = now.getMonth();

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dayKey = date.toISOString().split("T")[0];
        categoryExpensesMap.forEach((categoryMap) => {
          if (!categoryMap.has(dayKey)) {
            categoryMap.set(dayKey, 0);
          }
        });
      }

      const allDates = Array.from(
        new Set(
          Array.from(categoryExpensesMap.values()).flatMap((map) =>
            Array.from(map.keys())
          )
        )
      ).sort();

      return {
        dates: allDates,
        categories: Array.from(categoryExpensesMap.entries()).map(
          ([category, dateMap]) => ({
            name: category,
            data: allDates.map((date) => dateMap.get(date) || 0),
          })
        ),
      };
    }

    filteredExpenses.forEach((exp) => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const categoryName = exp.categoryName || "Uncategorized";
      const categoryMap = categoryExpensesMap.get(categoryName) || new Map();
      categoryMap.set(monthKey, (categoryMap.get(monthKey) || 0) + exp.amount);
      categoryExpensesMap.set(categoryName, categoryMap);
    });

    const allMonths = Array.from(
      new Set(
        Array.from(categoryExpensesMap.values()).flatMap((map) =>
          Array.from(map.keys())
        )
      )
    ).sort();

    return {
      dates: allMonths,
      categories: Array.from(categoryExpensesMap.entries()).map(
        ([category, dateMap]) => ({
          name: category,
          data: allMonths.map((month) => dateMap.get(month) || 0),
        })
      ),
    };
  }, [filteredExpenses, timePeriod, categories]);

  // Pie chart for spending per category (aggregate by category name)
  const categorySpendingData = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      let categoryName = "Uncategorized";
      if (expense.category) {
        const category = categories.find((cat) => cat.id === expense.category);
        categoryName = category
          ? category.name
          : expense.categoryName || "Uncategorized";
      } else if (expense.categoryName) {
        categoryName = expense.categoryName;
      }
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });
  }, [filteredExpenses, categories]);

  // Table for all category spendings
  const categoryTableData = useMemo(() => {
    return Object.entries(categorySpendingData)
      .map(([name, value]) => {
        const category = categories.find((cat) => cat.name === name);
        return {
          name,
          icon: category ? category.icon : "💰",
          value: Number(value),
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [categorySpendingData, categories]);

  // Pie chart data for spending per category
  const pieChartDataJS = useMemo(
    () => ({
      labels: categoryTableData.map((row) => row.name),
      datasets: [
        {
          data: categoryTableData.map((row) => row.value),
          backgroundColor: PIE_COLORS,
        },
      ],
    }),
    [categoryTableData]
  );

  // Chart.js options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed;
            return `${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} ${preferences.defaultCurrency}`;
          },
        },
      },
    },
  };
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )} ${preferences.defaultCurrency}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: timePeriod === "MTD" ? currentMonthName : "Date",
        },
        ticks: {
          callback: function (val: any, idx: number) {
            const date = expensesOverTimeData.dates[idx];
            if (timePeriod === "MTD" && date) {
              return new Date(date).getDate();
            }
            return date || val;
          },
        },
      },
      y: {
        title: { display: true, text: preferences.defaultCurrency },
        ticks: {
          callback: function (val: any) {
            return Intl.NumberFormat(undefined, {
              notation: "compact",
              maximumFractionDigits: 2,
            }).format(Number(val));
          },
        },
      },
    },
  };

  // Get categories with data
  const getCategoriesWithData = () => {
    // Get all categories (both default and custom)
    const allCategories = categories.map((cat) => cat.name);

    // Get categories that have expenses
    const categoriesWithExpenses = categoryTableData
      .filter((cat) => cat.value > 0)
      .map((cat) => cat.name);

    // Return all categories that either have expenses or are custom categories
    return allCategories.filter(
      (cat) =>
        categoriesWithExpenses.includes(cat) ||
        categories.find((c) => c.name === cat)?.isCustom
    );
  };

  // Initialize hidden categories with none (show all categories with data)
  useEffect(() => {
    if (categories.length > 0) {
      const categoriesToShow = getCategoriesWithData();
      const allCategories = categories.map((cat) => cat.name);
      const categoriesToHide = allCategories.filter(
        (cat) => !categoriesToShow.includes(cat)
      );

      // Only update if the hidden categories have actually changed
      if (
        JSON.stringify(categoriesToHide) !== JSON.stringify(hiddenCategories)
      ) {
        setHiddenCategories(categoriesToHide);
      }
    }
  }, [categories, categoryTableData]); // Add categories to dependencies

  // Update line chart data
  const lineChartData = useMemo(
    () => ({
      labels: expensesOverTimeData.dates,
      datasets: categoryTableData
        .filter((category) => !hiddenCategories.includes(category.name))
        .map((category, index) => ({
          label: category.name,
          data:
            expensesOverTimeData.categories.find(
              (c) => c.name === category.name
            )?.data || [],
          fill: false,
          borderColor: PIE_COLORS[index % PIE_COLORS.length],
          backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
          tension: 0.3,
          pointBackgroundColor: PIE_COLORS[index % PIE_COLORS.length],
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: PIE_COLORS[index % PIE_COLORS.length],
        })),
    }),
    [expensesOverTimeData, categoryTableData, hiddenCategories]
  );

  const handleLineChartRefresh = () => {
    setLineChartKey((prev) => prev + 1);
  };

  const handlePieChartRefresh = () => {
    setPieChartKey((prev) => prev + 1);
  };

  if (!currentUser) {
    return (
      <Container
        maxWidth="lg"
        sx={{ mt: 4, mb: 4 }}
        className="marginContainer"
      >
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Please log in to view the dashboard.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} className="marginContainer">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
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
          onChange={(_e, newPeriod) => newPeriod && setTimePeriod(newPeriod)}
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
          <ToggleButton className="toggleButton" value="MTD">
            {currentMonthName}
          </ToggleButton>
          <ToggleButton className="toggleButton" value="3M">
            3M
          </ToggleButton>
          <ToggleButton className="toggleButton" value="6M">
            6M
          </ToggleButton>
          <ToggleButton className="toggleButton" value="YTD">
            YTD
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Expenses Over Time Line Chart - Full Width */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          mb: 3,
          width: "100%",
          position: "relative",
        }}
      >
        <CardContent sx={{ width: "100%", p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Expenses Over Time
            </Typography>
            <IconButton
              onClick={handleLineChartRefresh}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <FeatherIcons.RefreshCw size={16} />
            </IconButton>
          </Box>
          {loading ? (
            <Box
              sx={{
                width: "100%",
                height: 350,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Skeleton variant="rectangular" height={40} width="60%" />
              <Skeleton variant="rectangular" height={250} />
              <Skeleton variant="rectangular" height={40} width="40%" />
            </Box>
          ) : expensesOverTimeData.dates.length > 0 ? (
            <Box sx={{ width: "100%", height: 350 }}>
              <Line
                key={lineChartKey}
                data={lineChartData}
                options={{
                  ...lineOptions,
                  maintainAspectRatio: false,
                  responsive: true,
                }}
              />
            </Box>
          ) : (
            <Typography sx={{ m: "auto", textAlign: "center", py: 4 }}>
              No data for this period.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart and Table - Side by Side on large screens */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          mb: 3,
        }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "top",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
                mb: 2,
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Spending by Category
              </Typography>
              <IconButton
                onClick={handlePieChartRefresh}
                size="small"
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "primary.main" },
                }}
              >
                <FeatherIcons.RefreshCw size={16} />
              </IconButton>
            </Box>
            {loading ? (
              <Box
                sx={{
                  width: "100%",
                  height: 400,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Skeleton variant="circular" width={200} height={200} />
                <Skeleton variant="rectangular" width="60%" height={40} />
                <Skeleton variant="rectangular" width="40%" height={40} />
              </Box>
            ) : categoryTableData.length > 0 ? (
              <Box
                sx={{
                  position: "relative",
                  height: 400,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexGrow: 1,
                }}
              >
                <Pie
                  key={pieChartKey}
                  data={pieChartDataJS}
                  options={pieOptions}
                />
              </Box>
            ) : (
              <Typography sx={{ m: "auto", textAlign: "center", py: 4 }}>
                No data for this period.
              </Typography>
            )}
          </CardContent>
        </Card>
        <Card
          elevation={0}
          sx={{
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            flex: 1,
          }}
        >
          <CardContent>
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
              Category Spending Table
            </Typography>
            {loading ? (
              <Box sx={{ width: "100%" }}>
                <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={48}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
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
                        <TableRow key={row.name} hover>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {getCategoryIcon(row.icon)}
                              {row.name}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {row.value.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            {preferences.defaultCurrency}
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
    </Container>
  );
};

export default DashboardPage;
