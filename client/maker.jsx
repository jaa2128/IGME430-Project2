const helper = require('./helper.js');
// Base React
const React = require('react');
const {useState, useEffect} = React;
const {createRoot} = require('react-dom/client');

// React Router
const ReactRouterDOM = require('react-router-dom');
const { BrowserRouter, Routes, Route, Link, useNavigate, useParams} = ReactRouterDOM;

// Function to handle post requests to create a new Token
// pass in deckID to know which deck to add a Token to it
const handleToken = (e, onTokenAdded, deckID) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#tokenName').value;

    if(!name){
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost(e.target.action, {name, deckID}, onTokenAdded);
    return false;
}

// function to handle post request to create a Token Deck
const handleDeck = (e, onDeckAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#deckName').value;

    if(!name){
        helper.handleError('Collection name required');
        return false;
    }

    helper.sendPost(e.target.action, {name}, onDeckAdded);
}

// Func Component representing a Form to create a Token
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

// Func Component representing a List of Tokens
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

// Func Component representing a whole 'page' where user can make and view Decks
const DeckMakerView = (props) => {

    const [reloadDecks, setReloadDecks] = useState(false);
    const navigate = useNavigate();

    return (
        <div>
            {/* Deck Form */}
             <div id="makeDeck">
                <DeckForm triggerReload={()=> setReloadDecks(!reloadDecks)}/>
            </div>

            {/* List of Decks */}
            <div className="tokens">
                <h2>Your Decks:</h2>
                    
                {/* When a Deck in the DeckList is clicked on, navigate to that deck's view */}
                <DeckList reloadDecks={reloadDecks}
                onSelect={(deck) => navigate(`/collection/${deck._id}`)} 
                />
            </div>
        </div>
    );
}

// Func Component representing a whole 'page' where users can make and add Tokens to a respective Deck
const DeckView = () => {
    // Grabs Deck Id from the URL (/collection/:id)
    const {id} = useParams();
    const [reloadDeck, setReloadDeck] = useState(false); // flag to reload Deck from server
    const [name, setName] = useState(''); // used to set name when viewing the deck

    // Fetches the name for the UI
    useEffect(() => {
        const fetchName = async () => {
            const response = await fetch (`/getDeck?id=${id}`);
            const data = await response.json();
            setName(data.deck.name);
        };
        fetchName();
    }, [id]);

    return(
        <div id='selectedDeck'>
            <Link to='/maker'>
                &lt; Back to Collections            
            </Link>
            <h2>Viewing: {name}</h2>
            <div className="makeToken">
                <TokenForm deckID={id} triggerReload={() => setReloadDeck(!reloadDeck)} />
            </div>
            <div className="tokens">
                <TokenList reloadTokens={reloadDeck} deckID={id}/>
            </div>
        </div>
    )
}


const App = () => {
    return (
        <div>
            <Routes>
                <Route path='/maker' element={<DeckMakerView/>}/>

                <Route path='/collection/:id' element={<DeckView/>}/>
            </Routes>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    // wrap App in BrowserRouter to enable Routing using React
    root.render(<BrowserRouter>
                    <App/>
                </BrowserRouter>);
}

window.onload = init;