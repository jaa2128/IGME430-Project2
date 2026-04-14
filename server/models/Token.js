const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const TokenSchema = new mongoose.Schema({
    name: {
        type: String,
        required, 
        trim: true,
        set: setName
    },
    imageString: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true, 
        ref: 'Account', 
    },
    createdDate: {
        type: Date, 
        default: Date.now, 
    },
});

TokenSchema.statics.toAPI = (doc) => ({
    name: doc.name,
    imageString: doc.imageString,
});

const TokenModel = mongoose.model('Token', TokenSchema);
module.exports = TokenModel;