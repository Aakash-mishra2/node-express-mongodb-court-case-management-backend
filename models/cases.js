const mongoose = require('mongoose');

const Schema = mongoose.Schema;
//image always is a URL in database to make managing easy.
const judgeSchema = new Schema({
    judgeId: {
        type: String,
        required: false,
    },
    judgeName: {
        type: String,
        required: false,
    },
});

const lawyerSchema = new Schema({
    lawyerName: {
        type: String,
        required: false,
    },
    lawyerId: {
        type: String,
        required: false,
    },
});
const courtSchema = new Schema({
    courtname: {
        type: String,
        required: false,
    },
    courtAddress: {
        type: String,
        required: false,
    },
    courtId: {
        type: String,
        required: false,
    }
});

const hearingSchema = new Schema({
    date: {
        type: String,
        required: false,
    },
    timings: {
        type: String,
        required: false,
    },
});


const caseSchema = new Schema({
    judge: judgeSchema,
    lawyer: lawyerSchema,
    court: courtSchema,
    nextHearing: hearingSchema,
    summary: { type: String, required: true },
    registrationFees: { type: String, required: true },
    status: { type: String, required: false },
    plaintiff: { type: mongoose.Types.ObjectId, required: true, ref: 'Citizen' },
});
module.exports = mongoose.model('Case', caseSchema);
//databases ...