const models= require('../models');
const Token = models.Token;
const TokenDeck = models.TokenDeck;

/**
 * Handles adding a Token to a User's Deck
 * @param {Request} req - request object
 * @param {Response} res - response object
 * @returns 
 */
const addToken = async (req, res) => {

    // ensure all fields are sent
    if(!req.body.name || !req.body.deckID || !req.body.imageString) {
        return res.status(400).json({error: 'All fields are required!'});
    }

    // build the token
    const tokenData = {
        name: req.body.name, 
        imageString: req.body.imageString,
        owner: req.session.account._id,
    };

    try{
        // Check if Token already exists in this user's Deck
        const doc = await TokenDeck.findOne(
            {_id: req.body.deckID, owner: req.session.account._id})
            .populate('tokens').lean().exec();

        // build the new token
        const newToken = new Token(tokenData);

        // if the Deck already has a token of the same name don't add the token
        // return error message
        if(doc.tokens.some( token => token.name === newToken.name)){
            return res.status(400).json({error: 'Token with same name already exists, please select a different token'});
        }

        // if there isn't save the new Token
        const savedToken = await newToken.save();

        // Push token's ID into it's respective Deck array
        // find the one to update via it's ID and ensure the owner
        // is logged in user
        await TokenDeck.updateOne(
            {_id: req.body.deckID, owner: req.session.account._id},
            { $push: {tokens: savedToken._id}}
        );

        return res.status(201).json({name: newToken.name, imageString: newToken.tokenString});
    } catch (err) {
        console.log(err);
        if(err.code === 11000){
            return res.status(400).json({error: 'Token already exists!'});
        }
        return res.status(500).json({error: 'An error occured making Token!'});
    }
}

/**
 * Handles deleting a Token from a User's deck as well as the database
 * @param {Request} req - request object
 * @param {Response} res - response object
 * @returns 
 */
const deleteToken = async (req, res) => {
     // ensure all fields are sent
    if(!req.body.deckID || !req.body.tokenID) {
        return res.status(400).json({error: 'All fields are required!'});
    }

    // try to delete 
    try{
        // Remove Token from deck
        await TokenDeck.updateOne(
            {_id: req.body.deckID, owner: req.session.account._id},
            { $pull: {tokens: req.body.tokenID}}
        );

        // Also Remove Token from Mongo entirely based of it's ID as to not waste space
        await Token.deleteOne(
            {_id: req.body.tokenID, owner: req.session.account._id}
        );


        return res.status(200).json({message: 'Token successfully deleted'});
    }

    catch (err) {
        console.log(err);
        return res.status(500).json({error: 'An error occured while deleting Token!'});
    }
}

module.exports = {
    addToken,
    deleteToken
};