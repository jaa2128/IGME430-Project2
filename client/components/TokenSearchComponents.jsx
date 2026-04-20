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
        return [];
    }

    // setnd a fetch to proxy to get tokens
    const response = await fetch(`/getTokensFromSet?setCode=${setCode}&setName=${setName}`);
    const data = await response.json();

    onResultsFound(data.tokens);
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
            className='token'
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

                {/* passes in the tokens found in search results and passes in the onTokenSelect
                    callback function defined in DeckView in maker.jsx */}
                <SearchList tokens={results} 
                onTokenSelect={(token) => props.onTokenSelect(token)}/> 
            </div>
        </div>
    )
}

module.exports = {
      TokenSetSearchForm
}