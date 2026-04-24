const helper = require('../helper.js');

// Base React
const React = require('react');
const {useState, useEffect} = React;

// GenericTokenList helper component
const {GenericTokenList} = require('./HelperComponents.jsx');

/**
 * function to handle searches for a Token Set
 * @param {HTMLFormElement} e - the Form this function is called by
 * @param {Function} onResultsFound - callback function to be called upon this function's call
 * @returns - all tokens found within this search request
 */
const handleSetSearch = async (e, onResultsFound) => {
    e.preventDefault();
    helper.hideError();

    // grab set code and name trim and remove spaces
    const setCode = e.target.querySelector('#setCode').value.trim().replaceAll(' ', '');
    const setName = e.target.querySelector('#setName').value.trim().replaceAll(' ', '');

    // if neither are present display error
    if(!setCode && !setName){
        helper.handleError('Set Code or Name required for search');
        return false; // request was not valid return false;
    }

    // setnd a fetch to proxy to get tokens
    const response = await fetch(`/getTokensFromSet?setCode=${setCode}&setName=${setName}`);
    const data = await response.json();

    // check if there are tokens before calling the callback function
    onResultsFound(data.tokens);
    return true; // request was successful return true;
}


/**
 * Component meant to represent A Token found in a list of search results
 * @param {object} props - This components properties
 * @returns - A Token in the form of Html Elements
 */
const SearchResultToken = (props) => {
    const token = props.token;
    const onTokenSelect = props.onTokenSelect;

    return (
        <div 
            key={token.id}
            className='resultToken'
            onClick={() => onTokenSelect(token)} // when clicked pass the token to the callback function
            style={{cursor: 'pointer'}}
        >
            {/* Use the token's image String to display */}
            <img src={token.imageString} alt='card face' className='cardFace'/>
            <h3 className='tokenName'>{token.name}</h3>
        </div>
    )
}

/**
 * Component meant to represent List of Search Results
 * @param {object} props - This components properties
 * @returns - A List of Token html elements
 */
const SearchList = (props) => {
    // Since tokens will be passed in, no need for hook
    const tokens = props.tokens || [];

    return(
        <GenericTokenList 
        tokens={tokens}
        emptyMessage='No Results Found'
        Component={SearchResultToken}
        extraProps={{onTokenSelect: props.onTokenSelect}}
        />
    )
}

/**
 * Component meant to represent the Search form for a Token Set
 * @param {object} props - This components properties
 * @returns - A List of Token html elements
 */
const TokenSetSearchForm = (props) => {
    const [results, setResults] = useState([]);

    const[isRequestMade, setIsRequestMade] = useState(false);

    const onTokenSelect = props.onTokenSelect;
    const showResults = props.showResults;
    const onSearchStarted = props.onSearchStarted;
    const setShowResults = props.setShowResults;

    return(
        <div className="searchContainer">
            <h3 className="searchLabel">Search for a Set to add Tokens from</h3>
            {/* Upon submission set Results to results of Search */}
            <form id='tokenSetSearchForm' className='searchForm' onSubmit={ async (e) => {
                // set request flag to the result of this function
                // essentially determines if the request was made from the client  
                // we await since the function is async
                const requestSuccess = await handleSetSearch(e, setResults);
                setIsRequestMade(requestSuccess);
                onSearchStarted();
            }}>
                <label htmlFor="setCode"> Set Code: </label>
                <input type="text" id="setCode" name='setCode' placeholder='e.g. M3C'/>

                <label htmlFor="setName"> Set Name: </label>
                <input type="text" id="setName" name='setName' placeholder='e.g. Modern Horizons 3 Commander'/>

                <input type="submit" value="Search for Set" />
            </form>

            {/* Display the results from the search if a request
                was successfully sent from the client
            */}
            {(showResults && isRequestMade) && (
                <div className="searchResults">
                    <h2>Search Results:</h2>

                    {/* passes in the tokens found in search results and passes in the onTokenSelect
                        callback function defined in DeckView in maker.jsx */}
                    <SearchList tokens={results} 
                    onTokenSelect={(token) => onTokenSelect(token)}/> 

                    <button className="makeDeckSubmit" style={{marginTop: '10px'}} onClick={() => {
                        setShowResults(false);
                        setResults([])}}>
                        Hide Search Results
                    </button>
                </div>
            )}
            
            
        </div>
    )
}

module.exports = {
      TokenSetSearchForm
}