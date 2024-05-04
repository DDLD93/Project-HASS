import { useEffect, useState } from "react";
import Head from "next/head";
import { subDays, subHours } from "date-fns";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import { Box, Button, Container, Stack, SvgIcon, Typography } from "@mui/material";
import { useSelection } from "src/hooks/use-selection";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { AccountTable } from "src/sections/account/accounts-table";
import { AccountSearch } from "src/sections/account/accounts-search";
import { applyPagination } from "src/utils/apply-pagination";
import AccountModal from "src/sections/account/account-modal";
import HassTable from "src/components/generic-table";
import { configs } from "src/config-variables";
import { useRouter } from "next/router";

const now = new Date();

const columns = [
  { id: "user", label: "User" },
  { id: "email", label: "Email" },
  { id: "userType", label: "User Type" },
  { id: "phone", label: "Phone" },
  { id: "status", label: "Status" },
  { id: 'actions', label: 'Actions' }
];
function createData(id,user, email, userType, phone, status) {
  return {
    id,
    user,
    email,
    userType,
    phone,
    status,
    actions:"actions"
  };
}

const Page = () => {
  const [error, setError] = useState("");
  const router = useRouter();
  const [reFectch, setReFectch] = useState(true)
  useEffect(() => {
    const fetchData = async (query) => {
      try {
        const response = await fetch(`${configs.baseUrl}/auth/users`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        const { ok, data, message } = result;
        if (ok) {
          const rowData = data.map((row) =>
            createData(
              row.authId._id,
              row.fullName,
              row.email,
              row.authId.role,
              row.contactNumber,
              row.authId.status
            )
          );
          setRows(rowData);
        } else {
          setError(message);
        }
      } catch (error) {
        setError(error.message);
      }
    };

    const { query } = router.query;

    if (query) {
      fetchData(query);
    } else {
      fetchData("");
    }
  }, [reFectch]);

  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  // useEffect(() => {
  //   const query = "patient" || "";
  //   fetchData(query);
  // }, [searchParams]);
  return (
    <>
      <AccountModal open={open} onClose={handleClose} />
      <Head>
        <title>Accounts</title>
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
                <Typography variant="h4">Accounts</Typography>
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
            <AccountSearch />
            <HassTable columns={columns} rows={rows} setReFectch={setReFectch}/>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
