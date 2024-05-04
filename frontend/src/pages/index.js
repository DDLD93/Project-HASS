import Head from "next/head";
import { useState, useEffect } from "react";
import { Box, Button, Container, Unstable_Grid2 as Grid } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import ReviewModal from "src/components/review-modal";
import Fab from "@mui/material/Fab";
import Divider from "@mui/material/Divider";
import { faker } from "@faker-js/faker";
import { configs } from "src/config-variables";

import AddIcon from "@mui/icons-material/Add";
import AddModal from "src/components/add-modal";
import { useBearStore } from "src/contexts/store";

// const generateDummyAppointments = () => {
//   const appointments = [];
//   for (let i = 0; i < 10; i++) { // Adjust the loop to generate the desired number of appointments
//     const appointment = {
//       transactionId: faker.database.mongodbObjectId(),
//       patientId: faker.database.mongodbObjectId(),
//       doctorId: faker.database.mongodbObjectId(),
//       roomId: faker.number.int({ min: 100, max: 200 }),
//       start: faker.date.past(),
//       end: faker.date.past(),
//       purpose: faker.lorem.words(3),
//       status: faker.helpers.arrayElement(['Pending', 'Confirmed', 'Cancelled', 'Completed']),
//       notes: faker.lorem.sentence(),
//       recurrence: faker.datatype.boolean() ? {
//         frequency: faker.helpers.arrayElement(['Daily', 'Weekly', 'Monthly']),
//         endDate: faker.date.future(),
//       } : null,
//     };
//     appointments.push(appointment);
//   }
//   return appointments;
// };

// const appointments = generateDummyAppointments();

function Page() {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointment, setAppointment] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [reFetch, setreFetch] = useState(false);


  const { role } = useBearStore((state) => state.user);
  const token = useBearStore((state) => state.token);


  const handleCloseAdd = () => {
    setOpenAdd(!openAdd);
    setreFetch(state => !state)
  };
  const [openReview, setOpenReview] = useState(false);
  const handleCloseReview = () => {
    setOpenReview(!openReview);
  };
  const handleCancel = () => {
    setLoading(true);
    fetch(`${configs.baseUrl}/appointment/${selectedAppointment._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        "status": "Canceled",
      })
    }).then(res => res.json()).
      then(data => {
        if (data.ok) {
          setLoading(false);
          alert("Appointment canceled")
        } else {
          setLoading(false);
          alert(data.message);
        }
      }).catch(err => {
        alert(err.message)
        setLoading(false)
      });
  }

  useEffect(() => {
    if (selectedAppointment) {
      fetch(`${configs.baseUrl}/appointment/${selectedAppointment._id}`).then(res => res.json())
        .then(response => {
          if (response.ok) {
            setAppointment(response.data)
          } else {
            alert(response.message);
          }
        })
    }
  }, [selectedAppointment])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetch(`${configs.baseUrl}/appointment`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
        });
        if (!result) {
          throw new Error("Network response was not ok");
        }
        const response = await result.json();
        const { ok, data, message } = response;
        if (ok) {
          setAppointments(data && data);
        } else {
          alert(message);
        }
      } catch (error) {
        console.log("error");
        alert(error.message);
      }
    };
    fetchData();
  }, [reFetch]);

  return (
    <>
      <Head>
        <title>Home </title>
      </Head>
      {/* <ReviewModal  /> */}
      <AddModal open={openAdd} onClose={handleCloseAdd} setreFetch={setreFetch} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid sx={{ position: "relative" }} xs={8.4}>
              <Typography align="center" variant="h5">
                Appointments
              </Typography>
              {appointments && appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <Card
                    key={appointment._id}
                    sx={{
                      minWidth: 400,
                      margin: "16px",
                      cursor: "pointer",
                      boxShadow: "5px 10px red",
                      backgroundColor: "#f0f0f0",

                      ...(selectedAppointment &&
                        selectedAppointment._id === appointment._id
                        ? { backgroundColor: "#b6aced70" }
                        : {}),
                    }}
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <CardContent sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="h6" color="primary">
                        {appointment.purpose}
                      </Typography>
                      <Stack spacing={2}>
                        <Typography variant="body2" color="textSecondary">
                          Date:{appointment.start.toLocaleString().split(",")[0]}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Time:{appointment.start.toLocaleString().split(",")[1]}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography variant="body1">Appointments will show here</Typography>
                </Box>
              )}
              <Fab
                onClick={() => setOpenAdd(true)}
                sx={{
                  position: "fixed",
                  bottom: "1rem",
                  right: "4rem",
                  ...(role == "doctor" ? { visibility: "hidden" } : {}),
                }}
                color="secondary"
                aria-label="add"
              >
                <AddIcon />
              </Fab>
            </Grid>
            <Divider />
            <Grid xs={3.6}>
              {selectedAppointment ? (
                <Box
                  sx={{
                    minWidth: 350,
                    height: 500,
                    padding: 2,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-around",
                  }}
                >
                  <Typography variant="h5">Appointment Information</Typography>
                  <Typography variant="h6" color="primary">
                    {appointment.purpose}
                  </Typography>
                  {/* <Typography variant="body2" color="textSecondary">
                    Transaction ID: {selectedAppointment.transactionId}
                  </Typography> */}
                  <Typography variant="body2" color="textSecondary">
                    Doctor Name: {appointment?.doctorId?.fullName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Doctor Specialization: {appointment?.doctorId?.department}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Room Number: {appointment?.roomId?.number}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Start Time: {appointment?.start?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    End Time: {selectedAppointment.end.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Status: {appointment?.status}
                  </Typography>
                  {appointment.recurrence && (
                    <Typography variant="body2" color="textSecondary">
                      Recurrence Frequency: {selectedAppointment.recurrence.frequency}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={2}>
                    {/* {selectedAppointment.status === "Pending" && <Button variant="contained" sx={{ width: "35%", }}>Reschedule</Button>} */}
                    {appointment.status === "Pending" && <Button onClick={handleCancel} disabled={loading} color="error" variant="contained" fullWidth>Cancel</Button>}
                    {appointment.status === "Completed" && <ReviewModal openReview={openReview} setOpenReview={setOpenReview} Obj={selectedAppointment} />}
                  </Stack>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography variant="body1">
                    Selected appointment information will show here
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
