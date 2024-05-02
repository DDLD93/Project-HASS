const AppointmentModel = require("../model/appointment.model");
const DoctorModel = require("../model/doctor.model");
const PatientModel = require("../model/patient.model");
const RatingModel = require("../model/review.model");
const RoomModel = require("../model/room.model");
const { io } = require("../server");

class AppointmentController {
  constructor() { }
  // Inside the AppointmentController class ...

  async getAvailableDoctors({ specialization, start }) {
    try {
      // Convert start and end to Date objects
      const startTime = new Date(start);
      const endTime = new Date(add30Minutes(start));

      console.log({ specialization, startTime, endTime });
      // Find doctors with the specialization, checking for conflicts directly
      const availableDoctors = await DoctorModel.findOne({
        department: specialization,
        _id: {
          $nin: [
            // Use $nin (not in) to exclude doctors with overlaps
            await AppointmentModel.find({
              $or: [
                { start: { $lt: endTime, $gte: startTime } },
                { end: { $gt: startTime, $lte: endTime } },
                { start: { $gte: startTime }, end: { $lte: endTime } },
              ],
            }).distinct("doctorId"), // Get distinct doctorIds with conflicts
          ],
        },
      });

      return { ok: true, data: availableDoctors };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async isValidDoctor(doctorId) {
    try {
      const doctor = await DoctorModel.findById(doctorId);
      return doctor !== null;
    } catch (error) {
      console.error("Error validating doctor:", error);
      return false;
    }
  }

  async isValidPatient(patientId) {
    try {
      const patient = await PatientModel.find({ authId: patientId });
      return patient !== null;
    } catch (error) {
      console.error("Error validating patient:", error.message);
      return false;
    }
  }

  async createRatingForAppointment({ appointmentId, DoctorId, patientId }) {
    try {
      const newRating = new RatingModel({
        appointmentId,
        DoctorId,
        patientId,
      });
      await newRating.save();
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async setReviewAndRating(appointmentId, score, comment) {
    try {
      // Check if a review already exists for the appointment
      // const existingReview = await ReviewModel.findOne({ appointmentId: appointmentId });
      // if (existingReview) {
      //     return { ok: false, message: "You have already submitted a review for this appointment." };
      // };
      // Update the review details
      const reviewUpdate = {
        score: score,
        comment: comment,
        date: new Date(), // Set the date to the current date
      };

      // Update the review associated with the appointment
      await ReviewModel.findOneAndUpdate(
        { appointmentId: appointmentId },
        reviewUpdate,
        { upsert: true }
      );

      // Get the doctor ID associated with the appointment
      const appointment = await AppointmentModel.findById(appointmentId);
      const doctorId = appointment.doctorId;

      // Calculate new ratings count and average rating for the doctor
      const doctor = await DoctorModel.findById(doctorId);
      const newRatingsCount = doctor.ratingsCount + 1;
      const newAverageRating =
        (doctor.averageRating * doctor.ratingsCount + score) / newRatingsCount;

      // Update the doctor's ratings count and average rating
      await DoctorModel.findByIdAndUpdate(doctorId, {
        $set: {
          ratingsCount: newRatingsCount,
          averageRating: newAverageRating,
        },
      });

      return { ok: true, message: "Review and rating set successfully." };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async setAppointment(body) {
    try {
      body.end = add30Minutes(body.start);
      // Validate Doctor ID
      if (!(await this.isValidDoctor(body.doctorId))) {
        throw new Error("Invalid doctor ID");
      }

      // Validate Patient ID
      if (!(await this.isValidPatient(body.patientId))) {
        throw new Error("Invalid patient ID");
      }

      // Check Doctor Availability
      if (
        !(await this.isDoctorAvailable(body.doctorId, body.start, body.end))
      ) {
        throw new Error("Doctor not available for the selected time slot");
      }

      // Check Room Availability
      const res = await this.getRoomAvailable(body.start, body.end);
      if (!res.data) {
        throw new Error("Room not available for the selected time slot");
      }
      body.roomId = res.data._id;
      // Check Room Availability
      // if (!await this.isRoomAvailable(body.roomId, body.start, body.end)) {
      //     throw new Error("Room not available for the selected time slot");
      // };
      // body.start = new Date(body.start);
      // body.end = new Date(body.end);

      if (new Date(body.start).getTime() >= new Date(body.end).getTime()) {
        throw new Error("Start time must be before end time");
      }

      const appointment = new AppointmentModel(body);

      let result = await appointment.save();

      // result = result.toObject();
      // await this.createRatingForAppointment(result);
      // result.checkoutUrl = stripeRes.url;
      // mockPaymentEvent(result._id);
      return { ok: true, data: result };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
  async getRoomAvailable(startTime, endTime) {
    try {
      const availableRooms = await RoomModel.findOne({
        bookings: {
          // Find rooms where none of the existing bookings overlap
          $not: {
            $elemMatch: {
              $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
                { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
              ],
            },
          },
        },
      });

      return { ok: true, data: availableRooms };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async isRoomAvailable(roomId, start, end) {
    // Check for overlapping appointments for the room
    const overlap = await AppointmentModel.findOne({
      roomId,
      $or: [
        { start: { $lt: end, $gte: start } },
        { end: { $gt: start, $lte: end } },
      ],
    });
    return !overlap;
  }

  async isDoctorAvailable(doctorId, start, end) {
    // Convert start and end to Date objects
    const startTime = new Date(start);
    const endTime = new Date(end);

    // Check for overlapping appointments for the doctor
    const overlap = await AppointmentModel.findOne({
      doctorId,
      $or: [
        { start: { $lt: endTime }, end: { $gte: startTime } },
        { start: { $lt: endTime }, end: { $gt: startTime } },
        { start: { $gte: startTime }, end: { $lte: endTime } },
      ],
    });
    console.log({ overlap });

    return !overlap;
  }

  async singleDoctorAptmts(doctorId) {
    try {
      const appointments = await AppointmentModel.find({ doctor: doctorId });
      return { ok: true, data: appointments };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async singlePatientAptmts(patientId) {
    try {
      const appointments = await AppointmentModel.find({ patient: patientId });
      return { ok: true, data: appointments };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async updateAppointment(id, updateData) {
    try {
      if (updateData.date && updateData.time) {
        updateData.date = new Date(`${updateData.date}T${updateData.time}`);
      }

      const appointment = await AppointmentModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );
      return { ok: true, data: appointment };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async getSingleAppointment(id) {
    try {
      let appointment = await AppointmentModel.findById(id).populate("doctor");
      return { ok: true, data: appointment };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
  async fecthAllAppointments() {
    try {
      let appointment = await AppointmentModel.find();
      return { ok: true, data: appointment };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async gellAllAppointments(id) {
    try {
      let appointment = await AppointmentModel.find({
        $or: [
          { patientId: id },
          { doctorId: id }
        ]
      });
      return { ok: true, data: appointment };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async updateAppointment(id, updateData) {
    try {
      const appointment = await AppointmentModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );
      return { ok: true, data: appointment };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async deleteAppointment(id) {
    try {
      const appointment = await AppointmentModel.findByIdAndDelete(id);
      if (appointment) {
        return { ok: true, data: ` Appointment has been deleted` };
      }
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
}
function add30Minutes(dateTimeString) {
  // Split the datetime string into date and time components
  const [date, time] = dateTimeString.split(" ");

  // Split the time component into hours, minutes, and seconds
  let [hours, minutes, seconds] = time.split(":");

  // Convert minutes to an integer and add 30
  let newMinutes = parseInt(minutes, 10) + 30;

  // Handle the case where the minutes exceed 60
  if (newMinutes >= 60) {
    hours = parseInt(hours, 10) + 1; // Increment the hour
    newMinutes = newMinutes - 60; // Adjust the minutes
  }

  // Ensure minutes have two digits (e.g., '05')
  newMinutes = newMinutes.toString().padStart(2, "0");

  // Reassemble the date and time components
  const newDateTimeString = `${date} ${hours}:${newMinutes}:${seconds}`;
  return newDateTimeString;
}

module.exports = new AppointmentController();
