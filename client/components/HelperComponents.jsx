// Base React
const React = require('react');

const GenericTokenList = (props) => {
    const tokens = props.tokens;
    const emptyMessage = props.emptyMessage;
    const Component = props.Component;
    const extraProps = props.extraProps;
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