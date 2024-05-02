const express = require("express");
const AuthContorller = require("../controller/auth.controller");
const { domain } = require("../config");
const { verifyToken } = require("../middleware/auth.middleware");

module.exports = () => {
  const api = new express.Router();

  api.post("/register", async (req, res) => {
    try {
      let body = req.body;
      const { ok, data, message } = await AuthContorller.register(body);
      if (ok) {
        res.status(200).json({ ok, data, message });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.post("/login", async (req, res) => {
    let { email, password } = req.body;
    try {
      const { ok, data, message } = await AuthContorller.login(email, password);
      if (ok) {
        res.status(200).json({ ok, data });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.post("/login-token", async (req, res) => {
    let { token } = req.body;

    try {
      const { ok, data, message } = await AuthContorller.loginWithToken(token);
      if (ok) {
        res.status(200).json({ ok, data });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.post("/google", async (req, res) => {
    try {
      let { code } = req.body;
      const { ok, data, message } = await AuthContorller.loginWithGoogle(code);
      if (ok) {
        res.status(200).json({ ok, data, message });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.post("/reset-password", async (req, res) => {
    try {
      let { password } = req.body;
      const { ok, data, message } = await AuthContorller.resetPassword(
        token,
        password
      );
      if (ok) {
        res.status(200).json({ ok, data });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.post("/change-password", verifyToken, async (req, res) => {
    ///
    try {
      let { password } = req.body;

      const { id } = req.user;
      console.log(password, id);
      const { ok, data, message } = await AuthContorller.changeAccPassword(
        id,
        password
      );
      if (ok) {
        res.status(200).json({ ok, data });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.post("/forgot-password", async (req, res) => {
    try {
      let { email } = req.body;
      const { ok, message } = await AuthContorller.forgotPassword(email);
      if (ok) {
        res.status(200).json({ ok, message });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.get("/verify-user", async (req, res) => {
    try {
      let { token } = req.query;
      //   console.log({ tokenbackend: token });
      const { ok, data, message } = await AuthContorller.verifyEmail(token);
      const redUrl = `${domain}/verify/redirect?token=${
        ok ? data.token : ""
      }&message=${message}`;
      res.redirect(redUrl);
    } catch (error) {
      res.redirect(`${domain}/verify/redirect?message=${error.message}`);
    }
  });

  api.get("/users", async (req, res) => {
    try {
      const query = req.query.query;

      const { ok, data, message } = await AuthContorller.getUsers(query);
      if (ok) {
        res.status(200).json({ ok, message, data });
      } else {
        res.status(500).json({ ok, message, data });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  //   api.get("/verify-user", async (req, res) => {
  //     try {
  //       let { token } = req.body;
  //       const { ok, data, message } = await AuthContorller.verifyEmail(token);
  //       const redUrl = `${domain}/verify/redirect?token=${
  //         ok ? data.token : ""
  //       }&message=${message}`;
  //       res.redirect(redUrl);
  //     } catch (error) {
  //       res.redirect(`${domain}/verify/redirect?message=${error.message}`);
  //     }
  //   });

  // api.get("/callback/google", async (req, res) => {
  //     try {
  //         const { code } = req.query;
  //         console.log({ code });
  //         const { ok, data, message } = await AuthContorller.loginWithGoogle(code, "patient");
  //         res.status(200).json({ ok, data, message })

  //     } catch (error) {
  //     }
  // });

  return api;
};
