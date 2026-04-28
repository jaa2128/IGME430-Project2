const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');

/**
 * function to handle changing a logged in user's password
 * @param {HTMLFormElement} e - the Form this function is called by
 * @returns - false if there is error, nothing if successful, essentially void
 */
const handlePasswordChange = (e) => {
    e.preventDefault();
    helper.hideError();

    const oldPass = e.target.querySelector('#oldPass').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    // if any of the fields are missing, show error
    if(!oldPass || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    // if passwords don't match, show error
    if(pass !== pass2){
        helper.handleError('New Passwords do not match!');
        return false;
    }

    helper.sendRequest('POST', e.target.action, {oldPass, pass, pass2});
    return false;
}

/**
 * Component meant to represent a change password on the Change Password page
 * @param {object} props - This components properties
 * @returns - A Form to change a user's password
 */
const ChangePasswordWindow = (props) => {
    return (
         <form id="changePasswordForm"
            name="changePasswordForm"
            onSubmit={handlePasswordChange}
            action="/changePassword"
            method='POST'
            className='mainForm'
        >
            <label htmlFor='oldPassword'>Old Password: </label>
            <input id='oldPass' type="text" name='oldPassword' placeholder='old password'/>
            <label htmlFor="pass">Password: </label>
            <input id='pass' type='password' name='pass' placeholder='new password'/>
            <label htmlFor="pass">Password: </label>
            <input id='pass2' type='password' name='pass2' placeholder='retype new password'/>
            <input className='formSubmit' type="submit" value="Reset Password" />

            <div id="appMessage" class='hidden'>
                <h3><span id="errorMessage"></span></h3>
            </div>
        </form>
    );
}

const init = () => {
    const root = createRoot(document.getElementById('content'));

    root.render(<ChangePasswordWindow/>);
};

window.onload = init;