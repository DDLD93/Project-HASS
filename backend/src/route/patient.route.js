const express = require("express");
const PatientsController = require("../controller/patient.controller");
const {verifyToken} = require("../middleware/auth.middleware");

module.exports = () => {
    const api = new express.Router();


    api.post("/",verifyToken, async (req, res) => {
        try {
            let body = req.body;
            body.authId = req.user?.id || null
            body.email = req.user?.email || null
            const { ok, data, message } = await PatientsController.registerPatient(body);
            if (ok) {
                res.status(201).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });
    api.get("/profile", verifyToken, async (req, res) => {
        try {
            const id = req.user.id
            const { ok, data, message } = await PatientsController.getPatient(id);
            if (ok) {
                res.status(200).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });
    
    api.get("/", async (req, res) => {
        try {
            const { ok, data, message } = await PatientsController.gellAllPatients();
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
            const { ok, data, message } = await PatientsController.getSinglePatient(id);
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
            const { ok, data, message } = await PatientsController.updatePatient(id, body);
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
            const { ok, data, message } = await PatientsController.deletePatient(id);
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