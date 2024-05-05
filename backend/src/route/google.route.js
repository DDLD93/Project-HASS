const express = require("express");
const GoogleContorller = require("../controller/google.controller");
// const { verifyToken } = require("../middleware/auth.middleware");

module.exports = () => {
  const api = new express.Router();

  api.post("/authorize", async (req, res) => {
    try {
      let { id, code } = req.body;
      const { ok,data,message } = await GoogleContorller.authorizeCalendar(id,code);
      if (ok) {
        res.status(200).json({ ok, data, message });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  
  return api;
};
