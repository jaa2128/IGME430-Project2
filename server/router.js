const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
    // --- TOKEN ROUTES ----------------------------------------------------------------------
    app.post('/addToken', mid.requiresLogin, controllers.Token.addToken);
    app.delete('/deleteToken', mid.requiresLogin, controllers.Token.deleteToken);

    // --- TOKEN DECK ROUTES -----------------------------------------------------------------
    app.get('/deckPage', mid.requiresLogin, controllers.TokenDeck.deckPage);
    app.get('/getDeck', mid.requiresLogin, controllers.TokenDeck.getDeck);
    app.get('/getDecks', mid.requiresLogin, controllers.TokenDeck.getDecks);
    app.post('/makeDeck', mid.requiresLogin, controllers.TokenDeck.makeDeck);
    app.delete('/deleteDeck', mid.requiresLogin, controllers.TokenDeck.deleteDeck);

    // --- ACCOUNT ROUTES --------------------------------------------------------------------
    app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
    app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
    app.get('/logout', mid.requiresLogin, controllers.Account.logout);
    app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
    app.post('/resetForgottenPassword', mid.requiresSecure, mid.requiresLogout, controllers.Account.resetForgottenPassword);
    app.get('/account', mid.requiresLogin, controllers.Account.accountPage);

    // --- SCRYFALL PROXY ROUTES -------------------------------------------------------------
    app.get('/getTokensFromSet', controllers.ScryfallProxy.getTokensfromSet);


    // default route
    app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

    // handle uncaught routes to /collection, prevents /collection refreshes from sending 404s
    app.get('/collection/{*splat}', mid.requiresLogin, controllers.TokenDeck.deckPage);
     app.get('/board/{*splat}', mid.requiresLogin, controllers.TokenDeck.deckPage);

    // anything else, send to Not Found page
    app.get('/*splat', async (req, res) => {
        res.render('nofound');
    })
};

module.exports = router;