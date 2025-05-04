import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { database, auth } from "./firebaseConfig";
import { ref, push } from "firebase/database";
import { Typography } from "@mui/material";

interface ExpenseFormData {
  name: string;
  amount: number;
  category: string;
  date: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  category: Yup.string().required("Category is required"),
  date: Yup.string().required("Date is required"),
});

const AddExpense: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values: ExpenseFormData) => {
    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to add an expense");
      return;
    }

    try {
      await push(ref(database, `expenses/${user.uid}`), {
        name: values.name,
        category: values.category,
        amount: values.amount,
        date: values.date,
      });
      setSuccess(true);
      setError("");
    } catch (err) {
      setError((err as any).message);
      setSuccess(false);
    }
  };

  return (
    <Box>
      <Formik
        initialValues={{
          name: "",
          amount: 0,
          category: "",
          date: new Date().toISOString().split("T")[0],
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form>
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
            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success" sx={{ mt: 2, textAlign: "center" }}>
                Expense added successfully!
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Add Expense
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default AddExpense;
