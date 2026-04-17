const helper = require('../helper.js');
// Base React
const React = require('react');
const {useState, useEffect} = React;

// function to handle post request to create a Token Deck
const handleDeck = (e, onDeckAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#deckName').value;

    if(!name){
        helper.handleError('Deck name required');
        return false;
    }

    helper.sendPost(e.target.action, {name}, onDeckAdded);
}

// Func Component representing a Form to create a Deck
const DeckForm = (props) => {
    return (
        <form onSubmit={(e) => handleDeck(e, props.triggerReload)}
        name='deckForm'
        action='/makeDeck'
        method='POST'
        className='tokenForm'>
            <label htmlFor='deckName'>New Deck: </label>
            <input type="text" id="deckName" placeholder='Deck Name' name='deckName'/>
            <input type="submit" className="makeTokenSubmit" value='Create Deck'/>
        </form>
    )
}

// Func Component representing a List of Decks
const DeckList = (props) => {
    // if props.decks is empty, use empty array for the state
    const [decks, setDecks] = useState([] || props.decks);

    // effect that reloads decks from the server whenever reloadDecks
    // Changes, this occurs in the App Component
    useEffect(() => {
        const loadDecksFromServer = async () => {
            const response = await fetch('/getDecks');
            const data = await response.json();
            setDecks(data.decks);
        };
        loadDecksFromServer();
    }, [props.reloadDecks]);

    // If there are no Decks
    if(decks.length === 0){
        return (
            <div className="tokenList">
                <h3 className="emptyToken">No Decks</h3>
            </div>
        );
    }

    // Create a Node for each Deck a User has
    const deckNodes = decks.map(deck => {
        return (
           <div key={deck._id}
           className='token'
           onClick={() => props.onSelect(deck)} // when clicked use callback function onSelect
           style={{cursor: 'pointer'}}
           >
            {/* TODO: replace image tag with something other than Domo */}
            <img src='/assets/img/cards.png' alt='domo face' className='domoFace'/>
            <h3 className="tokenName">Deck: {deck.name}</h3>
            <h3 className="tokenAge">Number of Tokens: {deck.tokens.length}</h3>
           </div> 
        );
    });

    return (
        <div className="tokenList">
            {deckNodes}
        </div>
    )
}

module.exports = {
    DeckForm,
    DeckList
}