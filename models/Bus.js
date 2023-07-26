const mongoose = require('mongoose');
const { Schema } = mongoose;

const BusSchema = new Schema({
    agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agency'
    },
    busName: {
        type: String,
        required: true
    },
    depurture: {
        time: {
            type: Date,
            required: true
        },
        location: {
            type: String,
            required: true
        }
    },
    arrival: {
        time: {
            type: Date,
            required: true
        },
        location: {
            type: String,
            required: true
        }
    },
    seatArrangement: [{
        seatNumber: {
            type: Number,
            required: true
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        passengerName: {
            type: String,
        },
        gender: {
            type: String,
            enum: ['M', 'F'],
            default: 'M'
        }

    }],

    AC: {
        type: Boolean,
        default: false
    },
    fare: {
        type: Number,
        required: true,
    },
    amenities: [{
        type: String
    }],
    cancellationPolicy: {
        type: String,
        default: "No cancellation"
    },
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('bus', BusSchema);