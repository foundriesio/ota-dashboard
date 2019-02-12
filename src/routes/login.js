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
