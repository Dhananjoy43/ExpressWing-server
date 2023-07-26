const express = require('express');
const router = express.Router();
const fetchAdmin = require('../../middleware/fetchAdmin');
const validateBus = require('../../middleware/validateBus')
const Bus = require('../../models/Bus');
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get All the Buses using: GET "/api/admin/manage/allbuses". Login required
router.get('/allbuses', fetchAdmin, async (req, res) => {
    try {
        const buses = await Bus.find({ admin: req.admin.id });
        res.json(buses)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2: Add a new Bus using: POST "/api/admin/manage/addbus". Login required
router.post('/addbus', fetchAdmin, validateBus, [
    body('busName'),
    body('depurture'),
    body('arrival'),
    body('seatArrangement'),
    body("AC"),
    body('fare'),
    body("amenities"),
    body('cancellationPolicy')
], async (req, res) => {
    let success = false;
    try {
        const { busName, depurture, arrival, seatArrangement, AC, fare, amenities, cancellationPolicy } = req.body;

        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const bus = new Bus({
            busName, depurture, arrival, seatArrangement, AC, fare, amenities, cancellationPolicy, admin: req.admin.id
        })
        const savedBus = await bus.save()
        success = true;

        res.json({ success, message: "Bus added successfully", savedBus })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 3: Update an existing Bus using: PUT "/api/admin/manage/updatebus". Login required
router.put('/updatebus/:id', fetchAdmin, validateBus, async (req, res) => {
    let success = false;

    try {
        const { busName, depurture, arrival, seatArrangement, AC, fare, amenities, cancellationPolicy } = req.body;
        // Create a newBus object
        const newBus = {};
        if (busName) { newBus.busName = busName };
        if (depurture) { newBus.depurture = depurture };
        if (arrival) { newBus.arrival = arrival };
        if (seatArrangement) { newBus.seatArrangement = seatArrangement };
        if (AC) { newBus.AC = AC };
        if (fare) { newBus.fare = fare };
        if (amenities) { newBus.amenities = amenities };
        if (cancellationPolicy) { newBus.cancellationPolicy = cancellationPolicy };

        // Find the bus to be updated and update it
        let bus = await Bus.findById(req.params.id);
        if (!bus) { return res.status(404).send("Bus Not Found") }


        bus = await Bus.findByIdAndUpdate(req.params.id, { $set: newBus }, { new: true })
        success = true;
        res.json({ success, message: "Bus updated successfully", bus });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 4: Delete an existing Bus using: DELETE "/api/admin/manage/removebus". Login required
router.delete('/removebus/:id', fetchAdmin, async (req, res) => {
    let success = false;
    try {
        // Find the bus to be delete and delete it
        let bus = await Bus.findById(req.params.id);
        if (!bus) { return res.status(404).send("Bus Not Found") }


        deletedBus = await Bus.findByIdAndDelete(req.params.id)
        success = true;
        res.json({ success, "message": "Bus has been cancelled", bus: deletedBus });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router