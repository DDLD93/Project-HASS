import { useEffect, useState } from "react";
import Head from "next/head";
import { subDays, subHours } from "date-fns";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import { Box, Button, Container, Stack, SvgIcon, Typography } from "@mui/material";
import { useSelection } from "src/hooks/use-selection";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { AppointmentsTable } from "src/sections/appointments/appointments-table";
import { AppointmentsSearch } from "src/sections/appointments/appointments-search";
import { applyPagination } from "src/utils/apply-pagination";
import AppointmentModal from "src/sections/appointments/appointments-modal";
import HassTable from "src/components/generic-table";
import { configs } from "src/config-variables";

const now = new Date();
function createData(room, time, status, createdAt, actions) {
  return {
    room,
    time,
    status,
    createdAt,
    actions,
  };
}

const columns = [
  { id: "room", label: "Room" },
  { id: "time", label: "Time" },
  { id: "status", label: "Status" },
  { id: "createdAt", label: "Created At" },
];

const Page = () => {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${configs.baseUrl}/appointment/all`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        const { ok, data, message } = result;
        if (ok) {
          const rowData = data.map((row) => {
            return createData(row.room, row.start, row.status, row.createdAt, row.actions);
          });
          setRows(rowData);
        } else {
          setError(message);
        }
      } catch (error) {}
    };
    fetchData();
  }, []);
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <AppointmentModal open={open} onClose={handleClose} />
      <Head>
        <title>Appointments</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="false">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">Appointments</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  {/* <Button
                    color="inherit"
                    startIcon={(
                      <SvgIcon fontSize="small">
                        <ArrowUpOnSquareIcon />
                      </SvgIcon>
                    )}
                  >
                    Import
                  </Button> */}
                  {/* <Button
                    color="inherit"
                    startIcon={(
                      <SvgIcon fontSize="small">
                        <ArrowDownOnSquareIcon />
                      </SvgIcon>
                    )}
                  >
                    Export
                  </Button> */}
                </Stack>
              </Stack>
            </Stack>
            <AppointmentsSearch />
            <HassTable columns={columns} rows={rows} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
