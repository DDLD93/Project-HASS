const express = require("express");
const RoomsController = require("../controller/room.controller");

module.exports = () => {
  const api = new express.Router();

  api.post("/", async (req, res) => {
    try {
      let body = req.body;
      const { ok, data, message } = await RoomsController.bookRoom(body);
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
      const query = req.query.query;
      const { ok, data, message } = await RoomsController.gellAllRooms(query);
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
      const { ok, data, message } =
        await RoomsController.gellAllAvailableRooms();
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
      const { ok, data, message } = await RoomsController.getSingleRoom(id);
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
      const { ok, data, message } = await RoomsController.updateRoom(id, body);
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
      let { id } = req.params;
      await RoomsController.deleteRoom(id);
      res.status(200).json({ ok: true, message: "room deleted" });
      // if (ok) {
      //   res.status(200).json({ ok, message });
      // } else {
      //   res.status(500).json({ ok, message });
      // }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  return api;
};
