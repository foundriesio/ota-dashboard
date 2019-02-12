const config = require('config');
const session = require('express-session');

const serverCfg = config.get('server');

const sessionCfg = {
    key: serverCfg.sessionKey,
    secret: serverCfg.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        domain: serverCfg.cookieDomain,
        secure: serverCfg.secureCookie,
        maxAge: 172800000
    }
};

module.exports = session(sessionCfg);
