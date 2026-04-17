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
const handleToken = (selectedToken, onTokenAdded, deckID) => {
    helper.hideError();

    const name = selectedToken.name;
    const imageString = selectedToken.imageString;

    helper.sendPost('/maker', {name, imageString, deckID}, onTokenAdded);
    return false;
}

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

// function to handle searches for a Token Set
const handleSetSearch = async (e, onResultsFound) => {
    e.preventDefault();
    helper.hideError();

    // grab set code and name
    const setCode = e.target.querySelector('#setCode').value;
    const setName = e.target.querySelector('#setName').value;

    // if neither are present display error
    if(!setCode && !setName){
        helper.handleError('Set Code or Name required for search');
        return [];
    }

    // setnd a fetch to proxy to get tokens
    const response = await fetch(`/getTokensFromSet?setCode=${setCode}&setName=${setName}`);
    const data = await response.json();

    onResultsFound(data.tokens);
}

// Component meant to represent List of Search Results
const SearchList = (props) => {
    // Since tokens will be passed in, no need for hook
    const tokens = props.tokens || [];

    if(tokens.length === 0){
        return (
            <div className="tokenList">
                <h3 className="emptyToken"> No Results found.</h3>
            </div>
        )
    }

    const tokenNodes = tokens.map((token) => {
        return(
            <div 
                key={token.id}
                className='token'
                onClick={() => props.onTokenSelect(token)} // when clicked
                style={{cursor: 'pointer'}}
            >
                {/* Use the token's image String to display */}
                <img src={token.imageString} alt='card' className='domoFace'/>
                <h3 className='tokenName'>{token.name}</h3>
            </div>
        )
    });

    return (
        <div className="tokenList">
            {tokenNodes}
        </div>
    )
}

const TokenSetSearchForm = (props) => {
    const [results, setResults] = useState([]);

    return(
        <div className="searchContainer">
            {/* Upon submission set Results to results of Search */}
            <form onSubmit={(e) => handleSetSearch(e, setResults)}>
                <label htmlFor="setCode"> Set Code: </label>
                <input type="text" id="setCode" name='setCode'/>

                <label htmlFor="setName"> Set Name: </label>
                <input type="text" id="setName" name='setName'/>

                <input type="submit" value="Search for Set" />
            </form>

            {/* Display the results from the search */}
            <div className="searchResults">
                <h2>Search Results:</h2>
                <SearchList tokens={results} onTokenSelect={(token) => props.onTokenSelect(token)}/>
            </div>
        </div>
    )
}

// Func Component representing a List of Tokens in a Deck
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

        if(props.deckID){
            loadTokensFromDeck();
        }
    }, [props.reloadTokens, props.deckID]);

    // If there are no tokens
    if(tokens.length === 0){
        return (
            <div className='deckList'>
                <h3 className="emptyToken">No Tokens Yet!</h3>
            </div>
        );
    }

    // Create a bunch of nodes to display tokens
    const tokenNodes = tokens.map(token => {
        return (
            <div key={token._id} className='token'>
                {/* TODO: replace image tag with something other than Domo */}
                <img src={token.imageString} alt="domo face" className="domoFace" />
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

            <div id="appMessage" class='hidden'>
                <h3><span id="errorMessage"></span></h3>
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

    // flag to determine whether or not User is searching for Tokens to add to deck
    const[isSearching, setIsSearching] = useState(false);

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
            <Link to='/maker'>&lt; Back to Collections</Link>
            <h2>Viewing: {name}</h2>

            {/* flip the flag, if the user is searching button displays appropriately */}
            <button className="makeTokenSubmit" onClick={() => setIsSearching(!isSearching)}>
                {isSearching ? 'Cancel Search' : '+ Find New Cards for Deck'}
            </button>

            {isSearching && (
                <div className="searchArea">
                        <TokenSetSearchForm onTokenSelect={(selectedToken) => {
                            handleToken(selectedToken, () => {
                                setReloadDeck(!reloadDeck);
                            }, id);
                        }}/>
                </div>
            )}

            {/* Always show Tokens in User's deck */}
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