const scryfall = require('scryfall-client').default;

/**
 * Helper function to simply grab tokens based off some set param
 * can either be a set code or set name
 * @param {String} setParam 
 * @returns {Array} - array of Tokens returned by scryfall search
 */
const searchBySetParam = (setParam) => {

    // ask scryfall-client to attempt to get a set from 
    // scryfall using a setParam
    return scryfall
    .get(`sets/${setParam}`) 
    .then(set => {
        return set.getCards();
    })
    .then( cards => {
        
        // if there are cards, only grab the name and 
        // image uri for displaying and storing it in Mongo
        const tokens = cards.map((token) => {

            // Some tokens are double sided so only take the front face of the card for display
            return {
                name: token.name,
                imageString: token.image_uris?.normal || (token.card_faces && token.card_faces[0].image_uris?.normal),
                id: token.id
            }
            
        });

        // return the tokens found and mapped
        return tokens;
    })
    .catch(()=>null)
}

// Controller function to get tokens from a set requested by the user
const getTokensfromSet = async (req, res) => {

    // grab query params
    let {setCode, setName} = req.query;

    // if both don't exist throw error exist
    if(!setCode && !setName){
        return res.status(400).json({error: 'No set code or set name specified'});
    } 

    // if there is a set code ensure it doesn't also start with t to search 
    // for the tokens of that set
    if(setCode){
         setCode = setCode.startsWith('t') ? setCode : `t${setCode}`;
    }

    // if there is a set name append 'Tokens' to the end of it
    if(setName && !setName.includes('Tokens')){
        setName += 'Tokens';
    }

    try{
        let tokens; 

        // try set code
        if(setCode){
            tokens = await searchBySetParam(setCode);
        }

        // if no results and there is a setName try it
        if(!tokens && setName){
            tokens = await searchBySetParam(setName);
        }

        // check if there are any results
        if(!tokens || tokens.length === 0){
            return res.status(404).json({error: 'No tokens found for the specified set'});
        }

        return res.status(200).json({tokens: tokens});
    }

    catch(err){
        console.log(err);
        return res.status(500).json({error: 'Something went wrong fetching Scryfall Data'});
    }
    
}

module.exports = {
    getTokensfromSet,
}