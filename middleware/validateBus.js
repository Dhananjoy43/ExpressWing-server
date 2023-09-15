const { body, checkSchema } = require('express-validator');

const validateBus = checkSchema({

    name: {
        in: ['body'],
        isLength: {
            options: { min: 3 },
            errorMessage: 'Bus name must be at least 3 characters long',
        },
    },
    'depurture_time': {
        in: ['body'],
        isISO8601: {
            errorMessage: 'Invalid time format for depurture time',
        },
    },
    'arrival_time': {
        in: ['body'],
        isISO8601: {
            errorMessage: 'Invalid time format for arrival time',
        },
    },
    'source': {
        in: ['body'],
        isLength: {
            options: { min: 3 },
            errorMessage: 'Source must be at least 3 characters long',
        },
    },
    'destination': {
        in: ['body'],
        isLength: {
            options: { min: 3 },
            errorMessage: 'Arrival location must be at least 3 characters long',
        },
    },
    'seatArrangement.*.seatNumber': {
        in: ['body'],
        isInt: {
            options: { min: 1, max: 50 },
            errorMessage: 'Seat number must be an integer between 1 and 50',
        },
    },

    'seatArrangement.*.passengerName': {
        in: ['body'],
        optional: true,
        isLength: {
            options: { min: 3 },
            errorMessage: 'Passenger name must be at least 3 characters long',
        },
    },
    'seatArrangement.*.gender': {
        in: ['body'],
        optional: true,
        isIn: {
            options: [['M', 'F']],
            errorMessage: 'Gender must be either "M" or "F"',
        },
    },
    AC: {
        in: ['body'],
        isBoolean: {
            errorMessage: 'Must be true or false',
        },
    },
    fare: {
        in: ['body'],
        isNumeric: {
            errorMessage: 'Fare must be a numeric value',
        },
    },
    amenities: {
        in: ['body'],
        isArray: {
            errorMessage: 'Amenities must be an array',
        },
    },
    'amenities.*': {
        in: ['body'],
        isLength: {
            options: { min: 2 },
            errorMessage: 'Amenity must be at least 2 characters long',
        },
    },

});

module.exports = validateBus;
