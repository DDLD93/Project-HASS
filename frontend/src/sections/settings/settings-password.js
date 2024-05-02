import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { configs } from "src/config-variables";
import { useBearStore } from "src/contexts/store";

export const SettingsPassword = () => {
  const token = useBearStore((state) => state.token);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [values, setValues] = useState({
    password: "",
    confirm: "",
  });

  const handleChange = useCallback((event) => {
    setValues((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      console.log(values);

      if (values.password !== values.confirm) {
        setError("Passwords do not match");
        return;
      }

      try {
        const response = await fetch(`${configs.baseUrl}/auth/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ password: values.password }),
        });
        const { ok, data, message } = await response.json();
        if (ok) {
          setSuccess("Password changed successfully");
        } else {
          setError(message || "Failed to change password");
        }
      } catch (error) {
        setError("An error occurred while processing your request");
      }
    },
    [values]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="Update password" title="Password" />
        <Divider />
        <CardContent>
          {success && (
            <Typography color="success" gutterBottom>
              {success}
            </Typography>
          )}
          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}
          <Stack spacing={3} sx={{ maxWidth: 400 }}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              onChange={handleChange}
              type="password"
              value={values.password}
            />
            <TextField
              fullWidth
              label="Password (Confirm)"
              name="confirm"
              onChange={handleChange}
              type="password"
              value={values.confirm}
              error={error !== ""}
              helperText={error}
            />
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button variant="contained" type="submit">
            Update
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};
