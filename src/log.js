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

const bunyan = require('bunyan');

const isProd = process.env.NODE_ENV === 'production';

const level = isProd ? bunyan.INFO : bunyan.DEBUG;
const safeCycles = bunyan.safeCycles;

const stdoutLevels = [
    'trace',
    'debug',
    'info',
    'warn'
];

const stderrLevels = [
    'error'
];

if (!isProd) {
    stdoutLevels.push('error');
}

function SpecificLevelStream(levels, stream) {
    this.levels = {};

    for (const level of levels) {
        this.levels[bunyan.resolveLevel(level)] = true;
    }

    this.stream = stream;
}

SpecificLevelStream.prototype.write = function (rec) {
    if (this.levels[rec.level] !== undefined) {
        this.stream.write(JSON.stringify(rec, safeCycles()) + '\n');
    }
};

const stdoutStream = new SpecificLevelStream(stdoutLevels, process.stdout);

const stderrStream = new SpecificLevelStream(stderrLevels, process.stderr);

const log = bunyan.createLogger({
    name: 'ota-dashboard',
    level: level,
    streams: [
        {
            level: 'trace',
            type: 'raw',
            stream: stdoutStream
        }
    ]
});

if (isProd) {
    log.addStream({
        level: 'error',
        type: 'raw',
        stream: stderrStream
    });
}

module.exports = log;
