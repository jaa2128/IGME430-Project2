const models= require('../models');
const Token = models.Token;
const DomoCollection = models.DomoCollection;

const makerPage = async (req, res) => {
    return res.render('app');
};

const addToken = async (req, res) => {
    if(!req.body.name || !req.body.age || !req.body.level || !req.body.deckID) {
        return res.status(400).json({error: 'All fields are required!'});
    }

    const tokenData = {
        name: req.body.name, 
        age: req.body.age, 
        level: req.body.level, 
        owner: req.session.account._id,
    };

    try{
        const newToken = new Token(tokenData);
        const savedToken = await newToken.save();

        // Push domo's ID into it's respective collection array
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

module.exports = {
    makerPage,
    makeDomo,
    getDomos
};