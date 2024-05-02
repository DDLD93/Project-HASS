const express = require("express");
const GeminiController = require("../controller/gemini.controller");
const OllamaController = require("../controller/ollama.controller");
const OpenAiController = require("../controller/open.controller");


module.exports = () => {
    const api = new express.Router();


    api.post("/recommend", async (req, res) => {
        try {
            let body = req.body;
            const { ok, data, message } = await OpenAiController.sendResponse(body);
            if (ok) {
                res.status(200).json({ ok, data })
            } else {
                res.status(500).json({ ok, message })
            }
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message })
        }
    });
    api.post("/embedding", async (req, res) => {
        try {
            let body = req.body;
            const { ok, data, message } = await GeminiController.getEmbeddings(body);
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