const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//image always is a URL in database to make managing easy.

const carSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: {
        type: [String],
        default: [],
    },
    images: {
        type: [String],  // Array of strings, each representing a URL to an image
        validate: {
            validator: function (arr) {
                return arr.every((url) => /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(url));
            },
            message: 'Each image must be a valid URL ending in jpg, jpeg, png, or gif.',
        },
        required: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: false,
        ref: 'User'
    }
});
module.exports = mongoose.model('Car', carSchema);
//databases ...