import * as React from "react";
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import io from 'socket.io-client';
import LinearProgress from '@mui/material/LinearProgress';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import {
    Card,
    CardContent,
    Modal,
    Unstable_Grid2 as Grid,
} from "@mui/material";

import ClearIcon from '@mui/icons-material/Clear';
import { configs } from "src/config-variables";
import { useBearStore } from "src/contexts/store";


const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    height: 400,
    transform: "translate(-50%, -50%)",
    width: 650,
    bgcolor: "background.paper",
    border: "0px solid #000",
    boxShadow: 94,
    borderRadius: 1,
    p: 4,
};


export default function AddModal({ open, onClose }) {
    const [dateTime, setDateTime] = React.useState("");
    const [specialization, setSpecialization] = React.useState(null);
    const [note, setNotes] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [doctor, setDoctor] = React.useState(null);
    const token = useBearStore((state) => state.token);
    const [socket, setSocket] = React.useState(null); // State for Socket.IO instance

  // Initialize Socket.IO connection when component mounts
  React.useEffect(() => {
    const newSocket = io(configs.baseSocket); // Replace with your Socket.IO server URL
    setSocket(newSocket);
    return () => newSocket.close(); // Close socket connection when component unmounts
  }, []);
//   React.useEffect(() => {
//     if (socket) {
//       console.log("listeneing on new event")
//       socket.on('abc', (data) => {
//         console.log('add modal:', data);
//       });
//     }
//   }, [socket]);


    function convertDateTimeFormat(dateTimeString) {
        const regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
        const match = dateTimeString.match(regex);

        if (match) {
            const [_, year, month, day, hour, minute] = match;
            return `${year}-${month}-${day} ${hour}:${minute}:00`;
        } else {
            // Handle the case where the input format doesn't match
            return "Invalid date time format";
        }
    }

    const [activeStep, setActiveStep] = React.useState(0);
    const steps = [
        {
            label: 'Symptoms or Condition',
            component: <TextField onChange={(e) => setNotes(e.target.value)} fullWidth multiline rows={3} id="outlined-basic" label="Reason symptoms" variant="outlined" />,
        },
        {
            label: 'Select Date time',
            component: <TextField value={dateTime} onChange={(e) => setDateTime(convertDateTimeFormat(e.target.value))} size="small" id="outlined-basic" type="datetime-local" variant="outlined" />,
        },
        {
            label: 'Summary',
            component: (
                <Box>
                    <Typography variant="body1">
                        <strong>Doctor:</strong> {doctor?.fullName || "Not provided"}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Specialization:</strong> {doctor?.department || "Not provided"}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Date:</strong> {dateTime || "Not provided"}
                    </Typography>
                    {/* <Typography variant="body1">
                        <strong>Note:</strong> {note || "Not provided"}
                    </Typography> */}
                </Box>
            ),
        },
    ];

    const handleNext = () => {
        if (activeStep == 0) {
            setLoading(true)
            fetch(`${configs.baseUrl}/gemini/recommend`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: note })
            }).then(res => res.json()).
                then(data => {
                    if (data.ok) {
                        if (data.data == "no match found") {
                            setLoading(false);
                            alert("You need to be more specific");
                            return
                        }
                        setSpecialization(data.data && data.data);
                        setActiveStep((prevActiveStep) => prevActiveStep + 1);
                        setLoading(false)
                        return
                    } else {
                        setLoading(false)
                        alert(data.message);
                        return
                    }
                }).catch(err => alert(err.message));
            return
        } else if (activeStep == 1) {
            if (dateTime) {
                setLoading(true)
                fetch(`${configs.baseUrl}/appointment/recommendation`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ specialization: specialization, start: dateTime, })
                }).then(res => res.json()).
                    then(data => {
                        if (data.ok) {
                            if (!data.data) {
                                alert("No Matching specialist found")
                                return
                            }
                            setDoctor(data.data && data.data);
                            setActiveStep((prevActiveStep) => prevActiveStep + 1);
                            setLoading(false);
                            return
                        } else {
                            setLoading(false);
                            alert(data.message);
                            return
                        }
                    }).catch(err => alert(err.message));
            } else {
                alert("please select a valid date time");
                return
            }

            return
        } else {
            if (dateTime && doctor) {
                setLoading(true)
                fetch(`${configs.baseUrl}/appointment`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer "+token
                    },
                    body: JSON.stringify({
                        "doctorId": doctor?._id,
                        "doctor": doctor?._id,
                        "start": dateTime,
                        "purpose": note,
                    })
                }).then(res => res.json()).
                    then(data => {
                        if (data.ok) {
                        setLoading(false);
                        window.open('https://buy.stripe.com/test_00gdUc89eb8g6Ck6oo', '_newtab');
                        onClose();
                        setActiveStep(0)
                        setDoctor(null)
                        setDateTime(null)
                        setNotes(null)
                        setSpecialization(null)
                        } else {
                            setLoading(false);
                            alert(data.message);
                        }
                    }).catch(err => alert(err.message));
            } else {
                alert("please select a valid date time")
                return
            }

            return
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    React.useEffect(() => {
        return () => {
            setActiveStep(0)
            setDoctor(null)
            setDateTime(null)
            setNotes(null)
            setSpecialization(null)

        }
    }, [])

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            disableEnforceFocus
        >
            <Card sx={style}>
                <CardContent sx={{
                    pt: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                }}>
                 
                    <ClearIcon sx={{ position: 'absolute', top: 5, right: 5, cursor: 'pointer' }} onClick={onClose} />
                    <Stepper sx={{ width: "100%" }} activeStep={activeStep} orientation="vertical">
                        {steps.map((step, index) => (
                            <Step key={step.label}>
                                <StepLabel>
                                    {step.label}
                                </StepLabel>
                                <StepContent>
                                    {step.component}
                                    <Box sx={{ mb: 2 }}>
                                        <div>
                                            <Button
                                                variant="contained"
                                                onClick={handleNext}
                                                sx={{ mt: 1, mr: 1 }}
                                                disabled={loading}
                                            >
                                                {index === steps.length - 1 ? 'Schedule' : 'Continue'}
                                            </Button>
                                            <Button
                                                disabled={index === 0}
                                                onClick={handleBack}
                                                sx={{ mt: 1, mr: 1 }}
                                            >
                                                Back
                                            </Button>
                                        </div>
                                    </Box>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                    <Box sx={{ width: '100%' }}>
                        {loading && <LinearProgress />}
                    </Box>
                </CardContent>
            </Card>
        </Modal>
    );
}
