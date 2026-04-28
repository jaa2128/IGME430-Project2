// Base React
const React = require('react');

/**
 * Generic Token List Component to help create Lists of Tokens
 * @param {object} props - This components properties
 * @returns - a list of token token nodes comprised of a component that's passed in
 */
const GenericTokenList = (props) => {

    const tokens = props.tokens; // array of tokens
    const emptyMessage = props.emptyMessage; // what should display if no tokens are present
    const Component = props.Component; // the component to render per token in the array
    const extraProps = props.extraProps; // array of props that may be important to a Token Component
    const listClassName = props.listClassName; // optional className

    // If there are no tokens
    if(tokens.length === 0){
        return (
                <h3 className="emptyList">{emptyMessage}</h3>
        );
    }

    // if there are tokens create a bunch of nodes to display tokens
    const tokenNodes = tokens.map(token => {
        return (
            // pass in the Token and any extra properties needed
            <Component token={token} {...extraProps}/>
        )
    });

    return (
        // If there is no className, use componentList by default
        <div className={listClassName || 'componentList'}>
            {tokenNodes}
        </div>
    )
}

module.exports ={
    GenericTokenList
}