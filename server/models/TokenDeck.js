const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

// Schema to describe a Domo Collection
const TokenDeckSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        set: setName,
    },
    tokens: [{
        type: mongoose.Schema.ObjectId, 
        ref: 'Token',
    }],
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account',
    },
    createdDate: {
        type: Date, 
        default: Date.now,
    },
})

TokenDeckSchema.statics.toAPI = (doc) => ({
    name: doc.name,
    tokens: doc.tokens,
});

const TokenDeckModel = mongoose.model('TokenDeck', TokenDeckSchema);
module.exports = TokenDeckModel;