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
