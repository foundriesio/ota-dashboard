const url = require('url');
const path = require('path');

const request = require('request-promise');

const DEFAULT_CONTENT_TYPE = 'application/json';

class Remote {
    constructor(uri) {
        this.uri = uri;
        this.contentType = DEFAULT_CONTENT_TYPE;
        this.options = {
            promise: require('bluebird')
        };
        this.headers = {};
    }

    static prepare(uri, pathname, query) {
        const reqURL = new url.URL(uri);

        if (pathname && pathname.length > 0) {
            if (reqURL.pathname) {
                reqURL.pathname = path.join(reqURL.pathname, pathname);
            } else {
                reqURL.pathname = pathname;
            }
        }

        if (query && (Array.isArray(query) || query.length > 0)) {
            reqURL.search = `?${request.queryfy(query)}`;
        }

        return url.format(reqURL);
    }
}

Remote.prototype._options = function(options) {
    const opts = Object.assign({}, options);
    const headers = Object.assign({}, this.headers, opts.headers);

    delete opts.headers;

    const merged = Object.assign({}, this.options, opts);

    merged.headers = headers;

    return merged;
};

Remote.prototype.get = function(path, query, options = {}) {
    return request.get(
        Remote.prepare(this.uri, path, query),
        this._options(options)
    );
};

Remote.prototype.post = function(path, data, query, options = {}) {
    return request.post(
        Remote.prepare(this.uri, path, query),
        data,
        this._options(options)
    );
};

Remote.prototype.put = function(path, data, query, options = {}) {
    return request.put(
        Remote.prepare(this.uri, path, query),
        data,
        this._options(options)
    );
};

Remote.prototype.delete = function(path, query, options = {}) {
    return request.delete(
        Remote.prepare(this.uri, path, query),
        this._options(options)
    );
};

Remote.prototype.patch = function(path, data, query, options = {}) {
    return request.patch(
        Remote.prepare(this.uri, path, query),
        data,
        this._options(options)
    );
};

Remote.prototype.head = function(path, query, options = {}) {
    return request.head(
        Remote.prepare(this.uri, path, query),
        this._options(options)
    );
};

module.exports.Remote = Remote;
