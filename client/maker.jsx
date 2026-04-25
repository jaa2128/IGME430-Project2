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
const {BoardDeckList, Board} = require('./components/BoardComponents.jsx');

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

    console.log(name, imageString);

    helper.sendRequest('POST', '/addToken', {name, imageString, deckID}, onTokenAdded);
    return false;
}

// Handles what should happen when a token is clicked
const handlePlaceOnBoard = (token, onTokenPlaced) => {
    // Create a new client side instance of a Token
    const newInstance = {
        // smear token data
        ...token,

        // generate unique ID based off the current 
        // taken from https://stackoverflow.com/questions/3231459/how-can-i-create-unique-ids-with-javascript
        instanceID: 'id' + (new Date()).getTime(), 

        // starts off untapped
        isTapped: false,
    }

    // call the callback function, React passes in current state of
    // array
    onTokenPlaced((current) => [...current, newInstance]);
}

// Handle tapping a Token on the board
const handleTapToken = (instanceID, onTokenTapped) => {
    // return mapped array as React only changes state for when the variable changes
    // not for changes in internal state
    onTokenTapped((current) => current.map (token => 
        // For each token in the current array, check if the instanceID matches
        // if it is return that token with isTapped field flipped, if not, return the same token
        token.instanceID === instanceID ? {...token, isTapped: !token.isTapped} : token
    ));
}

const handleRemoveFromBoard = (instanceID, onTokenRemove) => {
    // return filtered array as React only changes state for when the variable changes
    // not for changes in internal state
    onTokenRemove((current) => current.filter(token => token.instanceID !== instanceID));
}

const AdComponent = (props) => {
    return (
        <div className={`ad-placeholder ${props.type}`}>
            <div className="ad-content">
                <p>This is an ad</p>
            </div>
        </div>
    )
}

/**
 * Func Component representing a whole 'page' where user can make and view Decks
 * @returns The entire Deck Creator View
 */
const DeckMakerView = () => {

    const [reloadDecks, setReloadDecks] = useState(false);
    const navigate = useNavigate();

    return (
        <div className='viewWrapper'>
            {/* Left Ad Pillar */}
            <AdComponent type="ad-left" />

            <div className="mainContent">
                {/* Deck Form */}
                <DeckForm triggerReload={()=> setReloadDecks(!reloadDecks)}/>
        
                {/* List of Decks */}
                <div className="decks">
                    <h2>Your Decks:</h2>
                        
                    {/* When a Deck in the DeckList is clicked on, navigate to that deck's view */}
                    <DeckList reloadDecks={reloadDecks}
                    onSelect={(deck) => {
                        helper.hideError();
                        navigate(`/collection/${deck._id}`)}
                    } 
                    triggerReload={()=> setReloadDecks(!reloadDecks)}
                    />
                </div>
            </div>
            
             {/* Left Ad Pillar */}
            <AdComponent type="ad-right" />
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

    // flag to determine whether are seeing the search results are visible
    const[showResults, setShowResults] = useState(false);

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
        <div className="viewWrapper">
            {/* Left Ad Pillar */}
            <AdComponent type="ad-left" />

            <div className='mainContent'>
                <div className="navLinks">
                    <Link className='reactLink' id='backToDecks' to='/deckPage' onClick={() => helper.hideError()}>&lt; Back to Decks</Link>
                    
                    <h2>Viewing: {name}</h2>

                    <Link className='reactLink' id='toBoard' to={`/board/${id}`}  onClick={() => helper.hideError()}>Play on Board &gt;</Link>
                </div>

                <div id="appMessage" class='hidden'>
                    <h3><span id="errorMessage"></span></h3>
                </div>

                <div className="searchArea">
                        <TokenSetSearchForm 
                        // Pass down params to show search results upon submitting 
                        showResults={showResults}
                        onSearchStarted={() => setShowResults(true)} 
                        setShowResults={setShowResults}

                         // Complete onTokenSelect Chain by defining the Form's onTokenSelect 
                         // callback function 
                        onTokenSelect={(selectedToken) => {
                            handleToken(selectedToken, () => {
                                setReloadDeck(!reloadDeck);
                            }, id);
                        }}/>
                        
                </div>
                {/* Always show Tokens in User's deck */}
                <div className="tokens">
                    <TokenList reloadTokens={reloadDeck} deckID={id} triggerReload={() => setReloadDeck(!reloadDeck)}/>
                </div>
            </div>

            {/* Left Ad Pillar */}
            <AdComponent type="ad-right" />
        </div>
        
    )
}

/**
 * Func Component representing a whole 'page' where users can make and add Tokens to a respective Deck
 * @returns the entire Deck View
 */
const BoardView = () => {
    // Grabs Deck Id from the URL (/collection/:id)
    const {id} = useParams();
    const [boardTokens, setBoardTokens] = useState([]); // variable to track Tokens on board
    const [name, setName] = useState(''); // used to set name when playing the deck

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
        <>
            <div className="viewWrapper">
                <div className="mainContent">

                    <div className="navLinks">
                        <Link className='reactLink' to={`/collection/${id}`}>&lt; Back to Deck</Link>
                    </div>
        
                     {/* Left Ad Pillar */}
                    <AdComponent type="banner" />
                    <h2>Playing: {name}</h2>
                        {/* Where Players can play their cards in their deck */}
                    <div className="boardDeck">
                        <BoardDeckList
                            deckID={id}
                            onPlace={(token) => handlePlaceOnBoard(token, setBoardTokens)}
                        />
                    </div>
        
                </div>
            </div>
            

            <div className="boardArea">
                <Board
                    boardTokens={boardTokens}
                    onTap={(instanceID) => handleTapToken(instanceID, setBoardTokens)}
                    onRemove={(instanceID) => handleRemoveFromBoard(instanceID, setBoardTokens)}
                />
            </div>
        </>
           

    )


}

const App = () => {
    return (
        <div>
                <Routes>
                   <Route path='/deckPage' element={<DeckMakerView/>}/>

                   <Route path='/collection/:id' element={<DeckView/>}/>

                   <Route path='/board/:id' element={<BoardView/>}/>
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