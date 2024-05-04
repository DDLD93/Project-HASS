require("dotenv").config({path:"../.env"});
require("./connection/mongo.connection")();
const { appPort } = require("./config");
const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express();
const server = http.createServer(app);

const patientRoutes = require("./route/patient.route");
const doctorsRoutes = require("./route/doctor.route");
const appointmentsRoutes = require("./route/appointment.route");
const reviewRoutes = require("./route/review.route");
const roomsRoutes = require("./route/room.route");
const authRoutes = require("./route/auth.route");
const geminiRoutes = require("./route/gemini.route");
const { initializeSocket } = require("./connection/socket.connection");

initializeSocket(server);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/patient", patientRoutes());
app.use("/api/v1/doctor", doctorsRoutes());
app.use("/api/v1/appointment", appointmentsRoutes());
app.use("/api/v1/review", reviewRoutes());
app.use("/api/v1/room", roomsRoutes());
app.use("/api/v1/auth", authRoutes());
app.use("/api/v1/gemini", geminiRoutes());

server.listen(appPort, () => {
  console.log("App listening on port: " + appPort);
});

setTimeout(() => {
  require("./controller/mockData.controller");
}, 10000);

module.exports = { app };
