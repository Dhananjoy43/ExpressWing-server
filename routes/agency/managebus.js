const express = require('express');
const router = express.Router();
const fetchAgency = require('../../middleware/fetchAgency');
const validateBus = require('../../middleware/validateBus')
const Bus = require('../../models/Bus');
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get All the Buses using: GET "/api/agency/managebus/allbuses". Login required
router.get('/allbuses', fetchAgency, async (req, res) => {
    try {
        const buses = await Bus.find(req.query);
        res.status(200).json(buses)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2: Add a new Bus using: POST "/api/agency/managebus/addbus". Login required
router.post('/addbus', fetchAgency, validateBus, [
    // Validation middleware...
], async (req, res) => {
    try {
        const { name, departure_time, arrival_time, source, destination, seatArrangement, AC, fare, amenities, cancellationPolicy } = req.body;

        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Create a new bus object
        const bus = new Bus({
            name, departure_time, arrival_time, source, destination, seatArrangement, AC, fare, amenities, cancellationPolicy, agency: req.agency.id
        });

        // Save the bus object to the database
        const savedBus = await bus.save();

        // Return the saved bus object as JSON in the response
        res.status(201).json(savedBus);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: Update an existing Bus using: PUT "/api/agency/managebus/updatebus". Login required
router.put('/updatebus/:id', fetchAgency, validateBus, async (req, res) => {
    let success = false;
    try {
        const { name, departure_time, arrival_time, source, destination, seatArrangement, AC, fare, amenities, cancellationPolicy } = req.body;
        // Create a newBus object
        const newBus = {};
        if (name) { newBus.name = name };
        if (departure_time) { newBus.departure_time = departure_time };
        if (arrival_time) { newBus.arrival_time = arrival_time };
        if (source) { newBus.source = source };
        if (destination) { newBus.destination = destination };
        if (seatArrangement) { newBus.seatArrangement = seatArrangement };
        if (AC) { newBus.AC = AC };
        if (fare) { newBus.fare = fare };
        if (amenities) { newBus.amenities = amenities };
        if (cancellationPolicy) { newBus.cancellationPolicy = cancellationPolicy };

        // Find the bus to be updated and update it
        let bus = await Bus.findById(req.params.id);
        if (!bus) { return res.status(404).send("Bus Not Found") }

        if (bus.agency.toString() !== req.agency.id) {
            return res.status(401).send("Not Allowed");
        }
        updatedBus = await Bus.findByIdAndUpdate(req.params.id, { $set: newBus }, { new: true })
        success = true;
        res.json({ success, message: "Bus updated successfully", updatedBus: updatedBus });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 4: Delete an existing Bus using: DELETE "/api/agency/managebus/removebus". Login required
router.delete('/removebus/:id', fetchAgency, async (req, res) => {
    let success = false;
    try {
        // Find the bus to be delete and delete it
        let bus = await Bus.findById(req.params.id);
        if (!bus) { return res.status(404).send("Bus Not Found") }

        // Allow deletion only if agency owns this Bus
        if (bus.agency.toString() !== req.agency.id) {
            return res.status(401).send("Not Allowed");
        }

        deletedBus = await Bus.findByIdAndDelete(req.params.id)
        success = true;
        res.json({ success, message: "Bus has been cancelled.", cancelledBus: deletedBus });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router