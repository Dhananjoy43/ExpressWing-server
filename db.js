require("dotenv").config();
const mongoose = require('mongoose');


const MONGODB_URI = process.env.MONGODB_URI;
const connectToDatabase = async () => {
    try {
        await mongoose.connect(`${MONGODB_URI}/BookingData`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to the database!');
        // Additional code or operations after successful connection
    } catch (error) {
        console.error('Error connecting to the database:', error);
        // Error handling or fallback logic
    }
}

module.exports = connectToDatabase;
