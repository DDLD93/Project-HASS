const room = require("./room.controller");
const patient = require("./patient.controller");
const doctor = require("./doctor.controller");
const auth = require("./auth.controller");
(()=>{
auth.generateAndSaveUsers().then(async()=>{
    await doctor.createDoctors()
    await patient.createPatients()
    await room.generateFakeRooms()
}
)
})()