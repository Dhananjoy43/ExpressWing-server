const express = require('express');
const router = express.Router();
const fetchuser = require('../../middleware/fetchUser');
const Bus = require('../../models/Bus');
const { body, param, validationResult } = require('express-validator');


// ROUTE 1: Get All the Buses using: GET "/api/booking/searchbus". Login required
router.get('/searchbus', async (req, res) => {
    try {
        const buses = await Bus.find();
        res.json(buses)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2: Book a seat using: POST "/api/booking/bookseat". Login required
router.post('/bookseat/:id', fetchuser, [
    body('passengerName', 'Enter a valid passenger name!').isLength({ min: 3 }),
    body('seatNumber', 'Seat number must be an integer between 1 and 50').isInt({ min: 1, max: 50 }),
    body('gender', "Gender must be either 'M' or 'F'").isIn(['M', 'F']),
], async (req, res) => {
    const { seatNumber, passengerName, gender } = req.body;
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Find the bus by its ID
        const bus = await Bus.findById(req.params.id);
        if (!bus) {
            return res.status(404).send("Bus Not Found");
        }

        // Check if the requested seat is available
        const seatIndex = bus.seatArrangement.findIndex(seat => seat.seatNumber === seatNumber);
        if (seatIndex === -1 || !bus.seatArrangement[seatIndex].isAvailable) {
            return res.status(400).send("Seat is not available.");
        }

        // Update the seat status and add passenger details
        bus.seatArrangement[seatIndex].isAvailable = false;
        bus.seatArrangement[seatIndex].passengerName = passengerName;
        bus.seatArrangement[seatIndex].gender = gender;

        // Save the updated bus with passenger details to the database
        const updatedBus = await bus.save();
        success = true;

        res.json({ success, message: "Bus booked successfully!", bus: updatedBus });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


// ROUTE 3: Cancel a booked sest using: DELETE "/api/notes/deletenote". Login required
router.delete('/cancelbooking/:id/:seatNumber', [
    param('seatNumber', 'Seat number must be an integer between 1 and 50').isInt({ min: 1, max: 50 }),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Find the bus by its ID
        const bus = await Bus.findById(req.params.id);
        if (!bus) {
            return res.status(404).send("Bus Not Found");
        }

        // Check if the requested seat is booked and get its index
        const seatIndex = bus.seatArrangement.findIndex(seat => seat.seatNumber === Number(req.params.seatNumber));
        if (seatIndex === -1 || bus.seatArrangement[seatIndex].isAvailable) {
            return res.status(400).send("Seat is not booked or already available.");
        }

        // Clear the seat status and passenger details
        bus.seatArrangement[seatIndex].isAvailable = true;
        bus.seatArrangement[seatIndex].passengerName = undefined;
        bus.seatArrangement[seatIndex].gender = undefined;

        // Save the updated bus after cancelling the booking
        const updatedBus = await bus.save();
        success = true;

        res.json({ success, message: "Booking cancelled successfully!", bus: updatedBus });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});
module.exports = router