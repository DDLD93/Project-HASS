const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    authId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true
    },
    firstName: { type: String, required: [true, 'First Name name is required'] },
    lastName: { type: String, required: [true, 'Last Name name is required'] },
    fullName: { type: String },
    dateOfBirth: { type: Date, required: [true, 'Date of birth is required'] },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['male', 'female', 'other']
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact phone number required']
    },
    email: {
        type: String,
        lowercase: true,
        validate: [email => /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email), 'Please fill a valid email address']
    },
    address: { type: String },
    medicalHistory: [String]
}, { timestamps: true });
patientSchema.pre('save', function (next) {
    this.fullName = this.firstName + " " + this.lastName;
    next();
})
module.exports = mongoose.model('Patient', patientSchema);