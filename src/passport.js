// Copyright 2019 Foundries.io Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
