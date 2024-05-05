const DoctorsModel = require("../model/doctor.model");
const AuthCtrl = require("../controller/auth.controller");
const AuthModel = require("../model/auth.model");
const { faker } = require('@faker-js/faker');

class DoctorsController {
    constructor() {
        // this.#init()
    }

    async #init() {
        await this.createDoctors()
    }

    async registerDoctor(body) {
        try {
            const doctor = new DoctorsModel(body);
            await doctor.save();
            const { data:user } = await AuthCtrl.updateUser(body.authId, { role: "doctor" });
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

    async getSingleDoctor(id) {
        try {
            let doctor = await DoctorsModel.findById(id);
            return { ok: true, data: doctor };
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }

    async getDoctor(id) {
        try {
            let doctor = await DoctorsModel.findOne({ authId: id });
            return { ok: true, data: doctor };
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }

    async gellAllDoctors() {
        try {
            let doctors = await DoctorsModel.find();
            return { ok: true, data: doctors }
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }

    async updateDoctor(id, updateData) {
        try {
            const doctor = await DoctorsModel.findByIdAndUpdate(id, { $set: updateData }, { new: true })
            return { ok: true, data: doctor }
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }

    async deleteDoctor(id) {
        try {
            const doctor = await DoctorsModel.findByIdAndDelete(id);
            return { ok: true, data: `Doctor ${doctor.name} has been deleted` };
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }

    async getFreeDocsWithinTime(day, start, end) {
        try {
            const doctors = await DoctorsModel.
                find({
                    "availability.day": day,
                    "workingHours.start": { $gte: start },
                    "workingHours.end": { $lte: end }
                });
            return { ok: true, data: doctors };
        } catch (error) {
            return { ok: false, message: error.message };
        }
    }

    async createDoctors() {
        try {
            const authRecords = await AuthModel.find({ role: "doctor" });

            // List of available specializations
            const specializations = ["Cardiologist",
                "Gastroenterologist",
                "Neurologist",
                "Oncologist",
                "Pediatrician",
                "Psychiatrist",
                "Surgeon",
                "Urologist",
                "Endocrinologist",
                "Dermatologist",
                "Allergist",
                "Anesthesiologist",
                "Hematologist",
                "Nephrologist",
                "Ophthalmologist",
                "Orthopedic Surgeon",
                "Otolaryngologist",
                "Pathologist",
                "Pulmonologist",
                "Radiologist",
                "Rheumatologist",
                "Cardiothoracic Surgeon",
                "Dentist",
                "Gynecologist",
                "Hepatologist",
                "Osteopath",
                "Plastic Surgeon",
                "Podiatrist",
                "Thoracic Surgeon",
                "Vascular Surgeon"];

            // Loop through each authentication record
            for (let i = 0; i < authRecords.length; i++) {
                const authRecord = authRecords[i];

                // Generate random data for the doctor's details
                const newDoctor = new DoctorsModel({
                    authId: authRecord._id,
                    firstName: faker.person.firstName(),
                    lastName: faker.person.lastName(),
                    department: faker.helpers.arrayElement(specializations),
                    specialization: [faker.helpers.arrayElement(specializations)],
                    contactNumber: faker.phone.number(),
                    email: authRecord.email,
                    workingHours: {
                        start: "09:00",
                        end: "18:00"
                    },
                    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                });

                // Save the new doctor record
                await newDoctor.save();
                console.log(`Doctor created for authentication ID: ${authRecord._id}`);
            }

            console.log('Doctors created for all authentication records');
        } catch (error) {
            console.error('Error creating doctors:', error.message);
        }
    }



}

module.exports = new DoctorsController();