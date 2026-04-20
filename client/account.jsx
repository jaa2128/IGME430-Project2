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

    const oldPass = e.target.querySelector('#olfPass').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

  
    if(!oldPass || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if(pass !== pass2){
        helper.handleError('New Passwords do not match!');
        return false;
    }

    helper.sendRequest('POST', e.target.action, {oldPass, pass, pass2});
    return false;
}

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
        </form>
    );
}

const init = () => {
    const root = createRoot(document.getElementById('content'));

    root.render(<ChangePasswordWindow/>);
};

window.onload = init;