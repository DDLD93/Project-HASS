import * as React from "react";
import { useState } from "react";

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
  Typography,
} from "@mui/material";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import LinearProgress from '@mui/material/LinearProgress';
import { TransitionGroup } from 'react-transition-group';



import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';





import { useFormik } from "formik";
import axios from "axios";
import { configs } from "src/config-variables";
import { useBearStore } from "src/contexts/store";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from "next/router";
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

export default function ProfileSetup() {
  const [role, setRole] = React.useState("");
  const logout = useBearStore((state) => state.logout);
 
  return (
    <Modal
      open={true}
      // onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      disableEnforceFocus
    >
      <Box sx={style}>
      <TransitionGroup >
        <Grid height={"100%"} container spacing={1.5}>
          <Grid display={"flex"} justifyContent={"space-between"} xs={12} md={12} lg={12}>
            <ArrowBackIcon onClick={() => setRole("")} />
            <PowerSettingsNewIcon sx={{ color: "red", ":hover": "pointer" }} onClick={logout} />
          </Grid>

          {role == "" && (<Grid height={"80%"} display={"flex"} justifyContent={"center"} flexDirection={"column"} gap={3} xs={12} md={12} lg={12}>

            <Button onClick={() => setRole("patient")} variant="outlined">
              <Grid>
                <Typography m={1} variant="h3">
                  Patient
                </Typography>
                <Typography variant="caption">
                  Setup to book a specialist appointment for personalized care
                </Typography>
              </Grid>
            </Button>

            <Button onClick={() => setRole("doctor")} variant="outlined">
              <Grid>
                <Typography m={2} variant="h3">
                  Doctor
                </Typography>
                <Typography variant="caption">
                  Setup as a specialist to connect with patients seeking your specialized skills.
                </Typography>
              </Grid>
            </Button>


          </Grid>)}
          {role == "doctor" && <Doctor />}
          {role == "patient" && <Patient />}
        </Grid>
      </TransitionGroup>
      </Box>
    </Modal>
  );
}

