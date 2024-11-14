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
    cars: [{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Car'
    }],
});

publicSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', publicSchema);