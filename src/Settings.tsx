import {
  Box,
  Card,
  CardContent,
  Container,
  MenuItem,
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
  Paper,
  CircularProgress,
  Popover,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { Edit2, Trash2, X } from "react-feather";
import { useCategories, UseCategoriesReturn } from "./hooks/useCategories";
import { database, auth } from "./firebaseConfig";
import { ref, push, remove, update, set, get } from "firebase/database";
import { useUserPreferences } from "./hooks/useUserPreferences";
import { currencyOptions } from "./data/currencyOptions";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface Category {
  id: string;
  name: string;
  icon: string;
  emoji?: string;
  isCustom?: boolean;
}

const Settings = () => {
  const {
    preferences,
    loading: prefsLoading,
    updatePreferences,
    hideCategory,
  } = useUserPreferences();
  const { categories }: UseCategoriesReturn = useCategories(
    preferences.hiddenCategories || []
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryEmoji, setNewCategoryEmoji] = useState("");
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [showEditPicker, setShowEditPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addPickerAnchorEl, setAddPickerAnchorEl] =
    useState<HTMLElement | null>(null);
  const [editPickerAnchorEl, setEditPickerAnchorEl] =
    useState<HTMLElement | null>(null);
  const theme = useTheme();

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
        icon: newCategoryEmoji,
        isCustom: true,
      };

      await set(newCategoryRef, newCategory);
      setIsAddDialogOpen(false);
      setNewCategoryName("");
      setNewCategoryEmoji("");
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory({
      ...category,
      emoji: category.icon,
    });
    setIsEditDialogOpen(true);
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
            icon: category.emoji,
          }
        );

        // Update all expenses that use this custom category
        const expensesRef = ref(database, `expenses/${user.uid}`);
        const snapshot = await get(expensesRef);
        if (snapshot.exists()) {
          const expenses = snapshot.val();
          const updates: { [key: string]: any } = {};

          Object.entries(expenses).forEach(
            ([expenseId, expense]: [string, any]) => {
              if (expense.category === category.id) {
                updates[`expenses/${user.uid}/${expenseId}/categoryName`] =
                  category.name;
              }
            }
          );

          if (Object.keys(updates).length > 0) {
            await update(ref(database), updates);
          }
        }
      } else {
        // For default categories, store modifications in userPreferences
        await set(
          ref(
            database,
            `userPreferences/${user.uid}/modifiedCategories/${category.id}`
          ),
          {
            name: category.name,
            icon: category.emoji,
            isCustom: false,
          }
        );

        // Update all expenses that use this default category
        const expensesRef = ref(database, `expenses/${user.uid}`);
        const snapshot = await get(expensesRef);
        if (snapshot.exists()) {
          const expenses = snapshot.val();
          const updates: { [key: string]: any } = {};

          Object.entries(expenses).forEach(
            ([expenseId, expense]: [string, any]) => {
              if (expense.category === category.id) {
                updates[`expenses/${user.uid}/${expenseId}/categoryName`] =
                  category.name;
              }
            }
          );

          if (Object.keys(updates).length > 0) {
            await update(ref(database), updates);
          }
        }
      }
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Check for associated expenses
      const expensesRef = ref(database, `expenses/${user.uid}`);
      const snapshot = await get(expensesRef);

      if (snapshot.exists()) {
        const expenses = snapshot.val();
        const hasExpenses = Object.values(expenses).some(
          (expense: any) => expense.category === category.id
        );

        if (hasExpenses) {
          setDeleteError("Cannot delete category: It has associated expenses");
          return;
        }
      }

      if (category.isCustom) {
        // Delete custom category
        const originalId = category.id.replace("custom_", "");
        await remove(
          ref(database, `customCategories/${user.uid}/${originalId}`)
        );
      } else {
        // For default categories, mark as hidden
        await hideCategory(category.id);
      }

      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      setDeleteError(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      setDeleteError("Failed to delete category");
    }
  };

  const handleCurrencyChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSaving(true);
    try {
      await updatePreferences({
        defaultCurrency: event.target.value,
      });
    } catch (error) {
      console.error("Error updating currency:", error);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (icon: string) => (
    <span style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>
      {icon}
    </span>
  );

  if (prefsLoading) {
    return (
      <Container maxWidth="lg" className="page-glossy-background">
        <Box sx={{ my: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      className="page-glossy-background marginContainer settings-container"
    >
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Settings
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box className="settings-currency-box">
            <Typography variant="h6">Default Currency</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              This currency will be used as the default for all expenses. You
              can still use other currencies when adding expenses.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              select
              label="Default Currency"
              value={preferences.defaultCurrency}
              onChange={handleCurrencyChange}
              disabled={saving}
              sx={{ minWidth: 200 }}
            >
              {currencyOptions.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            {saving && <CircularProgress size={24} />}
          </Box>
        </Paper>

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
                  {categories.map((category: Category) => (
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
                          className="categActionButton"
                          onClick={() => handleEditClick(category)}
                        >
                          <Edit2 size={16} />
                        </IconButton>
                        <Tooltip title={"Delete category"}>
                          <span>
                            <IconButton
                              className="categActionButton"
                              onClick={() => {
                                setCategoryToDelete(category);
                                setDeleteError(null);
                                setIsDeleteDialogOpen(true);
                              }}
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
        <Dialog
          open={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          PaperProps={{
            sx: {
              overflow: "visible",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <DialogTitle>Add Custom Category</DialogTitle>
          <DialogContent
            sx={{
              overflow: "visible",
              position: "relative",
              flex: "1 1 auto",
            }}
          >
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              fullWidth
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Category Emoji"
              fullWidth
              value={newCategoryEmoji}
              onClick={(e) => {
                setAddPickerAnchorEl(e.currentTarget);
                setShowAddPicker(true);
              }}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton
                    onClick={(e) => {
                      setAddPickerAnchorEl(e.currentTarget);
                      setShowAddPicker(true);
                    }}
                  >
                    <span role="img" aria-label="emoji">
                      😊
                    </span>
                  </IconButton>
                ),
              }}
            />
            <Popover
              open={showAddPicker}
              anchorEl={addPickerAnchorEl}
              onClose={() => {
                setShowAddPicker(false);
                setAddPickerAnchorEl(null);
              }}
              anchorOrigin={{
                vertical: "center",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "center",
                horizontal: "center",
              }}
              PaperProps={{
                sx: {
                  overflow: "hidden",
                  borderRadius: 2,
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  "@media (max-width: 600px)": {
                    width: "auto",
                    maxWidth: "90vw",
                  },
                },
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6">Pick a new emoji</Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setShowAddPicker(false);
                    setAddPickerAnchorEl(null);
                  }}
                  sx={{ ml: 1 }}
                >
                  <X size={18} />
                </IconButton>
              </Box>
              <Box sx={{ p: 1 }}>
                <Picker
                  data={data}
                  onEmojiSelect={(emoji: any) => {
                    setNewCategoryEmoji(emoji.native);
                    setShowAddPicker(false);
                    setAddPickerAnchorEl(null);
                  }}
                  theme="light"
                  set="native"
                />
              </Box>
            </Popover>
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
          PaperProps={{
            sx: {
              overflow: "visible",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <DialogTitle>Edit Category</DialogTitle>
          <DialogContent
            sx={{
              overflow: "visible",
              position: "relative",
              flex: "1 1 auto",
            }}
          >
            {selectedCategory && (
              <>
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
                <TextField
                  margin="dense"
                  label="Category Emoji"
                  fullWidth
                  value={selectedCategory.emoji || ""}
                  onClick={(e) => {
                    setEditPickerAnchorEl(e.currentTarget);
                    setShowEditPicker(true);
                  }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <IconButton
                        onClick={(e) => {
                          setEditPickerAnchorEl(e.currentTarget);
                          setShowEditPicker(true);
                        }}
                      >
                        <span role="img" aria-label="emoji">
                          😊
                        </span>
                      </IconButton>
                    ),
                  }}
                />
                <Popover
                  open={showEditPicker}
                  anchorEl={editPickerAnchorEl}
                  onClose={() => {
                    setShowEditPicker(false);
                    setEditPickerAnchorEl(null);
                  }}
                  anchorOrigin={{
                    vertical: "center",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "center",
                    horizontal: "center",
                  }}
                  PaperProps={{
                    sx: {
                      overflow: "hidden",
                      borderRadius: 2,
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      "@media (max-width: 600px)": {
                        width: "auto",
                        maxWidth: "90vw",
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="h6">Pick a new emoji</Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setShowEditPicker(false);
                        setEditPickerAnchorEl(null);
                      }}
                      sx={{ ml: 1 }}
                    >
                      <X size={18} />
                    </IconButton>
                  </Box>
                  <Box sx={{ p: 1 }}>
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji: any) => {
                        setSelectedCategory({
                          ...selectedCategory,
                          emoji: emoji.native,
                        });
                        setShowEditPicker(false);
                        setEditPickerAnchorEl(null);
                      }}
                      theme="light"
                      set="native"
                    />
                  </Box>
                </Popover>
              </>
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

        {/* Delete Category Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
            setDeleteError(null);
          }}
        >
          <DialogTitle>Delete Category</DialogTitle>
          <DialogContent>
            {deleteError ? (
              <Typography color="error">{deleteError}</Typography>
            ) : (
              <Typography>
                Are you sure you want to delete this category? This action
                cannot be undone.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCategoryToDelete(null);
                setDeleteError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                categoryToDelete && handleDeleteCategory(categoryToDelete)
              }
              color="error"
              variant="contained"
              disabled={!!deleteError}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Settings;
