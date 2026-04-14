const models = require('../models');
const TokenDeck = models.TokenDeck;

// Function to make a collection
const makeDeck = async (req, res) => {
    if(!req.body.name) {
        return res.status(400).json({error: 'You must name the deck'});
    }

    const deckData = {
        name: req.body.name,
        tokens: [], // new collection means empty array
        owner: req.session.account._id,
    }

    try {
        const newDeck = new TokenDeck(deckData);
        await newDeck.save();
        return res.status(201).json({message: 'Collection created successfully'});
    } catch (err) {

        console.log(err);

        // if there is an identical collection somehow, throw error
        if(err.code === 11000){
            return res.status(400).json({error: 'Deck already exists'});
        }
        return res.status(500).json({error: 'An error occured making deck'});
    }
}

// Function to get all collections that belong to a user
const getDecks = async(req, res) => {
    try{
        const query = {owner: req.session.account._id};

        // finds all Collections and also populates their 'domos' array
        // using objectIds that match domos in Domos collections in MongoDB
        const docs = await TokenDeck.find(query).select('name tokens')
        .populate('tokens').lean().exec();

        return res.json({decks: docs});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({error: 'Error retrieving decks'});
    }
}

// Get a Collection based off its Id, used to re-render Domos upon Creation in React
// because React doesn't check for internal changes to an object
const getDeck = async (req, res) => {
    const {id} = req.query;
    try{

        // finds collection according to Id and owner Id and also populates their 'domos' array
        // using objectIds that match domos in Domos collections in MongoDB
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
    makeCollection,
    getCollections,
    getCollection,
}