function Doctor() {
  const [loading, setLoading] = useState(false);
  const { token ,login} = useBearStore();
  const router = useRouter();
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };
  const specializations = ["Cardiologist",
  "Gastroenterologist",
  "Neurologist",
  "Oncologist",
  "Pediatrician",
  "Psychiatrist",
  "Surgeon",
  "Urologist",
  "Endocrinologist",
  "Dermatologist",
  "Allergist",
  "Anesthesiologist",
  "Hematologist",
  "Nephrologist",
  "Ophthalmologist",
  "Orthopedic Surgeon",
  "Otolaryngologist",
  "Pathologist",
  "Pulmonologist",
  "Radiologist",
  "Rheumatologist",
  "Cardiothoracic Surgeon",
  "Dentist",
  "Gynecologist",
  "Hepatologist",
  "Osteopath",
  "Plastic Surgeon",
  "Podiatrist",
  "Thoracic Surgeon",
  "Vascular Surgeon"];
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      department: "",
      specialization: [],
      contactNumber: "",
      email: "",
      // workingHours: "",
      // availability: [],
      // averageRating: "",
      // ratingsCount: "",

      submit: null,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().max(255).required("First Name is required"),
      lastName: Yup.string().max(255).required("Last Name is required"),
      department: Yup.string().max(50).required("Department is required"),
      specialization: Yup.array().required("Specialization is required"),
      contactNumber: Yup.string().required("Phone is required"),
      // contactNumber: Yup.string().matches(/^\+(44)?[7-9]\d{9}$/, {
      //   message: "Invalid British phone number format (+447123456789)",
      // }).required("Phone is required"),
      email: Yup.string().email("Must be a valid email").max(255).required("Email is required"),
      // workingHours: Yup.string().max(50).required("working Hours is required"),
      // availability: Yup.string().max(50).required("availability is required"),
      // averageRating: Yup.number().max(12).required("averageRating is required"),
      // ratingsCount: Yup.number().required("ratingsCount is required")
    }),
    onSubmit: async (values, helpers) => {
      // console.log("helpers", helpers);
      // sendRequest("/user/profile", "PUT", { ...values })
      // let { email, password } = values;
      setLoading(true);

      try {
        helpers.setSubmitting(true);
        const response = await axios.post(
          `${configs.baseUrl}/doctor`,
          { ...values },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("response>>", response);
        if (response.status === 201) {
          // Successful login
          setLoading(false);
          console.log("profile setup successful:", response.data);
          const { user, token } = response.data.data
          console.log({user,token})
          login(user, token);
          router.push("/");
        } else {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: "Unexpected status code:" + response.status });
          helpers.setSubmitting(false);
          setLoading(false);
        }
      } catch (err) {
        if (err.response) {
          // The request was made, but the server responded with a status code other than 2xx
          // console.log(err.response)
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.response.data.message });
          helpers.setSubmitting(false);
          setLoading(false);
        } else if (err.request) {
          // The request was made, but there was no response from the server
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: "No response from server" });
          helpers.setSubmitting(false);
          setLoading(false);
        } else {
          // Something else went wrong
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: "Error:" + err.message });
          helpers.setSubmitting(false);
          setLoading(false);
        }
      }
    },
  });
  return (
    <Grid xs={12} md={12} lg={12}>
      <form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
        <Card>
          <CardHeader subheader="The information can be edited" title="Profile" />
          <CardContent sx={{ pt: 0 }}>
            <Box sx={{ m: -1.5 }}>
              <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First name"
                    name="firstName"
                    required
                    error={!!(formik.touched.firstName && formik.errors.firstName)}
                    helperText={formik.touched.firstName && formik.errors.firstName}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.firstName}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last name"
                    name="lastName"
                    required
                    error={!!(formik.touched.lastName && formik.errors.lastName)}
                    helperText={formik.touched.lastName && formik.errors.lastName}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.lastName}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl fullWidth error={!!(formik.touched.department && formik.errors.department)}>
                    <InputLabel id="demo-select-small-label">Department</InputLabel>
                    <Select
                      labelId="demo-select-small-label"
                      id="demo-select-small"
                      name="department"
                      value={formik.values.department}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Department"
                    >
                      <MenuItem value="">Select Department</MenuItem>
                      <MenuItem value="Cardiology">Cardiology</MenuItem>
                      <MenuItem value="Neurology">Neurology</MenuItem>
                      <MenuItem value="Orthopedics">Orthopedics</MenuItem>
                      {/* Add more realistic department options as needed */}
                    </Select>
                    {formik.touched.department && formik.errors.department && (
                      <FormHelperText>{formik.errors.department}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl fullWidth error={!!(formik.touched.specialization && formik.errors.specialization)}>
                    <InputLabel id="demo-multiple-checkbox-label">Specialization</InputLabel>
                    <Select
                      labelId="demo-multiple-checkbox-label"
                      id="demo-multiple-checkbox"
                      multiple
                      name="specialization" // Add the name attribute to bind to Formik state
                      value={formik.values.specialization}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      input={<OutlinedInput label="Specialization" />}
                      renderValue={(selected) => selected.join(', ')}
                      MenuProps={MenuProps}
                    >
                      {specializations.map((specialization) => (
                        <MenuItem key={specialization} value={specialization}>
                          <Checkbox checked={formik.values.specialization.indexOf(specialization) > -1} />
                          <ListItemText primary={specialization} />
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.specialization && formik.errors.specialization && (
                      <FormHelperText>{formik.errors.specialization}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    name="contactNumber"
                    type="tel"
                    required
                    error={!!(formik.touched.contactNumber && formik.errors.contactNumber)}
                    helperText={formik.touched.contactNumber && formik.errors.contactNumber}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.contactNumber}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    required
                    type="email"
                    error={!!(formik.touched.email && formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.email}
                  />
                </Grid>
              </Grid>
            </Box>
            {formik.errors.submit && (
              <Typography color="error" sx={{ mt: 3 }} variant="body2">
                {formik.errors.submit}
              </Typography>
            )}
          </CardContent>
          {loading && <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>}
          <Divider />
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button disabled={loading} variant="contained" type="submit">
              Save details
            </Button>
          </CardActions>
        </Card>
      </form>
    </Grid>
  );
}

function Patient() {
  const [loading, setLoading] = useState(false)
  const { token ,login} = useBearStore();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      contactNumber: "",
      // email: "",
      address: "",
      medicalHistory: "",
      submit: null,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().max(255).required("first Name is required"),
      lastName: Yup.string().max(255).required("last Name is required"),

      dateOfBirth: Yup.date().required("Date of Birth is required"),
      gender: Yup.string().oneOf(['male', 'female']).required("Gender is required"),
      contactNumber: Yup.string().max(15, "invalid phone").required("Phone is required"),
      // email: Yup.string().email("Must be a valid email").max(255).required("Email is required"),
      address: Yup.string().max(255).required("address required"),
      medicalHistory: Yup.string().max(50).required("medicalHistory is required"),
      // specialization: Yup.string().max(20).required("Specialization is required"),
    }),
    onSubmit: async (values, helpers) => {
      console.log("values", values);
      setLoading(true);
      try {
        helpers.setSubmitting(true);
        const response = await axios.post(
          `${configs.baseUrl}/patient`,
          { ...values },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("response>>", response);
        if (response.status === 201) {
          console.log("profile setup successful:", response.data);
          setLoading(false);
          const { user, token } = response.data.data;
          login(user, token);
          router.push("/");
          // alert("Success!!! please log back in again");
        } else {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: "Unexpected status code:" + response.status });
          helpers.setSubmitting(false);
          setLoading(false);
        }
      } catch (err) {
        if (err.response) {
          // The request was made, but the server responded with a status code other than 2xx
          // console.log(err.response)
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.response.data.message });
          helpers.setSubmitting(false);
          setLoading(false);
        } else if (err.request) {
          // The request was made, but there was no response from the server
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: "No response from server" });
          helpers.setSubmitting(false);
          setLoading(false);

        } else {
          // Something else went wrong
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: "Error:" + err.message });
          helpers.setSubmitting(false);
          setLoading(false);

        }
      }
    },
  });
  return (
    <Grid xs={12} md={12} lg={12}>
      <form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
        <Card>
          <CardHeader subheader="The information can be edited" title="Profile" />
          <CardContent sx={{ pt: 0 }}>
            <Box sx={{ m: -1.5 }}>
              <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First name"
                    name="firstName"
                    required
                    error={!!(formik.touched.firstName && formik.errors.firstName)}
                    helperText={formik.touched.firstName && formik.errors.firstName}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.firstName}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last name"
                    name="lastName"
                    required
                    error={!!(formik.touched.lastName && formik.errors.lastName)}
                    helperText={formik.touched.lastName && formik.errors.lastName}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.lastName}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl
                    component="fieldset"
                    error={!!formik.errors.gender}
                  >
                    <FormLabel component="legend">Gender</FormLabel>
                    <RadioGroup
                      aria-label="gender"
                      name="gender"
                      value={formik.values.gender}
                      onChange={formik.handleChange}
                    >
                      <FormControlLabel value="female" control={<Radio />} label="Female" />
                      <FormControlLabel value="male" control={<Radio />} label="Male" />
                    </RadioGroup>
                    {formik.errors.gender && ( // If there's an error for gender, display it
                      <FormHelperText>{formik.errors.gender}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    name="contactNumber"
                    required
                    error={!!(formik.touched.contactNumber && formik.errors.contactNumber)}
                    helperText={formik.touched.contactNumber && formik.errors.contactNumber}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.contactNumber}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    // label="Date of birth"
                    name="dateOfBirth"
                    required
                    error={!!(formik.touched.dateOfBirth && formik.errors.dateOfBirth)}
                    helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.dateOfBirth}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    required
                    error={!!(formik.touched.address && formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.address}
                  />
                </Grid>
                <Grid xs={12} md={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Medical History"
                    name="medicalHistory"
                    required
                    error={!!(formik.touched.medicalHistory && formik.errors.medicalHistory)}
                    helperText={formik.touched.medicalHistory && formik.errors.medicalHistory}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.medicalHistory}
                  />
                </Grid>
              </Grid>
            </Box>
            {formik.errors.submit && (
              <Typography color="error" sx={{ mt: 3 }} variant="body2">
                error:{formik.errors.submit}
              </Typography>
            )}
          </CardContent>
          {loading && <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>}
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
