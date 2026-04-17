const models= require('../models');
const Token = models.Token;
const TokenDeck = models.TokenDeck;

const makerPage = async (req, res) => {
    return res.render('app');
};

// Controller function to add a Token to a Deck based off it's ID
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
        const newToken = new Token(tokenData);
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

const deleteToken = async (req, res) => {
     // ensure all fields are sent
    if(!req.body.deckID || !req.body.tokenID) {
        return res.status(400).json({error: 'All fields are required!'});
    }

    // try to delete 
    try{
        await TokenDeck.updateOne(
            {_id: req.body.deckID, owner: req.session.account._id},
            { $pull: {tokens: req.body.tokenID}}
        );

        return res.status(204);
    }

    catch (err) {
        console.log(err);
        return res.status(500).json({error: 'An error occured while deleting Token!'});
    }
}

module.exports = {
    makerPage,
    addToken,
    deleteToken
};