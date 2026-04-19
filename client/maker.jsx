const helper = require('./helper.js');
// Base React
const React = require('react');
const {useState, useEffect} = React;
const {createRoot} = require('react-dom/client');

// React Router
const ReactRouterDOM = require('react-router-dom');
const { BrowserRouter, Routes, Route, Link, useNavigate, useParams} = ReactRouterDOM;

// Imported Components
const {DeckForm, DeckList} = require('./components/DeckComponents.jsx');
const {TokenList} = require('./components/TokenComponents.jsx');
const {TokenSetSearchForm} = require('./components/TokenSearchComponents.jsx');

/**
 * Function to handle post requests to create a new Token
 * pass in deckID to know which deck to add a Token to it
 * @param {Object} selectedToken - The selected token to add to Deck
 * @param {Function} onTokenAdded - Callback function to trigger upon function call
 * @param {String} deckID - Id of the deck the token will be added to
 * @returns 
 */
const handleToken = (selectedToken, onTokenAdded, deckID) => {
    helper.hideError();

    const name = selectedToken.name;
    const imageString = selectedToken.imageString;

    helper.sendRequest('POST', '/addToken', {name, imageString, deckID}, onTokenAdded);
    return false;
}

/**
 * Func Component representing a whole 'page' where user can make and view Decks
 * @returns The entire Deck Creator View
 */
const DeckMakerView = () => {

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
                triggerReload={()=> setReloadDecks(!reloadDecks)}
                />
            </div>
        </div>
    );
}


/**
 * Func Component representing a whole 'page' where users can make and add Tokens to a respective Deck
 * @returns the entire Deck View
 */
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
            <Link to='/deckPage'>&lt; Back to Collections</Link>
            <h2>Viewing: {name}</h2>

            {/* flip the flag, if the user is searching button displays appropriately */}
            <button className="makeTokenSubmit" onClick={() => setIsSearching(!isSearching)}>
                {isSearching ? 'Cancel Search' : '+ Find New Cards for Deck'}
            </button>

            {isSearching && (
                <div className="searchArea">
                        {/* Complete onTokenSelect Chain by defining the Form's onTokenSelect 
                            callback function */}
                        <TokenSetSearchForm onTokenSelect={(selectedToken) => {
                            handleToken(selectedToken, () => {
                                setReloadDeck(!reloadDeck);
                            }, id);
                        }}/>
                </div>
            )}

            {/* Always show Tokens in User's deck */}
            <div className="tokens">
                <TokenList reloadTokens={reloadDeck} deckID={id} triggerReload={() => setReloadDeck(!reloadDeck)}/>
            </div>
        </div>
    )
}


const App = () => {
    return (
        <div>
            <Routes>
                <Route path='/deckPage' element={<DeckMakerView/>}/>

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