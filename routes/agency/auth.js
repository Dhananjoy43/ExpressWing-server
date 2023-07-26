const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const fetchAgency = require('../../middleware/fetchAgency');
const Agency = require('../../models/Agency');

const JWT_SECRET = process.env.JWT_SECRET;

// ROUTE 1: Create an Agency using: POST "/api/agency/auth/createagency". No login required
router.post('/createagency', [
    body('agency', 'Enter a valid agency name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Check whether the agency with this email exists already
        let agency = await Agency.findOne({ email: req.body.email });
        if (agency) {
            success = false;
            return res.status(400).json({ error: "Sorry a agency with this email already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create a new agency
        agency = await Agency.create({
            agency: req.body.agency,
            email: req.body.email,
            password: secPass,
        });
        const data = {
            agency: {
                id: agency.id
            }
        }
        const authtoken_agency = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken_agency })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// ROUTE 2: Authenticate a Agency using: POST "/api/agency/auth/login". No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let agency = await Agency.findOne({ email });
        if (!agency) {
            success = false
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, agency.password);
        if (!passwordCompare) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const data = {
            agency: {
                id: agency.id
            }
        }
        const authtoken_agency = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken_agency })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }


});


// ROUTE 3: Get loggedin Agency Details using: POST "/api/agency/auth/getagency". Login required
router.post('/getagency', fetchAgency, async (req, res) => {
    try {
        const agencyId = req.agency.id;
        const agency = await Agency.findById(agencyId).select("-password")
        res.status(200).send(agency)
    } catch (error) {
        // console.error(error);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router