const config = require('../config');
const Appointment = require('../model/appointment.model');
const Agenda = require('agenda');

// Agenda Connection Setup (Assuming you have MongoDB set up)
const agenda = new Agenda({ db: { address: config.mongoURI } });

// Define the Appointment Reminder Job
agenda.define('appointmentReminder', async (job, done) => {
  const appointment = job.attrs.data;
  try {
    console.log(`Reminder: Upcoming appointment for ${appointment.patientId.name} with ${appointment.doctorId.name} on ${appointment.start}`);
    // ... Your actual reminder logic (e.g., sending emails, SMS, etc.)
    done();
  } catch (error) {
    done(error);
  }
});

// Scheduler Controller
class SchedulerController {
  constructor() {
    // agenda.on('ready', () => this.scheduleAllAppointmentsReminders());
    agenda.on('error', (err) => console.error('Agenda error:', err));
  }

  async scheduleAppointmentReminder(appointment) {
    const reminderDate = new Date(appointment.start.getTime() - 15 * 60 * 1000); 
    const job = agenda.create('appointmentReminder', appointment);
    await job.schedule(reminderDate).save();
  }

  async scheduleAllAppointmentsReminders() {
    try {
      const upcomingAppointments = await Appointment.find({
        start: { $gte: new Date() },
        status: 'Confirmed',
      }).populate('patientId doctorId');

      upcomingAppointments.forEach(appointment => {
        this.scheduleAppointmentReminder(appointment);
      });

      await agenda.start(); 
    } catch (error) {
      console.error('Error scheduling appointment reminders:', error);
    }
  }
}

// Event Listeners for Reminders
agenda.on('complete:appointmentReminder', (job) => {
  console.log(`Reminder sent for appointment ID: ${job.attrs.data._id}`);
});

agenda.on('fail:appointmentReminder', (err, job) => {
  console.error(`Reminder failed for appointment ID: ${job.attrs.data._id}`, err);
});

// Initialize the controller
module.exports = new SchedulerController(); 
