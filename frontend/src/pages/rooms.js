import { useState, useEffect } from "react";
import Head from "next/head";
import { subDays, subHours } from "date-fns";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import { Box, Button, Container, Stack, SvgIcon, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { RoomSearch } from "src/sections/rooms/room-search";
import RoomModal from "src/sections/rooms/room-modal";
import useDataFetching from "src/hooks/use-fetch";
import { configs } from "src/config-variables";
import HassTable from "src/components/generic-table";
import { useRouter } from "next/router";
import HassTableRoom from "src/components/generic-table-rooms";
function createData(id, number, type, bookings, status) {
  return {
    id,
    number,
    type,
    bookings,
    status,
    actions: "actions"
  };
}

const columns = [
  { id: "number", label: "Number", minWidth: 170 },
  { id: "type", label: "Room Type", minWidth: 100 },
  {
    id: "bookings",
    label: "Appointments",
    minWidth: 170,
    // align: 'right',
    format: (value) => value.length,
  },
  { id: "status", label: "Status", minWidth: 170 },
  { id: "actions", label: "Actions", minWidth: 170 },

];

const Page = () => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [reFectch, setReFectch] = useState(true)

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${configs.baseUrl}/room`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        const { ok, data, message } = result;
        if (ok) {
          const rowData = data.map((row) => {
            return createData(row._id, row.number, row.type, row.bookings.length, row.status);
          });
          setRows(rowData);
        } else {
          setError(message);
        }
      } catch (error) {
        setError(error.message);
      }
    };
      fetchData();
  }, [reFectch]);

  return (
    <>
      <RoomModal open={open} onClose={handleClose} setReFectch={setReFectch} />
      <Head>
        <title>Rooms</title>
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
                <Typography variant="h4">Rooms</Typography>
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
              <div>
                <Button
                  startIcon={
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                  onClick={() => setOpen(!open)}
                >
                  Add
                </Button>
              </div>
            </Stack>
            <RoomSearch />
            <HassTableRoom columns={columns} rows={rows} setReFectch={setReFectch} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
