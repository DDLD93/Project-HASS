const express = require("express");
const ReviewController = require("../controller/review.controller")

module.exports = () => {
    const api = new express.Router();


    api.post("/", async (req, res) => {
        try {
            let body = req.body;
            const { ok, data, message } = await ReviewController.setReview(body);
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
            const { ok, data, message } = await ReviewController.gellAllReviews();
            if (ok) {
                res.status(200).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });

    api.get("/doctors/:doctorId", async (req, res) => {
        try {
            let id = req.params.doctorId;
            const { ok, data, message } = await ReviewController.getSingleDoctorReviews(id);
            if (ok) {
                res.status(200).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });
    api.get("/patients/:patientId", async (req, res) => {
        try {
            let id = req.params.patientId;
            const { ok, data, message } = await ReviewController.getSinglePatientsReviews(id);
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
            const { ok, data, message } = await ReviewController.updateReview(id, body);
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
            const { ok, data, message } = await ReviewController.deleteReview(id);
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