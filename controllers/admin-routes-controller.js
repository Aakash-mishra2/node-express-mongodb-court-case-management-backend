const supabase = require('../supabaseClient.js');

const HttpError = require('../models/http_error');
const express = require('express');
const app = express();
app.use(express.json());
const { validationResult } = require('express-validator');

const getAllCases = async (req, res, next) => {
    try {
        let query = supabase.from('cases').select('*');
        // Example filter: ?status=filed
        if (req.query.status) {
            query = query.eq('status', req.query.status);
        }
        const { data, error } = await query;
        if (error) return res.status(400).json({ error });
        res.status(200).json({ message: "Found matching cases after filtering", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createNewCase = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs', 422));
    }
    const { caseType, description, district, documents, registrationFees, state, userAadhar, userId } = req.body;
    try {
        const caseInsert = await pool.query(
            'INSERT INTO cases (case_type, summary, user_address_state, user_address_district, registration_fees, plaintiff_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [caseType, description, state, district, registrationFees, userId, 'filed']
        );
        await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [userId, 'Your application is received. Kindly wait until verifications.']);
        res.status(200).json({ message: "New case added", caseObject: caseInsert.rows[0] });
    } catch (err) {
        next(new HttpError('Error creating case', 500));
    }
};

const updateHearingSQL = async (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        await pool.query('UPDATE cases SET next_hearing = $1 WHERE id = $2', [updates.nextHearing, id]);
        res.status(200).json({ message: 'Hearing updated.' });
    } catch (error) {
        next(new HttpError('Error updating hearing', 500));
    }
};

const updatesAndVerification = async (req, res, next) => {
    const { action, new_status = "", lawyerDocuments, lawyerName = "", enrollmentNumber = "" } = req.body;

    const { id } = req.params;
    let yourCase;
    try {
        yourCase = await Case.findById(id);
    } catch (err) {
        const error = new HttpError('Failed to update! Case not found.', 500);
        return next(error);
    }
    if (action === "verify-documents") {
        yourCase.status = new_status;
    }
    else if (action === 'update-lawyer')
        yourCase.status = "pending";
    yourCase.lawyer = {
        lawyerName,
        enrollmentNumber,
        relatedDocs: lawyerDocuments,
    };
    const notification = new Notification({
        userId: yourCase.plaintiff,
        message: 'Your Case Lawyer is updated.'
    });

    try {
        await notification.save();
        await yourCase.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update Case. ', 500);
        return next(error);
    }
    res.status(200).json({ message: " Your case " + id + " is updated. ", data: yourCase });
}

const withdrawCase = async (req, res, next) => {
    const { cID } = req.params;
    try {
        await pool.query('DELETE FROM cases WHERE id = $1', [cID]);
        res.status(200).json({ message: 'Case withdrawn.' });
    } catch (err) {
        next(new HttpError('Error withdrawing case', 500));
    }
};

module.exports = {
    getAllCases,
    createNewCase,
    updateHearing: updateHearingSQL,
    updatesAndVerification,
    withdrawCase,
};

