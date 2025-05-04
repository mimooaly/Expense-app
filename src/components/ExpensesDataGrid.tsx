import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { IconButton, Tooltip } from "@mui/material";
import { Edit2, Trash2 } from "react-feather";

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
}

interface ExpensesDataGridProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const ExpensesDataGrid: React.FC<ExpensesDataGridProps> = ({
  expenses,
  onEdit,
  onDelete,
}) => {
  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "amount", headerName: "Amount", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
          <Tooltip title="Edit">
            <IconButton onClick={() => onEdit(params.row)} color="inherit">
              <Edit2 size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => onDelete(params.row.id)} color="inherit">
              <Trash2 size={20} />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={expenses}
        columns={columns}
        pagination
        paginationModel={{ pageSize: 5, page: 0 }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </div>
  );
};

export default ExpensesDataGrid;
