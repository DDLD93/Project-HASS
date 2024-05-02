const express = require("express");
const AppointmentsController = require("../controller/appointment.controller");
const { verifyToken } = require("../middleware/auth.middleware");


module.exports = () => {
    const api = new express.Router();

    api.post("/", verifyToken, async (req, res) => {
        try {
            let body = req.body;
            body.patientId = req.user.id;
            const { ok, data, message } = await AppointmentsController.setAppointment(body);
            if (ok) {
                res.status(200).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });

    api.post("/recommendation", async (req, res) => {
        try {
            let body = req.body;
            const { ok, data, message } = await AppointmentsController.getAvailableDoctors(body);
            if (ok) {
                res.status(200).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });

    api.get("/",verifyToken, async (req, res) => {
        try {
            const id = req.user.id
            const { ok, data, message } = await AppointmentsController.gellAllAppointments(id);
            if (ok) {
                res.status(200).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });
    api.get("/all", async (req, res) => {
        try {
            const { ok, data, message } = await AppointmentsController.fecthAllAppointments();
            if (ok) {
                res.status(200).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });


    api.get("/doctor/", async (req, res) => {
        try {
            const id = req.query.id;
            const { ok, data, message } = await AppointmentsController.singleDoctorAptmts(id);
            if (ok) {
                res.status(200).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });


    api.get("/patient", async (req, res) => {
        try {
            const id = req.query.id;
            const { ok, data, message } = await AppointmentsController.singlePatientAptmts(id);
            if (ok) {
                res.status(200).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });

    api.get("/:id", async (req, res) => {
        try {
            let id = req.params.id;
            const { ok, data, message } = await AppointmentsController.getSingleAppointment(id);
            if (ok) {
                res.status(200).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });
    api.put("/:id", async (req, res) => {
        try {
            let id = req.params.id;
            let body = req.body;
            const { ok, data, message } = await AppointmentsController.updateAppointment(id, body);
            if (ok) {
                res.status(200).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });
    api.delete("/:id", async (req, res) => {
        try {
            let id = req.params.id;
            const { ok, data, message } = await AppointmentsController.deleteAppointment(id);
            if (ok) {
                res.status(200).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });

    return api;
}