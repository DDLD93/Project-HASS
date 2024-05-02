const mongoose = require('mongoose');

const RecurrenceSchema = new mongoose.Schema({
    frequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly'],
    },
    endDate: {
        type: Date
    }
}, { _id: false });

const appointmentSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        // required: true,
        // unique: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    start: {
        type: Date,
        required: [true, 'Start time is required'],
    },
    end: {
        type: Date,
        required: [true, 'End time is required'],
        validate: [function (v) {
            return this.start && v > this.start; 
        }, 'End time must be after start time']
    },
    purpose: { type: String },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Confirmed', 'Canceled', 'Completed']
    },
    notes: { type: String },
    recurrence: RecurrenceSchema,
    
}, { timestamps: true });

appointmentSchema.virtual('isRecurring').get(function () {
    return !!this.recurrence;
});

module.exports = mongoose.model('Appointment', appointmentSchema);
