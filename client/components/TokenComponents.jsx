const helper = require('../helper.js');

// Base React
const React = require('react');
const {useState, useEffect} = React;

/**
 * Function to handle delete requests to delete a new Token
 * pass in deckID to know which deck to delete a Token from
 * @param {Object} selectedToken - The selected token to delete from Deck
 * @param {Function} onTokenDeleted - Callback function to trigger upon function call
 * @param {String} deckID - Id of the deck the token will be removed from
 * @returns 
 */
const handleDeleteToken = (selectedToken, onTokenDeleted, deckID) => {
    const tokenID = selectedToken._id;

    helper.sendRequest('DELETE', '/deleteToken', {deckID, tokenID}, onTokenDeleted);
    return false;
}

/**
 * Func Component representing a Token in a deck
 * @param {object} props - This components properties
 * @returns - A Token in the form of Html Elements as well as a button
 * to delete the token from the deck
 */
const Token = (props) => {
    return (
        <div key={props.token._id} className='token'>
                <img src={props.token.imageString} alt="card face" className="cardFace" />

                {/* Delete Token Button, when clicked on it performs a delete request
                    While also triggering the triggerReload property which is defined
                    in DeckView in maker.jsx, this updates the reloadTokens property which 
                    triggers the effect to reload the Token List */}
                <button className="deleteToken" 
                onClick={props.onDeleteClick} 
                >
                    <span className='deleteIcon'>-</span>
                </button>
            </div>
    )
}

/**
 * Func Component representing a List of Tokens in a Deck
 * @param {object} props - This components properties
 * @returns - A List of this deck's Token html elements
 */
const TokenList = (props) => {
    
    const [tokens, setTokens] = useState([]);

    // Hook to load tokens from the deck we are viewing
    // when updates are made
     useEffect(() => {
        // grab tokens from the deck we are viewing
        const loadTokensFromDeck = async () => {
            const response = await fetch(`/getDeck?id=${props.deckID}`);
            const data = await response.json();
            setTokens(data.deck.tokens || []);
        };
        loadTokensFromDeck();
    }, [props.reloadTokens]);

    // If there are no tokens
    if(tokens.length === 0){
        return (
            <div className='deckList'>
                <h3 className="emptyToken">No Tokens Yet!</h3>
            </div>
        );
    }

    // if there are tokens create a bunch of nodes to display tokens
    const tokenNodes = tokens.map(token => {
        return (
            <Token token={token} onDeleteClick={() => handleDeleteToken(token, props.triggerReload, props.deckID)}/>
        )
    });

    return (
        <div className="tokenList">
            {tokenNodes}
        </div>
    )
}

module.exports = {
    TokenList
}