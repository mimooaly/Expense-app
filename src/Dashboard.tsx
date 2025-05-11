import React, { useEffect, useState } from "react";
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
  const categories = useCategories();

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
  const filteredExpenses = allExpenses.filter((exp) => {
    const expenseDate = new Date(exp.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  // Get category icon
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

  // Expenses Over Time (Line Chart)
  const expensesOverTimeData = (() => {
    if (timePeriod === "MTD") {
      // Group by day
      const map = new Map<string, number>();
      filteredExpenses.forEach((exp) => {
        const dayKey = new Date(exp.date).toISOString().split("T")[0];
        map.set(dayKey, (map.get(dayKey) || 0) + exp.amount);
      });
      // Fill in missing days for the current month if MTD
      const now = new Date();
      const daysInMonth = now.getDate();
      const year = now.getFullYear();
      const month = now.getMonth();
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dayKey = date.toISOString().split("T")[0];
        if (!map.has(dayKey)) {
          map.set(dayKey, 0);
        }
      }
      // Sort by date
      return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amount]) => ({ date, amount }));
    } else {
      // Group by month
      const map = new Map<string, number>();
      filteredExpenses.forEach((exp) => {
        const date = new Date(exp.date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        map.set(monthKey, (map.get(monthKey) || 0) + exp.amount);
      });
      return Array.from(map.entries()).map(([date, amount]) => ({
        date,
        amount,
      }));
    }
  })();

  // Pie chart for spending per category (aggregate by category name)
  const categorySpendingData = filteredExpenses.reduce((acc, expense) => {
    // Always use category name for aggregation
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

  // Table for all category spendings
  const categoryTableData = Object.entries(categorySpendingData)
    .map(([name, value]) => {
      const category = categories.find((cat) => cat.name === name);
      return {
        name,
        icon: category ? category.icon : "box",
        value: Number(value),
      };
    })
    .sort((a, b) => b.value - a.value);

  // Pie chart data for spending per category
  const pieChartDataJS = {
    labels: categoryTableData.map((row) => row.name),
    datasets: [
      {
        data: categoryTableData.map((row) => row.value),
        backgroundColor: PIE_COLORS,
      },
    ],
  };

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
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.parsed.y.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })} ${preferences.defaultCurrency}`;
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
            const date = expensesOverTimeData[idx]?.date;
            if (timePeriod === "MTD" && date) {
              // Show day of month (1, 2, 3, ...)
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
        }}
      >
        <CardContent sx={{ width: "100%", p: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
            Expenses Over Time
          </Typography>
          {loading ? (
            <Skeleton variant="rectangular" height={350} />
          ) : expensesOverTimeData.length > 0 ? (
            <Box sx={{ width: "100%", height: 350 }}>
              <Line
                data={{
                  labels: expensesOverTimeData.map((d) => d.date),
                  datasets: [
                    {
                      label: `Expenses (${preferences.defaultCurrency})`,
                      data: expensesOverTimeData.map((d) => d.amount),
                      fill: true,
                      backgroundColor: "rgba(76, 175, 80, 0.1)", // light green with opacity
                      borderColor: theme.palette.primary.main,
                      tension: 0.3,
                      pointBackgroundColor: theme.palette.primary.main,
                      pointBorderColor: "#fff",
                      pointHoverBackgroundColor: "#fff",
                      pointHoverBorderColor: theme.palette.primary.main,
                    },
                  ],
                }}
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
              justifyContent: "center",
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", mb: 2, alignSelf: "center" }}
            >
              Spending by Category
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={400} />
            ) : categoryTableData.length > 0 ? (
              <Box
                sx={{
                  position: "relative",
                  height: 400,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pie data={pieChartDataJS} options={pieOptions} />
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
              <Skeleton variant="rectangular" height={200} />
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
