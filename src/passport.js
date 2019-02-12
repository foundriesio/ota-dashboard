const config = require('config');
const GitHubStrategy = require('passport-github2').Strategy;
const passport = require('passport');

const gitHubCfg = config.get('login').github;

if (!gitHubCfg.clientId) {
    throw new Error('Missing GitHub login integration, cannot continue');
}

function gitHubStrategy(req, accessTkn, refreshTkn, params, profile, done) {
    const data = profile._json;

    return done(null, {
        id: data.id,
        login: data.login,
        name: data.name,
        email: data.email
    });
}

passport.serializeUser((user, done) => {
    return done(null, user);
});

passport.deserializeUser((obj, done) => {
    return done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: gitHubCfg.clientId,
    clientSecret: gitHubCfg.clientSecret,
    callbackURL: gitHubCfg.callbackURL,
    scope: gitHubCfg.scope,
    session: true,
    failureRedirect: '/login/',
    passReqToCallback: true
}, gitHubStrategy));

module.exports = passport;
