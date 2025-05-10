import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Expense } from "../ExpensesList";
import expensesCateg from "../data/ExpenseCategories";
import * as FeatherIcons from "react-feather";
import CircularProgress from "@mui/material/CircularProgress";
import { database, auth } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";
import { useCategories } from "../hooks/useCategories";

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Expense | null;
  isEdit?: boolean;
  onSave?: (values: any) => Promise<void>;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  isCustom?: boolean;
}

const currencyOptions = [
  { code: "USD", label: "USD" },
  { code: "PHP", label: "PHP" },
  { code: "EGP", label: "EGP" },
];

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({
  open,
  onClose,
  initialValues,
  isEdit = false,
  onSave,
}) => {
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [usdAmount, setUsdAmount] = useState<number | null>(null);
  const [converting, setConverting] = useState(false);
  const categories = useCategories();

  const formik = useFormik({
    initialValues: initialValues || {
      name: "",
      category: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      monthly: false,
      currency: "USD",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      category: Yup.string().required("Required"),
      amount: Yup.number().required("Required").positive("Must be positive"),
      date: Yup.string().required("Required"),
      monthly: Yup.boolean(),
    }),
    onSubmit: async (values) => {
      if (onSave) {
        try {
          const amountToSave =
            usdAmount !== null ? usdAmount : Number(values.amount);
          await onSave({ ...values, amount: amountToSave, currency: "USD" });
          setError("");
          onClose();
        } catch (error) {
          setError("Error saving expense. Please try again later.");
        }
      }
    },
  });

  const convertToUSD = async (amount: number, fromCurrency: string) => {
    if (fromCurrency === "USD" || !amount) {
      setUsdAmount(amount);
      return;
    }

    setConverting(true);
    try {
      console.log(`Converting ${amount} ${fromCurrency} to USD`);
      const res = await fetch(
        `https://open.er-api.com/v6/latest/${fromCurrency}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Conversion response:", data);

      if (data.rates && data.rates.USD) {
        const convertedAmount = amount * data.rates.USD;
        setUsdAmount(convertedAmount);
        setError("");
      } else {
        console.error("Conversion failed:", data);
        setError("Conversion failed. Please try again.");
        setUsdAmount(null);
      }
    } catch (e) {
      console.error("Conversion error:", e);
      setError("Conversion failed. Please try again.");
      setUsdAmount(null);
    }
    setConverting(false);
  };

  useEffect(() => {
    if (formik.values.amount && !isNaN(Number(formik.values.amount))) {
      convertToUSD(Number(formik.values.amount), currency);
    } else {
      setUsdAmount(null);
    }
  }, [formik.values.amount, currency]);

  useEffect(() => {
    if (initialValues) {
      console.log("Initial values for edit:", initialValues);
    }
  }, [initialValues]);

  const getCategoryIcon = (iconName: string) => {
    if (iconName === "folder") {
      return (
        <FeatherIcons.Folder
          size={18}
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
        size={18}
        style={{ marginRight: 8, verticalAlign: "middle" }}
      />
    ) : null;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Expense" : "Add New Expense"}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Expense Name"
            name="name"
            size="small"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            select
            fullWidth
            margin="normal"
            label="Category"
            name="category"
            size="small"
            value={formik.values.category}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!(formik.touched.category && formik.errors.category)}
            helperText={formik.touched.category && formik.errors.category}
          >
            <MenuItem value="">Select Category</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {getCategoryIcon(cat.icon)}
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 2 }}>
            <TextField
              select
              label="Currency"
              size="small"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              sx={{ minWidth: 90 }}
            >
              {currencyOptions.map((opt) => (
                <MenuItem key={opt.code} value={opt.code}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              size="small"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={!!(formik.touched.amount && formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
            />
          </Box>
          {usdAmount !== null && (
            <Box
              sx={{
                mt: 1,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
                fontSize: "0.875rem",
              }}
            >
              {converting ? (
                <CircularProgress size={16} />
              ) : (
                <>
                  <span>≈</span>
                  <strong>{usdAmount.toFixed(2)} USD</strong>
                  {error && (
                    <span
                      style={{
                        color: "error.main",
                        fontSize: "0.75rem",
                        marginLeft: "8px",
                      }}
                    >
                      {error}
                    </span>
                  )}
                </>
              )}
            </Box>
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Date"
            name="date"
            type="date"
            size="small"
            value={formik.values.date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!(formik.touched.date && formik.errors.date)}
            helperText={formik.touched.date && formik.errors.date}
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="monthly"
                checked={formik.values.monthly}
                onChange={formik.handleChange}
              />
            }
            label="Recurring Expense"
          />
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => formik.handleSubmit()}
          variant="contained"
          disabled={converting}
        >
          {converting ? (
            <CircularProgress size={24} />
          ) : isEdit ? (
            "Save"
          ) : (
            "Add"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddExpenseDialog;
