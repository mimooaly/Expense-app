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

interface ExpenseFormData {
  id?: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  monthly?: boolean;
  startDate?: string;
}

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ExpenseFormData) => void;
  isEdit?: boolean;
  initialValues?: ExpenseFormData;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  category: Yup.string().required("Category is required"),
  date: Yup.string().required("Date is required"),
  startDate: Yup.string().when("monthly", {
    is: true,
    then: (schema) =>
      schema.required("Start date is required for recurring expenses"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({
  open,
  onClose,
  onSave,
  isEdit = false,
  initialValues,
}) => {
  const today = new Date().toISOString().split("T")[0];

  const handleSave = async (formData: ExpenseFormData) => {
    if (isEdit && initialValues) {
      onSave({
        ...formData,
        id: initialValues.id,
      });
    } else {
      onSave(formData);
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
