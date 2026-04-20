const helper = require('../helper.js');

// Base React
const React = require('react');
const {useState, useEffect} = React;

// GenericTokenList helper component
const {GenericTokenList} = require('./HelperComponents.jsx');

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
    const token = props.token;
    const onDeleteClick = props.onDeleteClick;

    return (
        <div key={token._id} className='token'>
                <img src={token.imageString} alt="card face" className="cardFace" />

                {/* Delete Token Button, when clicked on it performs a delete request
                    While also triggering the triggerReload property which is defined
                    in DeckView in maker.jsx, this updates the reloadTokens property which 
                    triggers the effect to reload the Token List */}
                <button className="deleteToken" 
                onClick={() => onDeleteClick(token)} 
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

    const deckID = props.deckID;
    const reloadTokens = props.reloadTokens;
    const triggerReload = props.triggerReload;

    // Hook to load tokens from the deck we are viewing
    // when updates are made
     useEffect(() => {
        // grab tokens from the deck we are viewing
        const loadTokensFromDeck = async () => {
            const response = await fetch(`/getDeck?id=${deckID}`);
            const data = await response.json();
            setTokens(data.deck.tokens || []);
        };
        loadTokensFromDeck();
    }, [reloadTokens]);

    return (
        <GenericTokenList
            tokens={tokens}
            emptyMessage='No Tokens Yet! Search and add Tokens!'
            Component={Token}
            extraProps={{
                onDeleteClick: (token) => handleDeleteToken(token, triggerReload, deckID)
            }}
        />
    )
}

module.exports = {
    TokenList
}