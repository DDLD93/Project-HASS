import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Box, Button, Checkbox, Divider, Link, Stack, TextField, Typography } from "@mui/material";
import { Layout as AuthLayout } from "src/layouts/auth/layout";

import { configs } from "src/config-variables";

const Page = () => {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      email: "",
      name: "",
      password: "",
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Must be a valid email").max(255).required("Email is required"),
      password: Yup.string().max(255).required("Password is required"),
    }),
    onSubmit: async (values, helpers) => {
      let { email, password } = values;
      try {
        const response = await axios.post(`${configs.baseUrl}/auth/register`, {
          email,
          password,
        });
        if (response.status === 200) {
          console.log("Register successful:", response.data);
          const { ok, data, message } = response.data;
          alert(message);
          router.push("/auth/login");
        } else {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: "Unexpected status code:" + response.status });
          helpers.setSubmitting(false);
        }
      } catch (err) {
        if (err.response) {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.response.data.message });
          helpers.setSubmitting(false);
        } else if (err.request) {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: "No response from server" });
          helpers.setSubmitting(false);
        } else {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: "Error:" + err.message });
          helpers.setSubmitting(false);
        }
      }
    },
  });

  return (
    <>
      <Head>
        <title>Register | HASS</title>
      </Head>
      <Box
        sx={{
          flex: "1 1 auto",
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            maxWidth: 550,
            px: 3,
            py: "100px",
            width: "100%",
          }}
        >
          <div>
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="h4">Register</Typography>
              <Typography color="text.secondary" variant="body2">
                Already have an account? &nbsp;
                <Link component={NextLink} href="/auth/login" underline="hover" variant="subtitle2">
                  Log in
                </Link>
              </Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  error={!!(formik.touched.email && formik.errors.email)}
                  fullWidth
                  helperText={formik.touched.email && formik.errors.email}
                  label="Email Address"
                  name="email"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="email"
                  value={formik.values.email}
                />
                <TextField
                  error={!!(formik.touched.password && formik.errors.password)}
                  fullWidth
                  helperText={formik.touched.password && formik.errors.password}
                  label="Password"
                  name="password"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.password}
                />
              </Stack>
              {formik.errors.submit && (
                <Typography color="error" sx={{ mt: 3 }} variant="body2">
                  {formik.errors.submit}
                </Typography>
              )}
              <Button fullWidth size="large" sx={{ mt: 3 }} type="submit" variant="contained">
                Continue
              </Button>
            </form>
          </div>
        </Box>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;


