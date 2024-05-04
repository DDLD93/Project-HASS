const PatientsModel = require("../model/patient.model");
const AuthCtrl = require("../controller/auth.controller");
const AuthModel = require("../model/auth.model");

const { faker } = require('@faker-js/faker');

class PatientsController {
    constructor() {
        // this.#init()
    }
    async #init() {
        try {
            await this.createPatients()
        } catch (error) {

        }
    }

    async registerPatient(body) {
        try {
            const patient = new PatientsModel(body);
            await patient.save();
            const { data:user } = await AuthCtrl.updateUser(body.authId, { role: "patient" });
            let token = AuthCtrl.encodeToken(
                {
                    email: user.email,
                    role: user.role,
                    id: user._id,
                },
                { expiresIn: "5h" }
            );

            let payload = {
                user,
                token,
            };
            return { ok: true, data: payload };
        } catch (error) {
            return { ok: false, message: error.message }
        }
    }

    async getSinglePatient(id) {
        try {
            let patient = await PatientsModel.findById(id);
            return { ok: true, data: patient };
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }
    async getPatient(id) {
        try {
            let patient = await PatientsModel.findOne({ authId: id });
            return { ok: true, data: patient };
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }

    async gellAllPatients() {
        try {
            let patients = await PatientsModel.find();
            return { ok: true, data: patients }
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }

    async updatePatient(id, updateData) {
        try {
            const patient = await PatientsModel.findByIdAndUpdate(id, { $set: updateData }, { new: true })
            return { ok: true, data: patient }
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }

    async deletePatient(id) {
        try {
            const patient = await PatientsModel.findByIdAndDelete(id);
            return { ok: true, data: `patient ${patient.name} has been deleted` };
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }
    async createPatients() {
        try {
            const authRecords = await AuthModel.find({ role: "patient" });

            for (let i = 0; i < authRecords.length; i++) {
                const authRecord = authRecords[i];

                const newPatient = new PatientsModel({
                    authId: authRecord._id, // Assuming _id is used as the reference to authId
                    firstName: faker.person.firstName(),
                    lastName: faker.person.lastName(),
                    dateOfBirth: faker.date.birthdate(),
                    gender: faker.person.sex(),
                    contactNumber: faker.phone.number(),
                    email: faker.internet.email(),
                    address: faker.location.streetAddress(),
                    medicalHistory: ["None"]
                });

                await newPatient.save();
                console.log(`Patient created for authentication ID: ${authRecord._id}`);
            }

            console.log('Patients created for all authentication records');
        } catch (error) {
            console.error('Error creating patients:', error.message);
        }
    }
}

module.exports = new PatientsController();