const helper = require('./helper.js');
const React = require('react');
const {useState, useEffect} = React;
const {createRoot} = require('react-dom/client');

// Function to handle post requests to create a new Domo
// pass in collectionID to know which collection to add a Domo to
const handleDomo = (e, onDomoAdded, collectionID) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#domoName').value;
    const age = e.target.querySelector('#domoAge').value;
    const level = e.target.querySelector('#domoLevel').value;

    if(!name || !age || !level){
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost(e.target.action, {name, age, level, collectionID}, onDomoAdded);
    return false;
}

// function to handle post request to create a Collection
const handleCollection = (e, onCollectionAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#collName').value;

    if(!name){
        helper.handleError('Collection name required');
        return false;
    }

    helper.sendPost(e.target.action, {name}, onCollectionAdded);
}

const DomoForm = (props) => {
    return(
        <form id='domoForm'
            onSubmit={(e) => handleDomo(e, props.triggerReload, props.collectionID)}
            name='domoForm'
            action='/maker'
            method='POST'
            className='domoForm'
        >
            <label htmlFor='name'>Name: </label>
            <input id="domoName" type="text" name='name' placeholder='Domo Name'/>
            <label htmlFor='age'>Age: </label>
            <input id='domoAge' type='number' min='0' name='age'/>
            <label htmlFor='level'>Level: </label>
            <input id='domoLevel' type='number' min='1' name='level'/>
            <input className='makeDomoSubmit' type='submit' value="Make Domo"/>
        </form>
    );
};

const DomoList = (props) => {
    
    const [domos, setDomos] = useState([]);

     useEffect(() => {
        // grab domos from the collection we are viewing
        const loadDomosFromCollection = async () => {
            const response = await fetch(`/getCollection?id=${props.collectionID}`);
            const data = await response.json();
            setDomos(data.collection.domos || []);
        };

        if(props.collectionID){
            loadDomosFromCollection();
        }
    }, [props.reloadDomos, props.collectionID]);

    if(domos.length === 0){
        return (
            <div className='domoList'>
                <h3 className="emptyDomo">No Domos Yet!</h3>
            </div>
        );
    }

    const domoNodes = domos.map(domo => {
        return (
            <div key={domo._id} className='domo'>
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
                <h3 className="domoName">Name: {domo.name}</h3>
                <h3 className="domoAge">Age: {domo.age}</h3>
                <h3 className="domoLevel">Level : {domo.level}</h3>
            </div>
        )
    });

    return (
        <div className="domoList">
            {domoNodes}
        </div>
    )
}

const CollectionForm = (props) => {
    return (
        <form onSubmit={(e) => handleCollection(e, props.triggerReload)}
        name='collectionForm'
        action='/makeCollection'
        method='POST'
        className='domoForm'>
            <label htmlFor='collName'>New Collection: </label>
            <input type="text" id="collName" placeholder='Collection Name' name='collName'/>
            <input type="submit" className="makeDomoSubmit" value='Create Collection'/>
        </form>
    )
}

const CollectionList = (props) => {
    // if props.collections is empty, use empty array for the state
    const [collections, setCollections] = useState([] || props.collections);

    // effect that reloads collections from the server whenever reloadCollections
    // Changes, this occurs in the App Component
    useEffect(() => {
        const loadCollectionsFromServer = async () => {
            const response = await fetch('/getCollections');
            const data = await response.json();
            setCollections(data.collections);
        };
        loadCollectionsFromServer();
    }, [props.reloadCollections]);

    if(collections.length === 0){
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Collections</h3>
            </div>
        );
    }

    const collectionNodes = collections.map(collection => {
        return (
           <div key={collection._id}
           className='domo'
           onClick={() => props.onSelect(collection)} // when clicked use callback function onSelect
           style={{cursor: 'pointer'}}
           >
            <img src='/assets/img/domoface.jpeg' alt='domo face' className='domoFace'/>
            <h3 className="domoName">Collection: {collection.name}</h3>
            <h3 className="domoAge">Number of Domos: {collection.domos.length}</h3>
           </div> 
        );
    });

    return (
        <div className="domoList">
            {collectionNodes}
        </div>
    )
}

const App = () => {
    // flag to trigger reloads from server
    const[reloadCollections, setReloadCollections] = useState(false);

    // flag to tell app which collection is selected
    const [selectedCollection, setSelectedCollection] = useState(null);

    return (
        <div>
            <div id="makeCollection">
                <CollectionForm triggerReload={()=> setReloadCollections(!reloadCollections)}/>
            </div>

            <div className="container">
                <div className="domos">
                    <h2>Your Collections:</h2>
                    <CollectionList reloadCollections={reloadCollections}
                    onSelect={(coll) => setSelectedCollection(coll)} // when clicked on, selectedCollection is changed
                    />
                </div>

                <hr/>

                {/* Using conditional rendering, if a selected Collection exists
                    Render the DomoForm and display Domos
                */}
                {selectedCollection && (
                    <div id="selectedCollection">
                        <h2>Viewing: {selectedCollection.name}</h2>

                        {/* give user ability to add domos */}
                        <div id="makeDomo">
                            <DomoForm collectionID = {selectedCollection._id}
                            triggerReload={async () => setReloadCollections(!reloadCollections)}
                            />
                        </div>

                        {/* Show Domos */}
                        <div className="domos">
                            <DomoList reloadDomos={reloadCollections} collectionID={selectedCollection._id}/>
                        </div>
                        
                    </div>
                )}

                {/* If there is no selected Collection Render something else */}
                {!selectedCollection && (
                    <h3 className="emptyDomo">Select a collection to add or view</h3>
                )}


            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App/>);
}

window.onload = init;