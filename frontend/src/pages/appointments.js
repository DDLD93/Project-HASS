import { useEffect, useState } from "react";
import Head from "next/head";
import { Box, Button, Container, Stack, SvgIcon, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { AppointmentsSearch } from "src/sections/appointments/appointments-search";
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Card, InputAdornment, OutlinedInput } from '@mui/material';
import AppointmentModal from "src/sections/appointments/appointments-modal";
import { configs } from "src/config-variables";
import HassTableAptm from "src/components/generic-table-aptm";
import { fi } from "date-fns/locale";

function createData(patient, doctor, room, time, status) {
  return {
    patient,
    doctor,
    room,
    time,
    status,
    actions: "",
  };
}

const columns = [
  { id: "patient", label: "Patient" },
  { id: "doctor", label: "Doctor" },
  { id: "room", label: "Room" },
  { id: "time", label: "Time" },
  { id: "status", label: "Status" },
];

const Page = () => {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [filteredRows, setFilteredRows] = useState([])
  const [filter, setfilter] = useState("")
  useEffect(() => {
    setFilteredRows(rows)
    const filterRows = () => {
      const filteredRows = rows.filter((row) => {
        const doctorName = row?.doctor?.toLowerCase();
        const patientName = row?.patient?.toLowerCase();
        const roomNumber = row?.room?.toString().toLowerCase();
        const searchQuery = filter.toLowerCase();
        return (
          doctorName.includes(searchQuery) ||
          patientName.includes(searchQuery) ||
          roomNumber.includes(searchQuery)
        );
      });
      setFilteredRows(filteredRows);
    };

    filterRows(); // Initial filter

    return () => setFilteredRows(rows); // Reset filter when component unmounts
  }, [filter, rows]);

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
          const rowDatas = data.map((row) => {
            return createData(row?.patientId?.fullName, row.doctorId.fullName, row.roomId.number, row.start, row.status);
          });
          setRows(rowDatas);
          console.log({ rowDatas })
        } else {
          setError(message);
        }
      } catch (error) { }
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
            {/* search bar */}
            <Card sx={{ p: 2 }}>
              <OutlinedInput
                defaultValue=""
                fullWidth
                placeholder="Search Appointment"
                onChange={(e) => setfilter(e.target.value)}
                startAdornment={(
                  <InputAdornment position="start">
                    <SvgIcon
                      color="action"
                      fontSize="small"
                    >
                      <MagnifyingGlassIcon />
                    </SvgIcon>
                  </InputAdornment>
                )}
                sx={{ maxWidth: 500 }}
              />
            </Card>
            <HassTableAptm columns={columns} rows={filteredRows || rows} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
