const mongoose = require('mongoose');
const { Schema } = mongoose;

const AgencySchema = new Schema({
    agency: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
});
const Agency = mongoose.model('agency', AgencySchema);
module.exports = Agency;