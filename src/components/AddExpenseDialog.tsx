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
import CircularProgress from "@mui/material/CircularProgress";
import { useCategories } from "../hooks/useCategories";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { currencyOptions } from "../data/currencyOptions";
import { Category } from "../hooks/useCategories";

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Expense | null;
  isEdit?: boolean;
  onSave?: (values: any) => Promise<void>;
  emptyExpense: Expense;
}

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({
  open,
  onClose,
  initialValues,
  isEdit = false,
  onSave,
  emptyExpense,
}) => {
  const [error, setError] = useState("");
  const categories = useCategories();
  const { preferences } = useUserPreferences();
  const [usdAmount, setUsdAmount] = useState<number | null>(null);
  const [converting, setConverting] = useState(false);

  const formik = useFormik({
    initialValues: initialValues || {
      ...emptyExpense,
      currency: preferences?.defaultCurrency || "USD",
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
          setError("");
          const amountToSave =
            usdAmount !== null ? usdAmount : Number(values.amount);
          await onSave({
            ...values,
            amount: amountToSave,
            currency: values.currency,
            id: initialValues?.id,
            category: values.category.toString(),
          });
          onClose();
        } catch (error) {
          console.error("Error saving expense:", error);
          setError("Error saving expense. Please try again.");
        }
      }
    },
  });

  const convertToPreferredCurrency = async (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ) => {
    if (fromCurrency === toCurrency || !amount) {
      setUsdAmount(amount);
      return;
    }
    setConverting(true);
    try {
      const res = await fetch(
        `https://open.er-api.com/v6/latest/${fromCurrency}`
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.rates && data.rates[toCurrency]) {
        const rate = data.rates[toCurrency];
        const convertedAmount = amount * rate;
        setUsdAmount(convertedAmount);
        setError("");
      } else {
        setError("Conversion failed. Please try again.");
        setUsdAmount(null);
      }
    } catch (e) {
      setError("Conversion failed. Please try again.");
      setUsdAmount(null);
    }
    setConverting(false);
  };

  useEffect(() => {
    if (formik.values.amount && !isNaN(Number(formik.values.amount))) {
      convertToPreferredCurrency(
        Number(formik.values.amount),
        formik.values.currency,
        preferences.defaultCurrency
      );
    } else {
      setUsdAmount(null);
    }
  }, [
    formik.values.amount,
    formik.values.currency,
    preferences.defaultCurrency,
  ]);

  useEffect(() => {
    if (initialValues) {
      console.log("Initial values for edit:", initialValues);
    }
  }, [initialValues]);

  const getCategoryIcon = (category: Category) => {
    return (
      <span style={{ fontSize: 20, marginRight: 8, verticalAlign: "middle" }}>
        {category.icon}
      </span>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Expense" : "Add New Expense"}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
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
            value={formik.values.category || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!(formik.touched.category && formik.errors.category)}
            helperText={formik.touched.category && formik.errors.category}
          >
            <MenuItem value="">Select Category</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id.toString()}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {getCategoryIcon(cat)}
                  {cat.name}
                </Box>
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 2 }}>
            <TextField
              select
              label="Currency"
              size="small"
              value={formik.values.currency}
              onChange={(e) => formik.setFieldValue("currency", e.target.value)}
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
          {usdAmount !== null &&
            formik.values.currency !== preferences.defaultCurrency && (
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
                    <strong>
                      {usdAmount.toFixed(2)} {preferences.defaultCurrency}
                    </strong>
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
