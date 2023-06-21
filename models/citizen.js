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
//throw mongoose validation error when you attempt to violate a unique constraint.
//rather than E11000 error.
//email and password here are idcard of a person are unique, password can be same.
//while making project for internship give names that explain more about your project
//court case manager better than shopmate.
publicSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Citizen', publicSchema);