const mongoose = require('mongoose');

const Schema = mongoose.Schema;
//image always is a URL in database to make managing easy.

const caseSchema = new Schema({
    court: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    location: {
        city: { type: String, required: true },
        pincode: { type: Number, required: true }
    },
    judge: { type: String, required: true },
    status: { type: String, required: false },
    next_hearing: { type: String, required: false },
    plaintiff: { type: mongoose.Types.ObjectId, required: true, ref: 'Citizen' },
});
module.exports = mongoose.model('Case', caseSchema);