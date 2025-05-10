import {
  Box,
  Card,
  CardContent,
  Container,
  MenuItem,
  Select,
  Typography,
  Table,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from "@mui/material";
import theme from "./theme";
import { useState } from "react";
import { Edit2, Trash2, Folder } from "react-feather";
import * as FeatherIcons from "react-feather";
import { useCategories } from "./hooks/useCategories";
import { database, auth } from "./firebaseConfig";
import { ref, push, remove, update, set } from "firebase/database";

interface Category {
  id: string;
  name: string;
  icon: string;
  isCustom?: boolean;
}

const Settings = () => {
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const categories = useCategories();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddCategory = async () => {
    const user = auth.currentUser;
    if (!user || !newCategoryName) return;

    try {
      const customCategoriesRef = ref(database, `customCategories/${user.uid}`);
      const newCategoryRef = push(customCategoriesRef);
      const newCategoryId = newCategoryRef.key;

      if (!newCategoryId) {
        throw new Error("Failed to generate category ID");
      }

      const newCategory = {
        id: `custom_${newCategoryId}`,
        name: newCategoryName,
        icon: "folder",
        isCustom: true,
      };

      await set(newCategoryRef, newCategory);
      setIsAddDialogOpen(false);
      setNewCategoryName("");
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleEditCategory = async (category: Category) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      if (category.isCustom) {
        // Extract the original ID by removing the "custom_" prefix
        const originalId = category.id.replace("custom_", "");
        // Update custom category
        await update(
          ref(database, `customCategories/${user.uid}/${originalId}`),
          {
            name: category.name,
            icon: "folder",
          }
        );
      } else {
        // For default categories, store modifications in userPreferences
        await set(
          ref(
            database,
            `userPreferences/${user.uid}/modifiedCategories/${category.id}`
          ),
          {
            name: category.name,
            icon: category.icon,
            isCustom: false,
          }
        );
      }
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    const user = auth.currentUser;
    if (!user || !category.isCustom) return;

    try {
      // Extract the original ID by removing the "custom_" prefix
      const originalId = category.id.replace("custom_", "");
      await remove(ref(database, `customCategories/${user.uid}/${originalId}`));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await update(ref(database, `userPreferences/${user.uid}`), {
        defaultCurrency: newCurrency,
      });
      setDefaultCurrency(newCurrency);
    } catch (error) {
      console.error("Error updating currency:", error);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    if (iconName === "folder") {
      return (
        <Folder size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
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

  return (
    <Container maxWidth="md" className="page-glossy-background" sx={{ mt: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your account settings
        </Typography>
      </Box>

      {/* Default Currency */}
      <Box sx={{ mb: 4 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                }}
              >
                <Typography variant="h6">Default Currency</Typography>
                <Typography variant="body2" color="text.secondary">
                  Select your default currency
                </Typography>
              </Box>
              <Select
                value={defaultCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                sx={{ ml: "auto" }}
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EGP">EGP</MenuItem>
                <MenuItem value="PHP">PHP</MenuItem>
              </Select>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Manage Categories */}
      <Box sx={{ mb: 4 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                textAlign: "left",
              }}
            >
              <Typography variant="h6">Manage Categories</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your expense categories
              </Typography>
            </Box>
            <Table size="small" sx={{ mt: 2, border: "1px solid #e0e0e0" }}>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {getCategoryIcon(category.icon)}
                        {category.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {category.isCustom ? "Custom" : "Default"}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </IconButton>
                      <Tooltip
                        title={
                          category.isCustom
                            ? "Delete category"
                            : "You can't delete default categories"
                        }
                      >
                        <span>
                          <IconButton
                            onClick={() => handleDeleteCategory(category)}
                            disabled={!category.isCustom}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add Custom Category
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Add Custom Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCategory} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      >
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          {selectedCategory && (
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              fullWidth
              value={selectedCategory.name}
              onChange={(e) =>
                setSelectedCategory({
                  ...selectedCategory,
                  name: e.target.value,
                })
              }
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() =>
              selectedCategory && handleEditCategory(selectedCategory)
            }
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;
