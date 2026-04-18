const { redirect } = require('react-router-dom');
const models = require('../models');
const Account = models.Account;

const loginPage = (req, res) => {
    return res.render('login');
};

const logout = (req, res) => {
    req.session.destroy();
    return res.redirect('/');
};


const login = (req, res) => {
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;

    if(!username || !pass){
        return res.status(400).json({error: 'All fields are required' });
    }

    return Account.authenticate(username, pass, (err, account) => {
        if(err||!account){
            return res.status(401).json({error: 'Wrong username or password!'});
        }

        req.session.account = Account.toAPI(account);

        return res.json({redirect: '/maker'});
    })
};

const signup = async (req, res) => {
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;
    const pass2 = `${req.body.pass2}`;

    if(!username || !pass || !pass2){
        return res.status(400).json({error: 'All fields are required!'});
    }

    if(pass !== pass2) {
        return res.status(400).json({error: 'Passwords do not match!'});
    }

    try{
        const hash = await Account.generateHash(pass);
        const newAccount = new Account({username, password: hash});
        await newAccount.save();
        req.session.account = Account.toAPI(newAccount);
        return res.json({redirect: '/maker'});
    } catch (err){
        console.log(err);
        if(err.code === 11000){
            return res.status(400).json({error: 'Username already in use!'});
        }
        return res.status(500).json({error: 'An error occured!'});
    }
};

const resetForgottenPassword = async (req, res) => {

    // ensure request body has all proper fields similar to signup
    const username = `${req.body.username}`;
    const pass = `${req.body.pass}`;
    const pass2 = `${req.body.pass2}`;

    if(!username || !pass || !pass2){
        return res.status(400).json({error: 'All fields are required!'});
    }

    if(pass !== pass2) {
        return res.status(400).json({error: 'New Passwords do not match!'});
    }

    try{
        // Attempt to find user in database by username
        const account = await Account.findOne({username});

        if(!account){
            return res.status(404).json({error: 'User not found'});
        }

        const newHash = await Account.generateHash(pass);
        account.password = newHash;
        account.save();

        // redirect to /login
        return res.json({redirect: '/login'});
    } catch (err){
        console.log(err);
        return res.status(500).json({error: 'An error occured!'});
    }
}

const changePassword = async (req, res) => {
    const oldPass = `${req.body.oldpass}`;
    const pass = `${req.body.pass}`;
    const pass2 = `${req.body.pass2}`;

    // get the username of the account for verification
    const username = req.session.account.username;

    if(!oldPass || !pass || !pass2){
        return res.status(400).json({error: 'All fields are required!'});
    }

    if(pass !== pass2) {
        return res.status(400).json({error: 'New Passwords do not match!'});
    }

    if(oldPass === pass){
        return res.status(400).json({error: 'New password must be different from old password'});
    }

    return Account.authenticate(username, oldPass, async (err, account) => {
        // if there is no account based off the username and old password, 
        // the old password was incorrect
        if(err || !account){
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // if the account was authenticated based off username and old password
        // we can update and save the new password
        const newHash = await Account.generateHash(pass);
        account.password = newHash;
        await account.save();

        return res.json({redirect: '/maker'});
    })


}

module.exports = {
    loginPage, 
    login, 
    logout, 
    signup,
    resetForgottenPassword,
    changePassword
};