// Base React
const React = require('react');
const {useState, useEffect} = React;

// GenericTokenList helper component
const {GenericTokenList} = require('./HelperComponents.jsx');

/**
 * Component meant to represent A Token being played on a Board
 * @param {object} props - This components properties
 * @returns - A Board token in the form of html elements
 */
const BoardToken = (props) => {
    const token = props.token;
    const onTap = props.onTap;
    const onRemove = props.onRemove;

    return (
        // add a class name if the 'isTapped' field of token is true
        <div key={token._id} className={`boardToken ${token.isTapped ? 'tapped' : ''}`}
        style={{cursor: 'pointer'}}>
            <img 
                src={token.imageString} alt="card face" className="cardFace" 
                onClick={() => onTap(token.instanceID)}
            />

            {/* section to add card-controls */}
            <div className="card-controls">
                <button onClick={() => onRemove(token.instanceID)}
                 className='removeBoardToken'><span className='deleteIcon'>-</span></button>
            </div>
        </div>
    )
}

/**
 * Component meant to represent A Token being in a Deck
 * @param {object} props - This components properties
 * @returns - A Token in the form of html elements
 */
const DeckToken = (props) => {
    const token = props.token;
    const onPlace = props.onPlace;

    return (
        <div
            key={token._id} 
            className='token'
            onClick={() => onPlace(token)}
            style={{cursor: 'pointer'}}>
            <img src={token.imageString} alt="card face" className="cardFace" />
        </div>
    )
}


/**
 * List of Tokens a user can play on this board
 * Similar to TokenList in TokenComponents.jsx but displays 
 * DeckToken components instead of Token Components
 * @param {object} props - This components properties
 * @returns - A List of this deck's Token html elements
 */
const BoardDeckList = (props) => {

    const [tokens, setTokens] = useState([]);

    const deckID = props.deckID;
    const reloadTokens = props.reloadTokens;
    const onPlace = props.onPlace;

    // Hook to load tokens from the deck we are playing with
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
            emptyMessage='No Tokens Yet! Add tokens before playing'
            Component={DeckToken}
             extraProps={{
                onPlace: onPlace,
            }}
        />
    )
}

/**
 * The actual Board where BoardTokens will appear and be interacted with
 * @param {object} props - This components properties
 * @returns - A List of this deck's Token html elements
 */
const Board = (props) => {
    const boardTokens = props.boardTokens || [];
    const onTap = props.onTap;
    const onRemove = props.onRemove;

    return (
        <GenericTokenList
            tokens={boardTokens}
            emptyMessage='Board empty, Click a card in your deck to play it!'
            Component={BoardToken}
            listClassName='board'
            extraProps={{
                onTap: onTap,
                onRemove: onRemove
            }}
        />
    )
}

module.exports = {
    BoardDeckList,
    Board
}
