const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const publicSchema = new mongoose.Schema({
    id: {
        type: Number,
        minLength: 12,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    enrollmentNumber: {
        type: String,
        required: true,
    },
    barCouncilAffiliation: {
        type: String,
        required: true,
    },
    practiceCertificate: {
        type: String,
        required: true,
    },
    officeAddress: {
        type: String,
        required: true,
    },
    cases: [{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Case'
    }],


})