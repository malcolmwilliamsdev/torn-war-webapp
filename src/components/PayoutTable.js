import React, { useState, useEffect, useCallback } from "react";
import { Checkbox, Paper } from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

export default function PayoutTable({
  updateTrigger,
  payType,
  faction,
  fixedPay,
  totalMoney,
  memberRatio,
  mvpRatio,
}) {
  const [rows, setRows] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const columns = [
    { field: "col1", headerName: "Member", width: 200 },
    { field: "col2", headerName: "Score", width: 125 },
    { field: "col3", headerName: "Attacks", width: 100 },
    payType !== "Fixed" && {
      field: "col4",
      headerName: "MVP",
      width: 100,
      renderCell: (params) => (
        <Checkbox
          checked={selectedRows.includes(params.row.id)}
          onChange={() => handleRowSelection(params.row.id)}
        />
      ),
    },
    payType !== "Fixed" && {
      field: "col5",
      headerName: "Base Pay",
      width: 150,
      valueFormatter: (params) => "$" + params.value.toLocaleString(),
    },
    payType !== "Fixed" && {
      field: "col6",
      headerName: "Bonus Pay",
      width: 150,
      valueFormatter: (params) => "$" + params.value.toLocaleString(),
    },
    {
      field: "col7",
      headerName: "Total Pay",
      width: 150,
      valueFormatter: (params) => "$" + params.value.toLocaleString(),
    },
  ].filter(Boolean); // Filter out falsy values (undefined) due to the conditional check

  const handleRowSelection = (rowId) => {
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  const handleInitializeSelectedRows = useCallback(() => {
    if (faction && faction.members.length > 0) {
      const highestScoringMember = faction.members.reduce(
        (highest, current) =>
          current.score > highest.score ? current : highest,
        faction.members[0]
      );

      setSelectedRows([highestScoringMember.id]);
    }
  }, [faction]);

  useEffect(() => {
    handleInitializeSelectedRows();
  }, [updateTrigger, handleInitializeSelectedRows]);

  const populateRows = useCallback(() => {
    if (faction) {
      const newRows = faction.members.map((member) => {
        const basePay = Math.floor(
          payType === "Fixed"
            ? member.attacks * fixedPay
            : payType === "Attacks"
            ? ((member.attacks / faction.attacks) * totalMoney * memberRatio) /
              100
            : ((member.score / faction.score) * totalMoney * memberRatio) / 100
        );

        const bonusPay = Math.floor(
          payType === "Fixed"
            ? 0
            : selectedRows.length > 0 && selectedRows.includes(member.id)
            ? (totalMoney * mvpRatio) / 100 / selectedRows.length
            : 0
        );

        const totalPay = basePay + bonusPay;

        return {
          id: member.id,
          col1: member.name + " [" + member.id + "]",
          col2: member.score,
          col3: member.attacks,
          col5: basePay,
          col6: bonusPay,
          col7: totalPay,
        };
      });

      setRows(newRows);
    }
  }, [
    faction,
    payType,
    fixedPay,
    totalMoney,
    memberRatio,
    mvpRatio,
    selectedRows,
  ]);

  useEffect(() => {
    populateRows();
  }, [updateTrigger, selectedRows, populateRows]);

  return (
    <Paper>
      {rows && (
        <DataGrid
          rows={rows}
          columns={columns}
          selectionModel={selectedRows}
          onSelectionModelChange={(newSelectionModel) =>
            setSelectedRows(newSelectionModel)
          }
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 25,
              },
            },
            sorting: {
              sortModel: [{ field: "col2", sort: "desc" }],
            },
          }}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
        />
      )}
    </Paper>
  );
}
