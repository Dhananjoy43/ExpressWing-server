require("dotenv").config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const fetchAdmin = (req, res, next) => {
    // Get the admin from the jwt token and add id to req object
    const token = req.header('authtoken_admin');
    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid admin token" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.admin = data.admin;
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid admin token" })
    }

}


module.exports = fetchAdmin;