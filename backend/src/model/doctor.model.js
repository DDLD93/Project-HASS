const mongoose = require('mongoose');

// Doctor Model
const doctorSchema = new mongoose.Schema({
    authId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true
    },
    firstName: { type: String, required: [true, 'First Name name is required'] },
    lastName: { type: String, required: [true, 'Last Name name is required'] },
    fullName: { type: String }, department: { type: String },
    specialization: [{ type: String }],
    contactNumber: { type: String, },
    email: {
        type: String,
        lowercase: true,
        validate: [email => /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email), 'Please fill a valid email address']
    },
    availability: [{
        type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    ratingsCount: {
        type: Number,
        default: 0
    }
},{ timestamps: true });
doctorSchema.pre('save', function (next) {
    this.fullName = this.firstName + " " + this.lastName
    next();
});
module.exports = mongoose.model('Doctor', doctorSchema);