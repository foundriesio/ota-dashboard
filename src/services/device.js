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
const fs = require('fs');
const jwt = require('jsonwebtoken');
const util = require('util');

const Remote = require('./remote').Remote;

const readFile = util.promisify(fs.readFile);
const jwtSign = util.promisify(jwt.sign);

const DEVICES_CFG = config.get('devices') || {};

const JWT_SECRET_FILE = DEVICES_CFG.jwtSecretFile || process.env.JWT_SECRET_FILE;

if (!JWT_SECRET_FILE) {
    throw new Error('No JWT_SECRET_FILE defined, cannot continue');
}

async function jwtKey() {
    const read = await readFile(JWT_SECRET_FILE);
    return Buffer.from(read).toString('utf-8').trim();
}

class DeviceServer extends Remote {
    constructor() {
        super(DEVICES_CFG.url);
        this.follows = true;
        this.path = '';
    }
}

DeviceServer.prototype._pre = async function(user) {
    const options = {
        rejectUnauthorized: false,
        followRedirects: this.follows
    };

    if (user) {
        const data = {
            id: user.id,
            email: user.email,
            name: user.name,
            login: user.login
        };

        const token = await jwtSign(data, await jwtKey(), {
            algorithm: 'HS256',
            expiresIn: Date.now() + (DEVICES_CFG.tokenExpires * 1000)
        });

        options.headers = {
            'Authorization': `JWT-Bearer ${token}`
        };
    }

    return options;
};

DeviceServer.prototype._get = async function(path, query, user) {
    return this.get(path, query, await this._pre(user));
};

DeviceServer.prototype.list = async function(user, query) {
    return await this._get('/', query, user);
};

DeviceServer.prototype.find = async function(user, device, query) {
    return await this._get(`${device}/`, query, user);
};

DeviceServer.prototype.updates = async function(user, device, query) {
    return await this._get(`${device}/updates/`, query, user);
};

DeviceServer.prototype.requestUpdate = async function(user, device, stream, hash) {
    const data = JSON.stringify({'image': {'hash': hash}});
    const path = `${device}/`;
    const query = {'stream': stream};

    const options = await this._pre(user);
    options.headers['Content-type'] = 'application/json';

    return await this.put(path, data, query, options);
};

DeviceServer.prototype.remove = async function(user, device, stream) {
    const path = `${device}/`;
    const query = {'stream': stream};

    const options = await this._pre(user);

    return this.delete(path, query, options);
};

DeviceServer.prototype.update = async function(user, device, stream, data) {
    const path = `${device}/`;
    const query = {'stream': stream};
    const payload = JSON.stringify(data);

    const options = await this._pre(user);
    options.headers['Content-Type'] = 'application/json';

    return this.patch(path, payload, query, options);
};

module.exports.DeviceServer = new DeviceServer();
