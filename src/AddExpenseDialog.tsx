import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useUserPreferences } from "./hooks/useUserPreferences";

interface ExpenseFormData {
  id?: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  monthly?: boolean;
  startDate?: string;
  currency: string;
}

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: ExpenseFormData) => void;
  isEdit?: boolean;
  initialValues?: ExpenseFormData;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  category: Yup.string().required("Category is required"),
  date: Yup.string().required("Date is required"),
  currency: Yup.string().required("Currency is required"),
});

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({
  open,
  onClose,
  onAdd,
  isEdit = false,
  initialValues,
}) => {
  const { preferences } = useUserPreferences();

  const today = new Date().toISOString().split("T")[0];

  const handleSave = async (formData: ExpenseFormData) => {
    if (isEdit && initialValues) {
      onAdd({
        ...formData,
        id: initialValues.id,
      });
    } else {
      onAdd(formData);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isEdit ? "Edit Expense" : "Add New Expense"}</DialogTitle>
      <Formik
        initialValues={{
          name: initialValues?.name || "",
          amount: initialValues?.amount || 0,
          category: initialValues?.category || "",
          date: initialValues?.date || today,
          monthly: initialValues?.monthly || false,
          startDate: initialValues?.startDate || today,
          id: initialValues?.id,
          currency: initialValues?.currency || preferences.defaultCurrency,
        }}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={handleSave}
      >
        {({ errors, touched, values }) => (
          <Form>
            <DialogContent>
              <Field
                as={TextField}
                name="name"
                label="Name"
                fullWidth
                margin="normal"
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
              <Field
                as={TextField}
                name="amount"
                label="Amount"
                type="number"
                fullWidth
                margin="normal"
                error={touched.amount && Boolean(errors.amount)}
                helperText={touched.amount && errors.amount}
              />
              <Field
                as={TextField}
                name="category"
                label="Category"
                fullWidth
                margin="normal"
                error={touched.category && Boolean(errors.category)}
                helperText={touched.category && errors.category}
              />
              <Field
                as={TextField}
                name="date"
                label="Date"
                type="date"
                fullWidth
                margin="normal"
                error={touched.date && Boolean(errors.date)}
                helperText={touched.date && errors.date}
              />
              <Field name="monthly">
                {({ field }: any) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color="primary"
                      />
                    }
                    label="Recurring Monthly"
                    sx={{ mt: 1 }}
                  />
                )}
              </Field>
              {values.monthly && (
                <Field
                  as={TextField}
                  name="startDate"
                  label="Start Date"
                  type="date"
                  fullWidth
                  margin="normal"
                  error={touched.startDate && Boolean(errors.startDate)}
                  helperText={touched.startDate && errors.startDate}
                />
              )}
              <Field
                as={TextField}
                name="currency"
                label="Currency"
                fullWidth
                margin="normal"
                error={touched.currency && Boolean(errors.currency)}
                helperText={touched.currency && errors.currency}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                {isEdit ? "Save" : "Add"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddExpenseDialog;
