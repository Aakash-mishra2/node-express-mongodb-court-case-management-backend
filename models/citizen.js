const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const publicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    //internal email validation.
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    image: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: false,
        enum: ['user', 'admin'],
    },
    idCardNo: {
        type: Number,
        minLength: 12,
        unique: true
    },
    cases: [{
        type: mongoose.Types.ObjectId,
        required: function () {
            return this.role === 'user'
        },
        ref: 'Case'
    }],
});

publicSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Citizen', publicSchema);