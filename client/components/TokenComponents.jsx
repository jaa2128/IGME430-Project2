// Base React
const React = require('react');
const {useState, useEffect} = React;

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
            <div key={token._id} className='token'>
                {/* TODO: replace image tag with something other than Domo */}
                <img src={token.imageString} alt="card face" className="cardFace" />
            </div>
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