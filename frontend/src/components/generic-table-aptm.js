import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import { LoadingButton } from '@mui/lab';
import { configs } from 'src/config-variables';
import { useState } from 'react';



export default function HassTableAptm({ columns, rows, setReFectch }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      console.log({ value })
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {/* {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value} */}
                          {value === "actions" ? <StatusAction id={row.id} status={row.status} setReFectch={setReFectch} /> : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

const StatusAction = ({ id, status, setReFectch }) => {
  const [loading, setloading] = useState(false)
  function handleOnAction() {
    setloading(true)
    fetch(`${configs.baseUrl}/auth/${id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: status !== "active" ? "active" : "disable" })
    }).then(res => res.json()).
      then(respose => {
        setloading(false)
        setReFectch(state => !state)
        alert(respose.message);
      }).catch(err => {
        setloading(false);
        alert(err.message)
      })

  }
  return (<LoadingButton loading={loading} color={status !== "active" ? "success" : "error"} onClick={handleOnAction} variant='contained' size='small'>{status !== "active" ? "Activate" : "Suspend"}</LoadingButton>)
}