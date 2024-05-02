const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: [true, 'Room number is required']
    },
    type: { type: String },
    bookings: [{
        startTime: { type: Date },
        endTime: { type: Date },
    }]
}, { timestamps: true });
module.exports = mongoose.model('Room', roomSchema);