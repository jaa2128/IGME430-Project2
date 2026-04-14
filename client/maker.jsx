const helper = require('./helper.js');
const React = require('react');
const {useState, useEffect} = React;
const {createRoot} = require('react-dom/client');

// Function to handle post requests to create a new Token
// pass in deckID to know which deck to add a Token to it
const handleToken = (e, onTokenAdded, deckID) => {
    e.preventDefault();

    const name = e.target.querySelector('#tokenName').value;

    if(!name){
        return false;
    }

    helper.sendPost(e.target.action, {name, deckID}, onTokenAdded);
    return false;
}

// function to handle post request to create a Token Deck
const handleDeck = (e, onDeckAdded) => {
    e.preventDefault();

    const name = e.target.querySelector('#deckName').value;

    if(!name){
        return false;
    }

    helper.sendPost(e.target.action, {name}, onDeckAdded);
}

const TokenForm = (props) => {
    return(
        <form id='tokenForm'
            onSubmit={(e) => handleToken(e, props.triggerReload, props.deckID)}
            name='tokenForm'
            action='/maker'
            method='POST'
            className='tokenForm'
        >
            <label htmlFor='name'>Name: </label>
            <input id="tokenName" type="text" name='name' placeholder='Token Name'/>
            <input className='makeToken' type='submit' value="Make Token"/>
        </form>
    );
};

const TokenList = (props) => {
    
    const [tokens, setTokens] = useState([]);

     useEffect(() => {
        // grab tokens from the deck we are viewing
        const loadTokensFromDeck = async () => {
            const response = await fetch(`/getDeck?id=${props.deckID}`);
            const data = await response.json();
            setTokens(data.deck.tokens || []);
        };

        if(props.deckID){
            loadTokensFromDeck();
        }
    }, [props.reloadTokens, props.deckID]);

    if(tokens.length === 0){
        return (
            <div className='deckList'>
                <h3 className="emptyToken">No Tokens Yet!</h3>
            </div>
        );
    }

    const tokenNodes = tokens.map(token => {
        return (
            <div key={token._id} className='token'>
                {/* TODO: replace image tag with something other than Domo */}
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
                <h3 className="tokenName">Name: {token.name}</h3>
            </div>
        )
    });

    return (
        <div className="tokenList">
            {tokenNodes}
        </div>
    )
}

const DeckForm = (props) => {
    return (
        <form onSubmit={(e) => handleDeck(e, props.triggerReload)}
        name='deckForm'
        action='/makeDeck'
        method='POST'
        className='deckForm'>
            <label htmlFor='deckName'>New Deck: </label>
            <input type="text" id="deckName" placeholder='Deck Name' name='deckName'/>
            <input type="submit" className="makeTokenSubmit" value='Create Deck'/>
        </form>
    )
}

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

    if(decks.length === 0){
        return (
            <div className="tokenList">
                <h3 className="emptyToken">No Decks</h3>
            </div>
        );
    }

    const deckNodes = decks.map(deck => {
        return (
           <div key={deck._id}
           className='token'
           onClick={() => props.onSelect(deck)} // when clicked use callback function onSelect
           style={{cursor: 'pointer'}}
           >
            {/* TODO: replace image tag with something other than Domo */}
            <img src='/assets/img/domoface.jpeg' alt='domo face' className='domoFace'/>
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

const App = () => {
    // flag to trigger reloads from server
    const[reloadDecks, setReloadDecks] = useState(false);

    // flag to tell app which deck is selected
    const [selectedDeck, setSelectedDeck] = useState(null);

    return (
        <div>
            <div id="makeDeck">
                <DeckForm triggerReload={()=> setReloadDecks(!reloadDecks)}/>
            </div>

            <div className="container">
                <div className="tokens">
                    <h2>Your Decks:</h2>
                    <DeckList reloadDecks={reloadDecks}
                    onSelect={(deck) => setSelectedDeck(deck)} // when clicked on, selectedDeck is changed
                    />
                </div>

                <hr/>

                {/* Using conditional rendering, if a selected Deck exists
                    Render the TokenForm and display Tokens
                */}
                {selectedDeck && (
                    <div id="selectedDeck">
                        <h2>Viewing: {selectedDeck.name}</h2>

                        {/* give user ability to add tokens */}
                        <div id="makeToken">
                            <TokenForm deckID = {selectedDeck._id}
                            triggerReload={async () => setReloadDecks(!reloadDecks)}
                            />
                        </div>

                        {/* Show Tokens */}
                        <div className="tokens">
                            <TokenList reloadTokens={reloadDecks} deckID={selectedDeck._id}/>
                        </div>
                        
                    </div>
                )}

                {/* If there is no selected Deck Render something else */}
                {!selectedDeck && (
                    <h3 className="emptyToken">Select a deck to add or view</h3>
                )}


            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App/>);
}

window.onload = init;