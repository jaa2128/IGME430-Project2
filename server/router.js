const { get } = require('underscore');
const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
    app.get('/maker', mid.requiresLogin, controllers.Token.makerPage);
    app.post('/maker', mid.requiresLogin, controllers.Token.addToken);

    app.delete('/deleteToken', mid.requiresLogin, controllers.Token.deleteToken);

    app.get('/getDeck', mid.requiresLogin, controllers.TokenDeck.getDeck);
    app.get('/getDecks', mid.requiresLogin, controllers.TokenDeck.getDecks);
    app.post('/makeDeck', mid.requiresLogin, controllers.TokenDeck.makeDeck);

    app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
    app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
    app.get('/logout', mid.requiresLogin, controllers.Account.logout);
    app.post('/resetForgottenPassword', mid.requiresSecure, mid.requiresLogout, controllers.Account.resetForgottenPassword);

    app.get('/getTokensFromSet', controllers.ScryfallProxy.getTokensfromSet);


    app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

    // handle uncaught routes to /collection, prevents /collection refreshes from sending 404s
    app.get('/collection/{*splat}', mid.requiresLogin, controllers.Token.makerPage);

    // anything else, send to Not Found page
    app.get('/*splat', async (req, res) => {
        res.render('nofound');
    })
};

module.exports = router;