import React from "react";
import {
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import {
  MoreVertical,
  Tag,
  DollarSign,
  Calendar,
  RefreshCw,
  CheckSquare,
  Square,
  Trash2,
} from "react-feather";

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onBulkActionClick: (event: React.MouseEvent<HTMLElement>) => void;
  onBulkActionClose: () => void;
  onCategoryClick: () => void;
  onAmountClick: () => void;
  onDateClick: () => void;
  onRecurringClick: () => void;
  onDeleteClick: () => void;
  onSelectAll: () => void;
  anchorEl: HTMLElement | null;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  totalCount,
  onBulkActionClick,
  onBulkActionClose,
  onCategoryClick,
  onAmountClick,
  onDateClick,
  onRecurringClick,
  onDeleteClick,
  onSelectAll,
  anchorEl,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Toolbar
      sx={{
        pl: { sm: 1 },
        pr: { xs: 1, sm: 1 },
        py: 0.5,
        minHeight: "48px !important",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        mb: 2,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle2"
          component="div"
        >
          {selectedCount} selected
        </Typography>
        {isMobile && (
          <Button
            variant="text"
            onClick={onSelectAll}
            startIcon={
              selectedCount === totalCount ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )
            }
            sx={{
              whiteSpace: "nowrap",
              minWidth: "auto",
              px: 1,
            }}
          >
            {selectedCount === totalCount ? "Deselect All" : "Select All"}
          </Button>
        )}
      </Box>

      {isMobile ? (
        <>
          <Button
            variant="text"
            onClick={onBulkActionClick}
            startIcon={<MoreVertical size={16} />}
            sx={{
              minWidth: "auto",
              px: 1,
            }}
          >
            Bulk Actions
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={onBulkActionClose}
          >
            <MenuItem
              onClick={() => {
                onBulkActionClose();
                onCategoryClick();
              }}
            >
              <ListItemIcon>
                <Tag size={16} />
              </ListItemIcon>
              <ListItemText>Category</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                onBulkActionClose();
                onAmountClick();
              }}
            >
              <ListItemIcon>
                <DollarSign size={16} />
              </ListItemIcon>
              <ListItemText>Amount</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                onBulkActionClose();
                onDateClick();
              }}
            >
              <ListItemIcon>
                <Calendar size={16} />
              </ListItemIcon>
              <ListItemText>Date</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                onBulkActionClose();
                onRecurringClick();
              }}
            >
              <ListItemIcon>
                <RefreshCw size={16} />
              </ListItemIcon>
              <ListItemText>Recurring</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                onBulkActionClose();
                onDeleteClick();
              }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <Trash2 size={16} color="currentColor" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <Typography
            variant="subtitle2"
            sx={{ mr: 1, color: "text.secondary" }}
          >
            Bulk Actions:
          </Typography>
          <Button
            variant="text"
            onClick={onCategoryClick}
            startIcon={<Tag size={16} />}
            sx={{
              minWidth: "auto",
              px: 1,
            }}
          >
            Category
          </Button>
          <Button
            variant="text"
            onClick={onAmountClick}
            startIcon={<DollarSign size={16} />}
            sx={{
              minWidth: "auto",
              px: 1,
            }}
          >
            Amount
          </Button>
          <Button
            variant="text"
            onClick={onDateClick}
            startIcon={<Calendar size={16} />}
            sx={{
              minWidth: "auto",
              px: 1,
            }}
          >
            Date
          </Button>
          <Button
            variant="text"
            onClick={onRecurringClick}
            startIcon={<RefreshCw size={16} />}
            sx={{
              minWidth: "auto",
              px: 1,
            }}
          >
            Recurring
          </Button>
          <Button
            variant="text"
            onClick={onDeleteClick}
            startIcon={<Trash2 size={16} />}
            sx={{
              minWidth: "auto",
              px: 1,
              color: "error.main",
              "&:hover": {
                color: "error.dark",
                backgroundColor: "error.lighter",
              },
            }}
          >
            Delete
          </Button>
        </Box>
      )}
    </Toolbar>
  );
};

export default BulkActionsToolbar;
