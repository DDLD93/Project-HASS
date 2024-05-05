const room = require("./room.controller");
const patient = require("./patient.controller");
const doctor = require("./doctor.controller");
const auth = require("./auth.controller");
(async () => {
    const { ok, data } = await auth.getUsers()
    if (ok && data.length > 1) {
        console.log("Skipping Mocking data");
        return
    } else {
        auth.generateAndSaveUsers().then(async () => {
            await doctor.createDoctors()
            await patient.createPatients()
            await room.generateFakeRooms()
        }
        )
    }
})()