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
