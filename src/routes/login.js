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

const express = require('express');
const config = require('config');

const passport = require('../passport');

const router = express.Router();
const parseJson = express.json();

const loginPage = require('../pages/login');

function githubCallback(req, res, next, err, user) {
    if (err) {
        req.log.error(err);
    }

    return req.login(user, (error) => {
        if (error) {
            req.log.error(error);
        }

        if (res.locals.next) {
            res.redirect(res.locals.next);
        } else {
            res.redirect('/');
        }
    });
}

router.get('/', (req, res) => {
    return res.marko(loginPage, {
        next: res.locals.next,
        name: config.name
    });
});

router.get('/github', (req, res, next) => {
    const state = JSON.stringify({
        next: res.locals.next
    });
    const options = {
        state: Buffer.from(state).toString('base64'),
        failureRedirect: '/login/'
    };

    return passport.authenticate('github', options)(req, res, next);
});

router.get('/github/callback', parseJson, (req, res, next) => {
    if (req.query.state) {
        const state = JSON.parse(
            Buffer.from(req.query.state, 'base64').toString('utf-8'));

        if (state.next) {
            res.locals.next = state.next;
        }
    }

    return passport.authenticate('github', {failureRedirect: '/login/'}, githubCallback.bind(null, req, res, next))(req, res, next);
});

module.exports = router;
