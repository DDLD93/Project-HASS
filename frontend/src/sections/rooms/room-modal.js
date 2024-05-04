import * as React from "react";
import * as Yup from "yup";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Divider,
    TextField,
    Modal,
    Unstable_Grid2 as Grid,
    Typography, MenuItem, Select, InputLabel, FormHelperText
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';

import { useFormik } from "formik";
// import axios from "axios";
import { configs } from "src/config-variables";
// import { useBearStore } from "src/contexts/store";
// import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    // height: 600,
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    border: "0px solid #000",
    boxShadow: 94,
    borderRadius: 1,
    p: 4,
};
const roomTypes = [
    { name: "Consultation", value: "consultation" },
    { name: "Specialist Consultation", value: "Specialist Consultation" },
    { name: "Post-Consultation Rooms", value: "Post-Consultation " },

]
export default function RoomModal({ open, onClose, setReFectch }) {
    // const logout = useBearStore((state) => state.logout);

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            disableEnforceFocus
        >
            <Box sx={style}>
                <Grid height={"100%"} container spacing={1.5}>
                    <Grid display={"flex"} justifyContent={"space-between"} xs={12} md={12} lg={12}>
                        <ClearIcon sx={{ color: "red", ":hover": "pointer" }} onClick={onClose} />
                    </Grid>
                    {<Form
                        close={onClose}
                        setReFectch={setReFectch}
                    />}
                </Grid>
            </Box>
        </Modal>
    );
}

function Form({ close,setReFectch }) {
    const formik = useFormik({
        initialValues: {
            roomNumber: "",
            roomType: "",
            submit: null,
        },
        validationSchema: Yup.object({
            roomNumber: Yup.string().max(5).required("Room Number is required"),
            roomType: Yup.string().required("Room Type is required").max(255),

        }),
        onSubmit: async (values, helpers) => {
            console.log("helpers", helpers);
            try {
                helpers.setSubmitting(true);
                const data = await fetch(`${configs.baseUrl}/room`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        number: values.roomNumber,
                        type: values.roomType
                    })
                });
                console.log("data", data);

                let response = await data.json()

                if (data.status === 200) {
                    window.alert("Room was registered Successfully")
                    setReFectch(state => !state)
                    setTimeout(() => {
                        close()
                    }, 1000);
                } else {
                    helpers.setStatus({ success: false });
                    helpers.setErrors({ submit: "Unexpected status code:" + response.status });
                    helpers.setSubmitting(false);
                }
            } catch (err) {
                if (err.response) {
                    // The request was made, but the server responded with a status code other than 2xx
                    // console.log(err.response)
                    helpers.setStatus({ success: false });
                    helpers.setErrors({ submit: err.response.data.message });
                    helpers.setSubmitting(false);
                } else if (err.request) {
                    // The request was made, but there was no response from the server
                    helpers.setStatus({ success: false });
                    helpers.setErrors({ submit: "No response from server" });
                    helpers.setSubmitting(false);
                } else {
                    // Something else went wrong
                    helpers.setStatus({ success: false });
                    helpers.setErrors({ submit: "Error:" + err.message });
                    helpers.setSubmitting(false);
                }
            }
        },
    });
    return (
        <Grid xs={12} md={12} lg={12}>
            <form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
                <Card>
                    <CardHeader subheader="" title="Registering Rooms" />
                    <CardContent sx={{ pt: 0 }}>
                        <Box sx={{ m: -1.5 }}>
                            <Grid container spacing={3}>
                                <Grid xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Room Number"
                                        name="roomNumber"
                                        required
                                        error={!!(formik.touched.roomNumber && formik.errors.roomNumber)}
                                        helperText={formik.touched.roomNumber && formik.errors.roomNumber}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.roomNumber}
                                    />

                                </Grid>
                                <Grid xs={12} md={6}>
                                    {/* <TextField
                                        fullWidth
                                        label="Room Type"
                                        name="roomType"
                                        required
                                        error={!!(formik.touched.roomType && formik.errors.roomType)}
                                        helperText={formik.touched.roomType && formik.errors.roomType}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.roomType}
                                    /> */}

                                    <Select
                                        labelId="room-type-label"
                                        id="roomType"
                                        label="Room Type"
                                        name="roomType"
                                        fullWidth
                                        error={!!(formik.touched.roomType && formik.errors.roomType)}
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        value={formik.values.roomType}
                                    >
                                        {roomTypes.map((item, idx) => (
                                            <MenuItem key={idx} value={item.value}>{item.name}</MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>Please Select The Room Type</FormHelperText>
                                </Grid>
                            </Grid>
                        </Box>
                        {formik.errors.submit && (
                            <Typography color="error" sx={{ mt: 3 }} variant="body2">
                                {formik.errors.submit}
                            </Typography>
                        )}
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: "flex-end" }}>
                        <Button variant="contained" type="submit">
                            Save details
                        </Button>
                    </CardActions>
                </Card>
            </form>
        </Grid>

    );
}