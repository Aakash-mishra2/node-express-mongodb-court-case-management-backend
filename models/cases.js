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

const courtSchema = new Schema({
    courtName: {
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

const documentsSchema = new Schema({
    documentId: {
        type: String,
        required: false,
    },
    fileTitle: {
        type: String,
        required: false,
    },
    fileName: {
        type: String,
        required: false,
    },
    fileId: {
        type: String,
        required: true
    }
})
const lawyerSchema = new Schema({
    lawyerName: {
        type: String,
        required: false,
    },
    enrollmentNumber: {
        type: String,
        required: false,
    },
    relatedDocs: documentsSchema,
});
const addressSchema = new Schema({
    state: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: false,
    }
})

const caseSchema = new Schema({
    judge: judgeSchema,
    lawyer: lawyerSchema,
    court: courtSchema,
    nextHearing: hearingSchema,
    caseType: { type: String, required: false },
    caseTitle: { type: String, required: false },
    summary: { type: String, required: false },
    registrationFees: { type: String, required: false },
    status: { type: String, required: false },
    userAddress: addressSchema,
    plaintiff: { type: mongoose.Types.ObjectId, required: true, ref: 'Citizen' },
    documents: [documentsSchema]
});
module.exports = mongoose.model('Case', caseSchema);
//databases ...