const express = require("express");
const DoctorsController = require("../controller/doctor.controller");
const { verifyToken } = require("../middleware/auth.middleware");

module.exports = () => {
  const api = new express.Router();

  api.post("/", verifyToken, async (req, res) => {
    try {
      let body = req.body;
      body.authId = req.user?.id || null
      body.email = req.user?.email || null
      const { ok, data, message } = await DoctorsController.registerDoctor(body);
      if (ok) {
        res.status(201).json({ ok, data });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });
  api.get("/profile", verifyToken, async (req, res) => {
    try {
      const id = req.user.id;
      const { ok, data, message } = await DoctorsController.getDoctor(id);
      if (ok) {
        res.status(200).json({ ok, data });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });
  api.get("/", async (req, res) => {
    try {
      const { ok, data, message } = await DoctorsController.gellAllDoctors();
      if (ok) {
        res.status(200).json({ ok, data });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });
  api.get("/available", async (req, res) => {
    try {
      let { day, start, end } = req.query;
      console.log({ day, start, end });
      const { ok, data, message } =
        await DoctorsController.getFreeDocsWithinTime(day, start, end);
      if (ok) {
        res.status(200).json({ ok, data });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });
  api.get("/:id", async (req, res) => {
    try {
      let id = req.params.id;
      const { ok, data, message } = await DoctorsController.getSingleDoctor(id);
      if (ok) {
        res.status(200).json({ ok, data });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });
  api.put("/:id", async (req, res) => {
    try {
      let id = req.params.id;
      let body = req.body;
      const { ok, data, message } = await DoctorsController.updateDoctor(
        id,
        body
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
  api.delete("/:id", async (req, res) => {
    try {
      let id = req.params.id;
      const { ok, data, message } = await DoctorsController.deleteDoctor(id);
      if (ok) {
        res.status(200).json({ ok, data });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  return api;
};
