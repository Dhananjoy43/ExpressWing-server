require("dotenv").config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const fetchAgency = (req, res, next) => {
    // Get the agency from the jwt token and add id to req object
    const token = req.header('authtoken_agency');
    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid agency token" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.agency = data.agency;
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid agency token" })
    }

}


module.exports = fetchAgency;