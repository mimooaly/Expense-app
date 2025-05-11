import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
} from "@mui/material";
import { Category } from "../hooks/useCategories";
import * as FeatherIcons from "react-feather";

interface BulkEditDialogsProps {
  isCategoryDialogOpen: boolean;
  isAmountDialogOpen: boolean;
  isDateDialogOpen: boolean;
  isRecurringDialogOpen: boolean;
  onCategoryDialogClose: () => void;
  onAmountDialogClose: () => void;
  onDateDialogClose: () => void;
  onRecurringDialogClose: () => void;
  onCategoryChange: (categoryId: string) => void;
  onAmountChange: (amount: number) => void;
  onDateChange: (date: string) => void;
  onRecurringChange: (isRecurring: boolean) => void;
  categories: Category[];
  getCategoryIcon: (iconName: string) => React.ReactNode;
}

const BulkEditDialogs: React.FC<BulkEditDialogsProps> = ({
  isCategoryDialogOpen,
  isAmountDialogOpen,
  isDateDialogOpen,
  isRecurringDialogOpen,
  onCategoryDialogClose,
  onAmountDialogClose,
  onDateDialogClose,
  onRecurringDialogClose,
  onCategoryChange,
  onAmountChange,
  onDateChange,
  onRecurringChange,
  categories,
  getCategoryIcon,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedRecurring, setSelectedRecurring] = useState<boolean | null>(
    null
  );

  const handleCategoryConfirm = () => {
    if (selectedCategory) {
      onCategoryChange(selectedCategory);
      setSelectedCategory("");
      onCategoryDialogClose();
    }
  };

  const handleAmountConfirm = () => {
    if (selectedAmount > 0) {
      onAmountChange(selectedAmount);
      setSelectedAmount(0);
      onAmountDialogClose();
    }
  };

  const handleDateConfirm = () => {
    if (selectedDate) {
      onDateChange(selectedDate);
      setSelectedDate("");
      onDateDialogClose();
    }
  };

  const handleRecurringConfirm = () => {
    if (selectedRecurring !== null) {
      onRecurringChange(selectedRecurring);
      setSelectedRecurring(null);
      onRecurringDialogClose();
    }
  };

  return (
    <>
      {/* Bulk Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onClose={onCategoryDialogClose}>
        <DialogTitle>Change Category</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {getCategoryIcon(category.icon)}
                  <span style={{ marginLeft: 8 }}>{category.name}</span>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCategoryDialogClose}>Cancel</Button>
          <Button
            onClick={handleCategoryConfirm}
            variant="contained"
            disabled={!selectedCategory}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Amount Dialog */}
      <Dialog open={isAmountDialogOpen} onClose={onAmountDialogClose}>
        <DialogTitle>Change Amount</DialogTitle>
        <DialogContent>
          <TextField
            type="number"
            fullWidth
            label="Amount"
            value={selectedAmount || ""}
            onChange={(e) => setSelectedAmount(Number(e.target.value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onAmountDialogClose}>Cancel</Button>
          <Button
            onClick={handleAmountConfirm}
            variant="contained"
            disabled={!selectedAmount || selectedAmount <= 0}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Date Dialog */}
      <Dialog open={isDateDialogOpen} onClose={onDateDialogClose}>
        <DialogTitle>Change Date</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            fullWidth
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onDateDialogClose}>Cancel</Button>
          <Button
            onClick={handleDateConfirm}
            variant="contained"
            disabled={!selectedDate}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Recurring Dialog */}
      <Dialog open={isRecurringDialogOpen} onClose={onRecurringDialogClose}>
        <DialogTitle>Toggle Recurring</DialogTitle>
        <DialogContent>
          <Button
            fullWidth
            variant={selectedRecurring === true ? "contained" : "outlined"}
            onClick={() => setSelectedRecurring(true)}
            sx={{ mb: 1 }}
          >
            Mark as Recurring
          </Button>
          <Button
            fullWidth
            variant={selectedRecurring === false ? "contained" : "outlined"}
            onClick={() => setSelectedRecurring(false)}
          >
            Mark as Non-Recurring
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={onRecurringDialogClose}>Cancel</Button>
          <Button
            onClick={handleRecurringConfirm}
            variant="contained"
            disabled={selectedRecurring === null}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkEditDialogs;
