/**
 * Restricts access to authenticated users only
 * @param {Request} req - request object
 * @param {Response} res - response object
 * @param {import("express").NextFunction} next - next middleware function
 * @returns 
 */
const requiresLogin = (req, res, next) => {
    if(!req.session.account){
        return res.redirect('/');
    }
    return next();
}

/**
 * Restricts access to unauthenticated users only
 * @param {Request} req - request object
 * @param {Response} res - response object
 * @param {import("express").NextFunction} next - next middleware function
 * @returns 
 */
const requiresLogout = (req, res, next) => {
    if(req.session.account) {
        return res.redirect('/deckPage');
    }

    return next();
}

/**
 * Enforces HTTPS connections redirects nonsecure requests to the https
 * equivalent of the current URL
 * @param {Request} req - request object
 * @param {Response} res - response object
 * @param {import("express").NextFunction} next - next middleware function
 * @returns 
 */
const requiresSecure = (req, res, next) => {
    if(req.headers['x-forwarded-proto'] !== 'https'){
        return res.redirect(`https://${req.hostname}${req.url}`);
    }
    return next();
}


/**
 * bypasses security checks in non-production environments
 * @param {Request} req - request object
 * @param {Response} res - response object
 * @param {import("express").NextFunction} next - next middleware function
 * @returns 
 */
const bypassSecure = (req, res, next) => {
    next();
}

module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;

if(process.env.NODE_ENV === 'production'){
    module.exports.requiresSecure = requiresSecure;
} else{
    module.exports.requiresSecure = bypassSecure;

}