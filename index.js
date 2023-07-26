const connectToMongo = require('./db.js');
const express = require('express')
var cors = require('cors')
require('dotenv').config();


const app = express()
const port = process.env.PORT;

// middlewares
app.use(cors())
app.use(express.json())

// Available Routes
// for users
app.use('/api/auth', require('./routes/user/auth'))
app.use('/api/booking', require('./routes/user/booking.js'))
// for agencies
app.use('/api/agency/auth', require('./routes/agency/auth.js'));
app.use('/api/agency/managebus', require('./routes/agency/managebus.js'))
// for admin
app.use('/api/admin/auth', require('./routes/admin/auth.js'));
app.use('/api/admin/manage', require('./routes/admin/manage.js'));

const startBackend = async () => {
    try {
        await connectToMongo();
        // Start the server after connecting to MongoDB successfully
        app.listen(port, () => {
            console.log(`ExpressWing server listening at http://localhost:${port}`)
        })
    } catch (error) {
        throw new Error("Error starting Quick Notes Backend")
    }
}


startBackend();
