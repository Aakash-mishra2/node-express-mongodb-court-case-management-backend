const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const publicSchema = new Schema({
    name: { type: String, required: true },
    //internal email validation.
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 6 },
    image: { type: String, required: true },
    idCardNo: { type: Number, minLength: 12, unique: true },
    cases: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Case' }],
});

publicSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Citizen', publicSchema);