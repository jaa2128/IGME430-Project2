const helper = require('../helper.js');

// Base React
const React = require('react');
const {useState, useEffect} = React;

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

module.exports = {
      TokenSetSearchForm
}