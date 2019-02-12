const cuid = require('cuid');
const express = require('express');
const path = require('path');

require('marko/express');

const log = require('./log');
const passport = require('./passport');
const session = require('./session');

const isProd = process.env.NODE_ENV === 'production';
const assetsDir = '../assets';
const assetsMaxAge = isProd ? '1y': '1m';

const app = express();

app.use(
    '/favicon.ico',
    express.static(path.join(__dirname, assetsDir, 'img', 'favicon.ico'), {
        index: false,
        maxAge: assetsMaxAge,
        fallthrough: false
    })
);

app.use(
    '/static',
    express.static(path.join(__dirname, assetsDir), {
        index: false,
        maxAge: assetsMaxAge,
        fallthrough: false
    })
);

app.use(session);

// TODO: passport github
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.next = req.query.next;
    res.locals.reqId = req.session.reqId = cuid();
    req.log = res.log = log.child({reqId: res.locals.reqId});

    next();
});

// The /login route.
app.use('/login', require('./routes/login'));

app.get('/logout', (req, res) => {
    if (req.isAuthenticated()) {
        req.session.destroy(() => {
            req.logout();
        });
    } else {
        return res.redirect('/login/');
    }

    if (res.locals.next) {
        return res.redirect(res.locals.next);
    }

    return res.redirect('/login/');
});

// Force auth on everything.
app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        const nextTo =
            res.locals.next ||
            (req.originalUrl.startsWith('/login') ? null : req.originalUrl);

        if (nextTo) {
            res.redirect(`/login/?next=${nextTo}`);
        } else {
            res.redirect('/login/');
        }
    }
});

app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.authenticated = req.isAuthenticated();

    next();
});

// The / route that handles the devices.
app.use('/', require('./routes/devices'));

app.use('*', (req, res, next) => {
    req.log.warn(
        `Requested non existing page ${req.originalUrl} from ${req.ip}`
    );

    setImmediate(next.bind(next), new Error('Not found'));
});

// app.use((err, req, res, next) => {
//     if (err instanceof errors.LoginError) {
//         req.session.destroy(() => {
//             req.logout();
//         });
//     }
//
//     process.nextTick(next.bind(next), err);
// });

// TODO
// app.use((err, req, res, next) => {
//     let view;
//
//     view = 'errors/generic.html';
//     if (err.status < 499) {
//         view = 'errors/400.html';
//     }
//
//     if (err.status === 404) {
//         view = 'errors/404.html';
//     }
//
//     if (err.status > 499) {
//         view = 'errors/500.html';
//     }
//
//     process.nextTick(res.render, view, {
//         title: `${appTitle} &ndash; Error`,
//         err: err,
//         reqId: res.locals.reqId
//     });
// });

module.exports = app;
