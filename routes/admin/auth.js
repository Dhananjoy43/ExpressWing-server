const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const fetchAdmin = require('../../middleware/fetchAdmin');
const Admin = require('../../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

// ROUTE 1: Create a User using: POST "/api/admin/auth/createadmin". No login required
router.post('/createadmin', [
    body('name', 'Enter a valid admin name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 10 characters').isLength({ min: 10 }),
], async (req, res) => {

    const { name, email, password, secret_key } = req.body;

    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Check whether the admin with this email exists already
        let admin = await Admin.findOne({ email: email });
        if (admin) {
            success = false;
            return res.status(400).json({ error: "Sorry an admin with this email already exists!" })
        }

        // check wheather the provided secret_key matches with ADMIN_SECRET_KEY
        if (secret_key !== ADMIN_SECRET_KEY) {
            success = false;
            return res.status(400).json({ error: "Invalid secret key!" })
        }


        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        // Create a new admin
        admin = await Admin.create({
            name: name,
            email: email,
            password: secPass,
        });
        const data = {
            admin: {
                id: admin.id
            }
        }
        const authtoken_admin = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken_admin })


    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// ROUTE 2: Authenticate an admin using: POST "/api/admin/auth/login". No login required
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
        let admin = await Admin.findOne({ email });
        if (!admin) {
            success = false
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, admin.password);
        if (!passwordCompare) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const data = {
            admin: {
                id: admin.id
            }
        }
        const authtoken_admin = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken_admin })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }


});


// ROUTE 3: Get loggedin Admin Details using: POST "/api/admin/auth/getadmin". Login required
router.post('/getadmin', fetchAdmin, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const admin = await Admin.findById(adminId).select("-password")
        res.status(200).send(admin)
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router