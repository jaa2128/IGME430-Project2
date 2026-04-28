const models = require('../models');
const TokenDeck = models.TokenDeck;
const Token = models.Token;

/**
 * function to render the deck page
 * @param {Request} req - request object
 * @param {Response} res  - response object
 * @returns 
 */
const deckPage = async (req, res) => {
    return res.render('app');
};

/**
 * Handles creation of a new deck that belongs to a user
 * @param {Request} req - request object
 * @param {Response} res  - response object
 * @returns 
 */
const makeDeck = async (req, res) => {
    if(!req.body.name) {
        return res.status(400).json({error: 'You must name the deck'});
    }

    const deckData = {
        name: req.body.name,
        tokens: [], // new deck means empty array
        owner: req.session.account._id,
    }

    try {
        const newDeck = new TokenDeck(deckData);
        await newDeck.save();
        return res.status(201).json({message: 'Deck created successfully'});
    } catch (err) {

        console.log(err);

        // if there is an identical deck somehow, throw error
        if(err.code === 11000){
            return res.status(400).json({error: 'Deck already exists'});
        }
        return res.status(500).json({error: 'An error occured making deck'});
    }
}

/**
 * Handles the deletion of a deck and the tokens inside of the deck
 * @param {Request} req - request object
 * @param {Response} res  - response object
 * @returns 
 */
const deleteDeck = async (req, res) => {
    // ensure we have the deck's id to find it for deletion
    if(!req.body.deckID){
        return res.status(400).json({error: 'All fields are required!'});
    }

    // attempt delete
    try{

        // First find the deck according to the id
        const deck = await TokenDeck.findOne({
            _id: req.body.deckID,
            owner: req.session.account._id
        });

        // if there is none, return 404
        if(!deck){
            return res.status(404).json({error: 'Deck not found'});
        }

        // Then delete all Token Documents found in this deck
        // the $in operator matches the _id with those found inside of this deck
        // also ensure that the tokens deleted belong to this account
        await Token.deleteMany({
            _id: { $in: deck.tokens },
            owner: req.session.account._id
        });

        // Finally delete this deck and return 200
        await TokenDeck.deleteOne({_id: req.body.deckID});

        return res.status(200).json({message: 'Deck deleted successfully'});
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({error: 'An error occurred while deleting the deck'});
    }
}

/**
 * Handles retrieving all decks that belong to a user
 * @param {Request} req - request object
 * @param {Response} res  - response object
 * @returns 
 */
const getDecks = async(req, res) => {
    try{
        // get the user's id
        const query = {owner: req.session.account._id};

        // finds all Decks and also populates their 'tokens' array
        // using objectIds that match tokens in Token Decks in MongoDB
        const docs = await TokenDeck.find(query).select('name tokens')
        .populate('tokens').lean().exec();

        return res.json({decks: docs});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({error: 'Error retrieving decks'});
    }
}



/**
 * handles retriveal of a deck based off its Id
 * @param {Request} req - request object
 * @param {Response} res  - response object
 * @returns 
 */
const getDeck = async (req, res) => {
    const {id} = req.query;
    try{

        // finds deck according to Id and owner Id and also populates their 'tokens' array
        // using objectIds that match tokens in Token Decks in MongoDB
        const doc = await TokenDeck.findOne({
            _id: id,
            owner: req.session.account._id
        })
        .populate('tokens').lean().exec();

        return res.json({deck: doc});
    }
    catch (err){
        console.log(err);
        return res.status(500).json({error: 'Could not find deck'});
    }

}

module.exports = {
    deckPage,
    makeDeck,
    deleteDeck,
    getDecks,
    getDeck,
}