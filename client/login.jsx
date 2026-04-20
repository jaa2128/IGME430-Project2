const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');

/**
 * function to handle user login
 * @param {HTMLFormElement} e - the Form this function is called by
 * @returns - false if there is error, nothing if successful, essentially void
 */
const handleLogin = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if(!username || !pass){
        helper.handleError('Username or password is empty');
        return false;
    }

    helper.sendRequest('POST', e.target.action, {username, pass});
    return false;
}

/**
 * function to handle resetting forgotten password
 * @param {HTMLFormElement} e - the Form this function is called by
 * @returns - false if there is error, nothing if successful, essentially void
 */
const handleResetForgottenPassword = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

  
    if(!username || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if(pass !== pass2){
        helper.handleError('New Passwords do not match!');
        return false;
    }

    helper.sendRequest('POST', e.target.action, {username, pass, pass2});
    return false;
}

/**
 * function to handle user signup
 * @param {HTMLFormElement} e - the Form this function is called by
 * @returns - false if there is error, nothing if successful, essentially void
 */
const handleSignup = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if(!username || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if(pass !== pass2){
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendRequest('POST', e.target.action, {username, pass, pass2});
    return false;
}

/**
 * Func Component representing a Form to Login
 * @param {object} props - This components properties
 * @returns - A Form to Login
 */
const LoginWindow = (props) => {
    return (
        <div className="mainForm">
            <form id = "loginForm"
            name = "loginForm"
            onSubmit={handleLogin}
            action="/login"
            method='POST'
            >
                <label htmlFor='username'>Username: </label>
                <input id='user' type="text" name='username' placeholder='username'/>
                <label htmlFor="pass">Password: </label>
                <input id='pass' type='password' name='pass' placeholder='password'/>
                <input className='formSubmit' type="submit" value="Sign in" />
            </form>

            <a id="resetPasswordButton" 
                onClick={(e) => {
                    e.preventDefault();
                    props.showForgotScreen();
                }}
                href=''
            >Forgot Password?</a>
        </div>
        
        
    );
}

/**
 * Func Component representing a Form to Signup
 * @param {object} props - This components properties
 * @returns - A Form to Signup
 */
const SignupWindow = (props) => {
    return (
         <form id = "signupForm"
            name = "signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method='POST'
            className='mainForm'
        >
            <label htmlFor='username'>Username: </label>
            <input id='user' type="text" name='username' placeholder='username'/>
            <label htmlFor="pass">Password: </label>
            <input id='pass' type='password' name='pass' placeholder='password'/>
            <label htmlFor="pass">Password: </label>
            <input id='pass2' type='password' name='pass2' placeholder='retype password'/>
            <input className='formSubmit' type="submit" value="Sign up" />
        </form>
    );
}

const ForgotPasswordWindow = (props) => {
    return (
         <form id="forgotPasswordForm"
            name="forgotPasswordForm"
            onSubmit={handleResetForgottenPassword}
            action="/resetForgottenPassword"
            method='POST'
            className='mainForm'
        >
            <label htmlFor='username'>Username: </label>
            <input id='user' type="text" name='user' placeholder='username'/>
            <label htmlFor="pass">Password: </label>
            <input id='pass' type='password' name='pass' placeholder='new password'/>
            <label htmlFor="pass">Password: </label>
            <input id='pass2' type='password' name='pass2' placeholder='retype new password'/>
            <input className='formSubmit' type="submit" value="Reset Password" />
        </form>
    );
}

const init = () => {
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');

    const root = createRoot(document.getElementById('content'));

    const showForgotScreen = () => root.render(<ForgotPasswordWindow/>);

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<LoginWindow />);
        return false;
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<SignupWindow />);
        return false;
    });

    root.render(<LoginWindow showForgotScreen={showForgotScreen}/>);
};

window.onload = init;