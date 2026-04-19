const helper = require('../helper.js');
// Base React
const React = require('react');
const {useState, useEffect} = React;

// HeadlessUI used for dialog modal components
const HeadlessUI = require('@headlessui/react');
const {Description, Dialog, DialogPanel, DialogTitle} = HeadlessUI;

/**
 * function to handle post request to create a Token Deck
 * @param {HTMLFormElement} e - the Form this function is called by
 * @param {Function} onDeckAdded - callback function to be called upon this function's call
 * @returns - false if there is error, nothing if successful, essentially void
 */
const handleDeck = (e, onDeckAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#deckName').value;

    if(!name){
        helper.handleError('Deck name required');
        return false;
    }

    helper.sendRequest('POST', e.target.action, {name}, onDeckAdded);
}

const handleDeleteDeck = (deckID, onDeckDeleted) => {
    helper.sendRequest('DELETE', '/deleteDeck', {deckID}, onDeckDeleted);
    return false;
}

/**
 * Func Component representing a Form to create a Deck
 * @param {object} props - This components properties
 * @returns - A Form to create a new Deck
 */
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

/**
 * Funct Component to represent a Dialogue pop up 
 * NOTE: this code is partially copied from HeadlessUI documentation page
 * linked here: https://headlessui.com/react/dialog#installation
 * @param {object} props - This components properties
 * @returns - A list of this account's deck html components
 */
const DeleteConfirmDialog = (props) => {
    return (
    /*
      Pass `isOpen` to the `open` prop, and use `onClose` to set
      the state back to `false` when the user clicks outside of
      the dialog or presses the escape key.
    */
    <Dialog open={props.isOpen} onClose={props.onClose}>
        <div className="dialogueWrapper">
            <DialogPanel>
                <DialogTitle>Delete Deck?</DialogTitle>
                <Description>This will permanently delete your Deck</Description>
                <p>Are you sure you want to delete your deck? All Tokens in this deck will be lost.</p>

                <button onClick={props.onClose}>Cancel</button>
                <button onClick={props.onConfirm}>Delete Deck</button>
            </DialogPanel>
        </div>
      
    </Dialog>
    ) 
}

/**
 * Func Component representing a List of Decks
 * @param {object} props - This components properties
 * @returns - A list of this account's deck html components
 */
const DeckList = (props) => {
    // if props.decks is empty, use empty array for the state
    const [decks, setDecks] = useState([] || props.decks);

    // Track which Deck we might delete from the list, helps
    // determines whether we open Confirmation Dialog Box
    const[deckToDelete, setDeckToDelete] = useState(null);

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
            
            // When any of these Nodes are clicked call the onSelect callbackfunction
            // defined in DeckMakerView in maker.jsx
           <div key={deck._id}
           className='token'
           onClick={() => props.onSelect(deck)} 
           style={{cursor: 'pointer'}}
           >
            <img src='/assets/img/cards.png' alt='card face' className='cardface'/>
            <h3 className="tokenName">Deck: {deck.name}</h3>
            <h3 className="tokenAge">Number of Tokens: {deck.tokens.length}</h3>

            <button className="deleteDeck" 
                onClick={(e) => {
                    e.stopPropagation(); // prevents onClick from triggering
                    setDeckToDelete(deck._id); 
                }} 
                >
                <span className='deleteIcon'>-</span>
            </button>
           </div> 


        );
    });

    return (
        <div className="tokenList">
            {deckNodes}

            <DeleteConfirmDialog 
            isOpen={deckToDelete !== null}
            onClose={() => setDeckToDelete(null)} // closes window upon canceling
            onConfirm={() => {
                handleDeleteDeck(deckToDelete, () => {
                    props.triggerReload(); // reload The list
                    setDeckToDelete(null); // closes window upon confirmation
                })
            }}/>
        </div>
    )
}

module.exports = {
    DeckForm,
    DeckList
}