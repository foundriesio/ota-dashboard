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
const express = require('express');
const Future = require('bluebird');
const multer = require('multer');

const DeviceServer = require('../services/device').DeviceServer;

const textMultiPartForm = multer().none();

const deviceListPage = require('../pages/device-list');
const devicePage = require('../pages/device');

const router = express.Router();

async function fnWrapper(log, fn, ...args) {
    return new Future((resolve, reject) => {
        try {
            return resolve(fn(...args));
        } catch (err) {
            log.error(err);
            return reject(new Error());
        }
    });
}

async function multiFnWrapper(log, fns, ...args) {
    return new Future((resolve, reject) => {
        try {
            return resolve(Future.all(fns.map((fn) => {
                return fn(...args);
            })));
        } catch (err) {
            log.error(err);
            return reject(new Error());
        }
    });
}

router.get('/', (req, res) => {
    return res.marko(deviceListPage, {
        deviceProvider: fnWrapper(
            req.log,
            DeviceServer.list.bind(DeviceServer),
            res.locals.user
        ),
        name: config.name
    });
});

router.get('/:device', (req, res) => {
    const device = req.params.device;
    const stream = req.query.stream;

    const query = {stream: stream};

    return res.marko(devicePage, {
        device: device,
        stream: stream,
        dataProvider: multiFnWrapper(
            req.log,
            [DeviceServer.find.bind(DeviceServer), DeviceServer.updates.bind(DeviceServer)],
            res.locals.user,
            device,
            query
        ),
        name: config.name
    });
});

router.post('/:device/applyupdate', [textMultiPartForm], async (req, res) => {
    const device = req.body.device;
    const stream = req.body.stream;
    const hash = req.body.hash;

    try {
        const response = await DeviceServer.requestUpdate(res.locals.user, device, stream, hash);
        const target = response.body['target-image'].custom.version;

        res.json({
            status: `Updating to ${target}`,
            message: `The device ${device} is being updated to ${target}.`
        });
    } catch (err) {
        req.log.error(err);

        if (err.status === 412) {
            res.status(400).json({message: 'Another update is already running.'});
            return;
        }

        res.status(500).json({
            message: `There was an error trying to update the device ${device}.`
        });
    }
});

router.post('/:device/autoupdate', [textMultiPartForm], async (req, res) => {
    let message;

    const autoUpdate = req.body.autoupdate;
    const stream = req.body.stream;
    const device = req.body.device;

    const data = {
        'auto-updates': true
    };

    message = `Auto updates for device ${device} enabled.`;
    if (autoUpdate === 'off') {
        message = `Auto updates for device ${device} disabled.`;
        data['auto-updates'] = false;
    }

    try {
        await DeviceServer.update(res.locals.user, device, stream, data);
        res.json({message: message});
    } catch (err) {
        req.log.error(err);

        res.status(500).json({
            message: `Error enabling/disabling auto updates for device ${device}`
        });
    }
});

module.exports = router;
