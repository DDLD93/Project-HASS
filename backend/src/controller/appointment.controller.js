const AppointmentModel = require("../model/appointment.model");
const DoctorModel = require("../model/doctor.model");
const PatientModel = require("../model/patient.model");
const RatingModel = require("../model/review.model");
const RoomModel = require("../model/room.model");
const OpenAICtrl = require("../controller/open.controller");
const GoogleCtrl = require("../controller/google.controller");

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

  async createRatingForAppointment({ appointmentId, doctorId, patientId }) {
    try {
      const newRating = new RatingModel({
        appointmentId,
        doctorId,
        patientId,
      });
      await newRating.save();
      return { ok: true };
    } catch (error) {
      throw new Error(error.message)
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

  async setAppointment(patientAuthId, body) {
    try {
      const patient = await PatientModel.findOne({ authId: patientAuthId });
      body.patientId = patient._id
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
      // get purpose embeddings
      const { ok, data, message } = await OpenAICtrl.getEmbeddings({ input: body.purpose })
      if (!ok) throw new Error(message)
      body.purposeEmbeddings = data;
      const appointment = new AppointmentModel(body);
      let result = await appointment.save();
      result = result.toObject();
      await this.scheduleEvent(result);
      const event = {
        summary: 'HASS Apoointment',
        location: 'HASS Office',
        description: 'A medical appointment ',
        start: {
          dateTime: result.start,
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: result.end,
          timeZone: 'America/Los_Angeles',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 },
          ],
        },
      };
      await GoogleCtrl.addEvent(patientAuthId, event);
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
      let appointment = await AppointmentModel.findById(id).populate("roomId doctorId");
      return { ok: true, data: appointment };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
  async fecthAllAppointments() {
    try {
      let appointment = await AppointmentModel.find().populate("patientId doctorId roomId");
      return { ok: true, data: appointment };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async gellAllAppointments(id) {
    try {
      const doctor = await DoctorModel.findOne({ authId: id });
      const patient = await PatientModel.findOne({ authId: id })

      let appointment = await AppointmentModel.find({
        $or: [
          { patientId: patient?._id },
          { doctorId: doctor?._id }
        ]
      });
      return { ok: true, data: appointment };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async updateAppointment(id, updateData) {
    try {
      const appointment = await AppointmentModel.findByIdAndUpdate(id, updateData, { new: true });
      return { ok: true, data: appointment };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
  async vectorSearch(queryVector) {
    try {
      const appointments = await AppointmentModel.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "purposeEmbeddings",
            queryVector: queryVector,
            numCandidates: 100,
            limit: 5
          },
        },
        {
          $lookup: {
            from: "patients",
            localField: "patientId",
            foreignField: "_id",
            as: "patient"
          }
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctor"
          }
        },
        {
          $lookup: {
            from: "rooms",
            localField: "roomId",
            foreignField: "_id",
            as: "room"
          }
        },
        {
          $addFields: {
            patient: { $arrayElemAt: ["$patient", 0] },
            doctor: { $arrayElemAt: ["$doctor", 0] },
            room: { $arrayElemAt: ["$room", 0] }
          }
        },
        {
          $project: {
            patientId: 1,
            doctorId: 1,
            roomId: 1,
            purpose: 1,
            patient: 1,
            doctor: 1,
            room: 1,
            score: { $meta: 'searchScore' }
          },
        }
      ]);
      return { ok: true, data: appointments };
    } catch (error) {
      console.error('Error in vectorSearch:', error.message);
      return { ok: false, message: error.message }
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
  async scheduleEvent(appointment) {
    try {
      const startTime = new Date(appointment.start);
      const currentTime = new Date();
      if (startTime > currentTime) {
        const delay = startTime - currentTime;
        setTimeout(async () => {
          console.log(`Appointment ${appointment._id} starts now.`);
          const apptnm = await this.updateAppointment(appointment._id, { status: "Completed" })
          console.log(`Appointment ${apptnm._id} updated.`);
        }, delay);
      } else {
        console.log(`Appointment ${appointment._id} is already in progress.`);
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }
  // async createAppoinsments() {
  //   try {
  //     const patientRecords = await AuthModel.find({ role: "patient" });
  //     const doctorRecords = await AuthModel.find({ role: "doctor" });
  //     const rooms = await RoomModel.find();

  //     for (let i = 0; i < patientRecords.length; i++) {
  //       const patientRecord = patientRecords[i];

  //       const newPatient = new AppointmentModel({
  //         patientId: patientRecord._id
  //         doctorId
  //         doctor
  //         roomId
  //         start
  //         end
  //         purpose
  //         purposeEmbeddings
  //       });

  //       await newPatient.save();
  //       console.log(`Patient created for authentication ID: ${authRecord._id}`);
  //     }

  //     console.log('Patients created for all authentication records');
  //   } catch (error) {
  //     console.error('Error creating patients:', error.message);
  //   }
  // }
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
const symptoms = [
  "Persistent sore throat, swollen lymph nodes, fatigue: May indicate mononucleosis (mono).",
  "Abdominal pain, bloating, diarrhea: Possible signs of celiac disease.",
  "Sudden onset of severe headache, stiff neck, fever: Symptoms of meningitis.",
  "Persistent cough, chest pain, difficulty breathing: Indicative of pulmonary fibrosis.",
  "Sudden chest pain, shortness of breath, fainting: May indicate a pulmonary embolism.",
  "Persistent abdominal pain, unintentional weight loss, jaundice: Possible signs of pancreatic cancer.",
  "Fatigue, weakness, pale skin, swollen tongue: Indicative of vitamin B12 deficiency.",
  "Unexplained weight loss, abdominal pain, jaundice: Symptoms of pancreatic cancer.",
  "Persistent cough, wheezing, shortness of breath: May indicate chronic obstructive pulmonary disease (COPD).",
  "Joint pain, stiffness, fatigue: Possible signs of fibromyalgia.",
  "Severe abdominal pain, fever, vomiting: May indicate acute pancreatitis.",
  "Sudden chest pain, shortness of breath, dizziness: Indicative of heart arrhythmia.",
  "Frequent infections, fatigue, swollen lymph nodes: Possible signs of HIV/AIDS.",
  "Sudden vision changes, eye pain, seeing halos around lights: Symptoms of acute angle-closure glaucoma.",
  "Persistent cough, chest pain, hoarseness: Indicative of lung cancer.",
  "Severe abdominal pain, nausea, vomiting: May indicate gallstones.",
  "Severe headache, stiff neck, sensitivity to light: Indicative of meningitis.",
  "Persistent bloating, abdominal pain, changes in bowel habits: Possible signs of ovarian cancer.",
  "Unexplained weight loss, fever, night sweats: May indicate tuberculosis (TB).",
  "Persistent cough, chest pain, difficulty swallowing: Indicative of esophageal cancer.",
  "Joint pain, redness, warmth, fever: Symptoms of septic arthritis.",
  "Persistent fatigue, weakness, enlarged lymph nodes: May indicate lymphoma.",
  "Sudden chest pain, difficulty breathing, coughing up blood: Indicative of pulmonary embolism.",
  "Severe abdominal pain, diarrhea, fever: Possible signs of Crohn's disease.",
  "Persistent headache, nausea, vomiting: May indicate intracranial hemorrhage.",
  "Unexplained weight loss, fatigue, abdominal pain: Possible signs of stomach cancer.",
  "Joint pain, stiffness, rash on cheeks: Symptoms of systemic lupus erythematosus (SLE).",
  "Persistent cough, chest pain, wheezing: May indicate bronchiectasis.",
  "Frequent heartburn, chest pain, difficulty swallowing: Indicative of gastroesophageal reflux disease (GERD).",
  "Persistent bloating, abdominal pain, changes in bowel habits: Possible signs of colorectal cancer.",
  "Unexplained weight loss, fatigue, loss of appetite: Possible signs of pancreatic cancer.",
  "Joint pain, stiffness, warmth, swelling: Symptoms of infectious arthritis.",
  "Sudden vision loss, eye pain, seeing floaters or flashes: Indicative of retinal detachment.",
  "Persistent cough, chest pain, fatigue: May indicate pulmonary hypertension.",
  "Sudden onset of severe headache, nausea, vomiting: Symptoms of subarachnoid hemorrhage.",
  "Persistent bloating, abdominal pain, changes in bowel habits: Possible signs of endometriosis.",
  "Unexplained weight loss, abdominal pain, jaundice: Possible signs of bile duct cancer.",
  "Persistent headache, nausea, vomiting: Indicative of brain tumor.",
  "Joint pain, stiffness, difficulty moving: Possible signs of ankylosing spondylitis.",
  "Persistent cough, chest pain, wheezing: May indicate bronchiolitis obliterans organizing pneumonia (BOOP).",
  "Sudden chest pain, shortness of breath, fainting: Possible signs of hypertrophic cardiomyopathy.",
  "Persistent abdominal pain, bloating, changes in bowel habits: Indicative of pelvic inflammatory disease (PID).",
  "Unexplained weight loss, fatigue, bone pain: Possible signs of multiple myeloma.",
  "Joint pain, stiffness, swelling, fever: Symptoms of reactive arthritis.",
  "Persistent cough, chest pain, difficulty breathing: May indicate interstitial lung disease.",
  "Sudden chest pain, shortness of breath, dizziness: Indicative of aortic dissection.",
  "Persistent bloating, abdominal pain, changes in bowel habits: Possible signs of diverticulosis.",
  "Unexplained weight loss, fatigue, abdominal pain: Possible signs of liver cancer.",
  "Persistent headache, dizziness, blurred vision: Indicative of increased intracranial pressure.",
  "Joint pain, stiffness, warmth, swelling: Possible signs of gout.",
  "Persistent cough, chest pain, fatigue: May indicate sarcoidosis.",
  "Sudden chest pain, shortness of breath, sweating: Indicative of heart attack.",
  "Persistent bloating, abdominal pain, changes in bowel habits: Possible signs of irritable bowel syndrome (IBS).",
  "Unexplained weight loss, fatigue, loss of appetite: Possible signs of leukemia.",
  "Joint pain, stiffness, swelling, fatigue: Symptoms of juvenile idiopathic arthritis (JIA).",
  "Persistent cough, chest pain, difficulty breathing: May indicate interstitial pneumonia.",
  "Sudden chest pain, shortness of breath, fainting: Indicative of pulmonary hypertension.",
  "Persistent bloating, abdominal pain, changes in bowel habits: Possible signs of small intestine cancer.",
  "Unexplained weight loss, fatigue, loss of appetite: Possible signs of thyroid cancer.",
  "Joint pain, stiffness, warmth, swelling: Symptoms of pseudogout.",
  "Persistent cough, chest pain, difficulty breathing: May indicate bronchopulmonary dysplasia.",
  "Sudden chest pain, shortness of breath, rapid heartbeat: Indicative of heart failure.",
  "Persistent bloating, abdominal pain, changes in bowel habits: Possible signs of inflammatory bowel disease (IBD).",
  "Unexplained weight loss, fatigue, loss of appetite: Possible signs of esophageal cancer.",
  "Joint pain, stiffness, warmth, swelling: Possible signs of rheumatic fever.",
  "Persistent cough, chest pain, difficulty breathing: May indicate hypersensitivity pneumonitis.",
  "Sudden chest pain, shortness of breath, coughing up blood: Indicative of aortic aneurysm rupture.",
  "Persistent bloating, abdominal pain, changes in bowel habits: Possible signs of colon cancer.",
  "Unexplained weight loss, fatigue, loss of appetite: Possible signs of ovarian cancer.",
  "Joint pain, stiffness, warmth, swelling: Symptoms of polymyalgia rheumatica.",
  "Persistent cough, chest pain, difficulty breathing: May indicate pulmonary edema.",
  "Sudden chest pain, shortness of breath, swelling in legs: Indicative of heart failure.",
  "Persistent bloating, abdominal pain, changes in bowel habits: Possible signs of pancreatic cancer.",
  "Unexplained weight loss, fatigue, loss of appetite: Possible signs of stomach cancer.",
  "Joint pain, stiffness, warmth, swelling: Symptoms of ankylosing spondylitis.",
  "Persistent cough, chest pain, difficulty breathing: May indicate cryptogenic organizing pneumonia (COP).",
  "Sudden chest pain, shortness of breath, fainting: Indicative of aortic stenosis.",
  "Persistent bloating, abdominal pain, changes in bowel habits: Possible signs of gallbladder cancer.",
  "Unexplained weight loss, fatigue, loss of appetite: Possible signs of colon cancer.",
  "Joint pain, stiffness, warmth, swelling: Possible signs of septic arthritis.",
  "Persistent cough, chest pain, difficulty breathing: May indicate sarcoidosis.",
  "Sudden chest pain, shortness of breath, rapid heartbeat: Indicative of atrial fibrillation.",
  "Persistent bloating, abdominal pain, changes in bowel habits: Possible signs of stomach cancer.",
  "Unexplained weight loss, fatigue, loss of appetite: Possible signs of liver cancer.",
  "Joint pain, stiffness, warmth, swelling: Symptoms of reactive arthritis.",
  "Persistent cough, chest pain, difficulty breathing: May indicate idiopathic pulmonary fibrosis (IPF).",
  "Sudden chest pain, shortness of breath, swelling in legs: Indicative of deep vein thrombosis (DVT).",
  "Persistent bloating, abdominal pain, changes in bowel habits: Possible signs of colorectal cancer.",
  "Unexplained weight loss, fatigue, loss of appetite: Possible signs of lung cancer.",
  "Joint pain, stiffness, warmth, swelling: Symptoms of juvenile idiopathic arthritis (JIA).",
  "Persistent cough, chest pain, difficulty breathing: May indicate hypersensitivity pneumonitis.",
  "Sudden chest pain, shortness of breath, rapid heartbeat: Indicative of heart attack.",
  "Persistent bloating, abdominal pain, changes in bowel habits: Possible signs of inflammatory bowel disease (IBD).",
  "Unexplained weight loss, fatigue, loss of appetite: Possible signs of esophageal cancer.",
  "Fever, cough, fatigue: Indicative of viral respiratory infection like flu or COVID-19.",
  "Chest pain, shortness of breath: May signal heart attack or pneumonia.",
  "Headache, nausea, sensitivity to light: Symptoms of migraine.",
  "Abdominal pain, bloating, constipation: May indicate irritable bowel syndrome (IBS).",
  "Joint pain, stiffness, swelling: Possible signs of rheumatoid arthritis.",
  "Frequent urination, thirst, fatigue: Indicative of diabetes.",
  "Skin rash, itching, swelling: May suggest allergic reaction or dermatitis.",
  "Muscle weakness, fatigue, weight loss: Could indicate muscular dystrophy or thyroid issues.",
  "Vision changes, eye pain, redness: Symptoms of eye infection or glaucoma.",
  "Confusion, memory loss, personality changes: Possible signs of dementia or Alzheimer's.",
  "Severe headache, vomiting, confusion: May indicate a brain injury or stroke.",
  "Burning sensation, urgency, blood in urine: Symptoms of urinary tract infection (UTI) or kidney stones.",
  "Sore throat, fever, swollen glands: Indicative of strep throat or tonsillitis.",
  "Chest pain, wheezing, coughing up mucus: May suggest asthma or chronic obstructive pulmonary disease (COPD).",
  "Dizziness, fainting, irregular heartbeat: Symptoms of heart arrhythmia or low blood pressure.",
  "Persistent cough, chest pain, unintended weight loss: Could indicate lung cancer.",
  "Abdominal pain, yellowing of skin, dark urine: Symptoms of hepatitis.",
  "Severe abdominal pain, vomiting, fever: May indicate appendicitis.",
  "Weakness, fatigue, pale skin: Possible signs of anemia.",
  "Numbness, tingling, weakness in limbs: Symptoms of peripheral neuropathy.",
  "Excessive thirst, frequent urination, fatigue: Indicative of diabetes mellitus.",
  "Bloody stool, abdominal pain, fatigue: Symptoms of inflammatory bowel disease (IBD).",
  "Swollen lymph nodes, night sweats, weight loss: May indicate lymphoma.",
  "Rapid heartbeat, chest pain, shortness of breath: Symptoms of panic attack or anxiety.",
  "Excessive sweating, tremors, weight loss: Possible signs of hyperthyroidism.",
  "Blurred vision, eye pain, headache: Symptoms of acute angle-closure glaucoma.",
  "Joint pain, stiffness, limited range of motion: Possible signs of osteoarthritis.",
  "Shortness of breath, wheezing, chest tightness: Symptoms of chronic bronchitis.",
  "Persistent hoarseness, throat pain, difficulty swallowing: May indicate throat cancer.",
  "Loss of appetite, abdominal pain, fatigue: Symptoms of peptic ulcer disease.",
  "Hair loss, weight gain, fatigue: Possible signs of hypothyroidism.",
  "Rash that spreads, fever, headache: Indicative of measles or rubella.",
  "Swollen joints, stiffness, fatigue: May suggest systemic lupus erythematosus (SLE).",
  "Difficulty concentrating, forgetfulness, disorientation: Possible signs of ADHD or dementia.",
  "Difficulty breathing, chest pain, coughing up blood: Symptoms of pulmonary embolism.",
  "Abdominal pain, diarrhea, bloody stool: Indicative of ulcerative colitis.",
  "Tingling, numbness, weakness in extremities: Symptoms of multiple sclerosis (MS).",
  "Persistent indigestion, heartburn, difficulty swallowing: May indicate gastroesophageal reflux disease (GERD).",
  "Red, swollen, painful joints: Possible signs of gout.",
  "Persistent cough, chest pain, fever: Symptoms of pneumonia.",
  "Weakness, fatigue, shortness of breath: Possible signs of heart failure.",
  "Severe abdominal pain, vomiting, diarrhea: Indicative of food poisoning.",
  "Yellowing of skin, nausea, fatigue: May suggest liver disease.",
  "Difficulty speaking, weakness in face, arm, or leg: Symptoms of stroke.",
  "Swelling, tenderness, warmth in joints: Possible signs of arthritis.",
  "Severe abdominal pain, bloating, nausea: May indicate intestinal obstruction.",
  "Red, itchy, watery eyes: Symptoms of allergic conjunctivitis.",
  "Persistent sore throat, difficulty swallowing, ear pain: Indicative of strep throat.",
  "Painful urination, frequent urge to urinate, cloudy urine: Symptoms of urinary tract infection (UTI).",
  "Fatigue, weakness, pale skin: Possible signs of iron deficiency anemia.",
  "Difficulty walking, loss of balance, dizziness: Symptoms of vertigo.",
  "Pain in back, buttocks, legs, numbness in foot: Possible signs of sciatica.",
  "Bleeding gums, sensitive teeth, bad breath: Symptoms of gum disease (gingivitis).",
  "Severe headache, nausea, vomiting: Indicative of migraine.",
  "Joint pain, stiffness, swelling: May suggest rheumatoid arthritis.",
  "Shortness of breath, wheezing, chest tightness: Possible signs of asthma.",
  "Red, swollen, tender gums: Symptoms of periodontal disease.",
  "Frequent infections, fatigue, enlarged lymph nodes: May indicate leukemia.",
  "Persistent bloating, abdominal pain, changes in bowel habits: Indicative of colon cancer.",
  "Numbness, tingling, burning sensation: Possible signs of peripheral neuropathy.",
  "Severe abdominal pain, fever, vomiting blood: May indicate gastrointestinal bleeding.",
  "Swollen, painful, stiff joints: Symptoms of osteoarthritis.",
  "Red, itchy, raised rash: Possible signs of hives (urticaria).",
  "Difficulty swallowing, chest pain, food getting stuck: Symptoms of esophageal stricture.",
  "Unexplained weight loss, fatigue, loss of appetite: Possible signs of cancer.",
  "Painful urination, frequent urge to urinate, lower abdominal pain: Symptoms of bladder infection.",
  "Weakness, fatigue, weight loss: Possible signs of chronic fatigue syndrome (CFS).",
  "Persistent cough, chest pain, difficulty breathing: May indicate chronic obstructive pulmonary disease (COPD).",
  "Severe abdominal pain, vomiting, fever: Symptoms of pancreatitis.",
  "Red, itchy, watery eyes, sneezing, congestion: Possible signs of allergic rhinitis (hay fever).",
  "Pain, tenderness, swelling in one leg: Symptoms of deep vein thrombosis (DVT).",
  "Persistent cough, wheezing, chest tightness: Possible signs of bronchitis.",
  "Red, warm, swollen skin: Symptoms of cellulitis.",
  "Chest pain, shortness of breath, coughing up blood: May indicate pulmonary embolism.",
  "Severe abdominal pain, bloating, diarrhea: Possible signs of irritable bowel syndrome (IBS).",
  "Excessive thirst, frequent urination, fatigue: Indicative of diabetes insipidus.",
  "Hair loss, fatigue, weight gain: Possible signs of hypothyroidism.",
  "Persistent cough, chest pain, coughing up blood: Symptoms of tuberculosis (TB).",
  "Abdominal pain, bloating, changes in bowel habits: May indicate diverticulitis.",
  "Numbness, tingling, weakness in limbs: Possible signs of carpal tunnel syndrome.",
  "Painful urination, cloudy urine, strong-smelling urine: Symptoms of urinary tract infection (UTI).",
  "Difficulty swallowing, chest pain, food getting stuck: Possible signs of esophageal cancer.",
  "Weakness, fatigue, pale skin: Symptoms of iron deficiency anemia.",
  "Persistent cough, wheezing, chest tightness: May indicate asthma.",
  "Severe headache, blurred vision, nausea: Possible signs of increased intracranial pressure.",
  "Joint pain, stiffness, swelling: Symptoms of psoriatic arthritis.",
  "Shortness of breath, chest pain, swollen legs: Indicative of congestive heart failure.",
  "Persistent cough, chest pain, fatigue: Possible signs of lung cancer.",
  "Abdominal pain, nausea, vomiting: Symptoms of gastroenteritis (stomach flu).",
  "Swelling, redness, warmth in joints: Possible signs of septic arthritis.",
  "Red, swollen, tender gums, bleeding when brushing: Symptoms of gingivitis.",
  "Fatigue, weakness, dizziness upon standing: Indicative of orthostatic hypotension.",
  "Painful, swollen joints, morning stiffness: Possible signs of rheumatoid arthritis.",
  "Persistent cough, chest pain, difficulty breathing: Symptoms of pneumonia.",
  "Abdominal pain, bloating, diarrhea: Possible signs of lactose intolerance.",
  "Numbness, weakness, tingling in hands and feet: Symptoms of diabetic neuropathy.",
  "Shortness of breath, wheezing, coughing up blood: Possible signs of pulmonary hypertension.",
  "Red, swollen, painful joints: Symptoms of gouty arthritis.",
  "Persistent cough, chest pain, fever: Indicative of bronchitis.",
  "Frequent urination, thirst, fatigue: Possible signs of gestational diabetes.",
  "Loss of appetite, nausea, bloating: Symptoms of gastritis.",
  "Weakness, fatigue, weight loss: Possible signs of malnutrition.",
  "Severe abdominal pain, vomiting, fever: Indicative of cholecystitis (gallbladder inflammation)."
]