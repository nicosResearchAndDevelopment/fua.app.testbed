const
    _util      = require('@nrd/fua.core.util'),
    util       = exports = module.exports = {
        ..._util,
        assert: _util.Assert('tb.ec.ids'),
        expect: require('expect'),
        http:   require('http'),
        https:  require('https'),
        fetch:  require('node-fetch'),
        url:    require('url')
    },
    {io}       = require('socket.io-client'),
    subprocess = require('@nrd/fua.module.subprocess'),
    NODE       = subprocess.RunningProcess('node', {verbose: false, cwd: __dirname});

/** @type {WeakMap<Record<string, any>, module:http.Agent | module:https.Agent>} */
const _cachedHttpAgents = new WeakMap();

/**
 * @param {string} apiTargetUrl
 * @param {Record<string, string>} [additionalHeaders]
 * @param {Object} [bodyPayload]
 * @param {Record<string, any> | module:http.Agent | module:https.Agent} [agentOptions]
 * @returns {Promise<Object>}
 */
util.callJsonApi = async function (apiTargetUrl, additionalHeaders, bodyPayload, agentOptions) {
    const requestOptions = {
        method:  'POST',
        headers: {
            'Accept':       'application/json',
            'Content-Type': 'application/json'
        }
    };
    if (util.isObject(additionalHeaders)) {
        Object.assign(requestOptions.headers, additionalHeaders)
    }
    if (util.isDefined(bodyPayload)) {
        requestOptions.body = JSON.stringify(bodyPayload);
    }
    if (agentOptions instanceof util.http.Agent) {
        requestOptions.agent = agentOptions;
    } else if (util.isObject(agentOptions)) {
        requestOptions.agent = _cachedHttpAgents.get(agentOptions);
        if (!requestOptions.agent) {
            requestOptions.agent = (agentOptions.key && agentOptions.cert)
                ? new util.https.Agent(agentOptions)
                : new util.http.Agent(agentOptions);
            _cachedHttpAgents.set(agentOptions, requestOptions.agent);
        }
    }
    const response = await util.fetch(apiTargetUrl, requestOptions);
    if (!response.ok) throw new util.HTTPResponseError(response);
    return await response.json();
};

util.launchNodeProcess = async function (launcherFile, launchConfig) {
    const subprocess = NODE(launcherFile, {
        config: Buffer.from(JSON.stringify(launchConfig)).toString('base64url')
    });

    await new Promise((resolve, reject) => {
        let onSpawn, onError;
        subprocess.once('spawn', onSpawn = () => {
            subprocess.off('error', onError);
            resolve();
        });
        subprocess.once('error', onError = (err) => {
            subprocess.off('spawn', onSpawn);
            reject(err);
        });
    });

    let lastMsg = '';
    subprocess.stdout.on('data', (data) => lastMsg = data.toString());
    subprocess.stderr.on('data', (data) => lastMsg = data.toString());
    subprocess.once('exit', (exitCode) => {
        util.logWarning(`process ${launchConfig.name || subprocess.pid} finished with exit code ${exitCode}`);
        if (exitCode !== 0 && lastMsg) util.logError(lastMsg);
    });

    util.logText(`process ${launchConfig.id || subprocess.pid} launched`);
    return subprocess;
}; // launchNodeProcess

util.connectIOSocket = async function (url = 'http://localhost', options = {}) {
    const socket = io(url, {...options});
    await new Promise((resolve, reject) => {
        let onConnect, onFail, connectTimeout, onError, lastError;
        socket.once('connect', onConnect = () => {
            if (connectTimeout) {
                clearTimeout(connectTimeout);
                socket.io.off('reconnect_error', onError);
            }
            socket.io.off('reconnect_failed', onFail);
            resolve();
        });
        socket.io.once('reconnect_failed', onFail = () => {
            if (connectTimeout) {
                clearTimeout(connectTimeout);
                socket.io.off('reconnect_error', onError);
            }
            socket.off('connect', onConnect);
            socket.io.once('reconnect_error', (err) => {
                socket.disconnect();
                reject(err);
            });
        });
        if (util.isFiniteNumber(options.connectTimeout)) {
            socket.io.on('reconnect_error', onError = (err) => {
                lastError = err;
            });
            connectTimeout = setTimeout(() => {
                socket.off('connect', onConnect);
                socket.io.off('reconnect_failed', onFail);
                socket.io.off('reconnect_error', onError);
                const err = lastError || new Error('initial connect timed out');
                reject(err);
            }, options.connectTimeout);
        }
    });
    return socket;
}; // connectIOSocket

/**
 * @typedef {{
 *     timeout?: number
 * }} IOOptions
 */

/**
 * @param {import('socket.io-client').Socket} socket
 * @param {IOOptions} [defaultOptions]
 * @returns {function(string=, Record<string, any>=, Record<string, boolean | number | string>=): Promise<unknown>}
 */
util.createIOEmitter = function (socket, defaultOptions) {

    /**
     * @template Result
     * @param {string} method
     * @param {Record<string, any>} param
     * @param {IOOptions} [specificOptions]
     * @returns {Promise<Result>}
     */
    function ioEmitter(method = '', param = {}, specificOptions) {
        return new Promise((resolve, reject) => {
            const options  = {...defaultOptions, ...specificOptions};
            let canceled   = false, timeout;
            const callback = (err, result) => {
                if (canceled) return;
                if (timeout) clearTimeout(timeout);
                if (err) reject(err);
                else resolve(result);
            };
            if (options.timeout) timeout = setTimeout(() => {
                canceled = true;
                reject(new Error('ioEmitter timed out'));
            }, options.timeout);
            if (socket.timeout && options.timeout) socket.timeout(options.timeout).emit(method, param, callback);
            else socket.emit(method, param, callback);
        });
    } // ioEmitter

    return ioEmitter;

}; // createIOEmitter

/**
 * @param {import('socket.io-client').Socket} socket
 * @param {IOOptions} [defaultOptions]
 * @returns {function(string=, function(*): boolean=, Record<string, boolean | number | string>=): Promise<unknown>}
 */
util.createIOReceiver = function (socket, defaultOptions) {

    /**
     * @template Result
     * @param {string} method
     * @param {function(result: any): boolean} filter
     * @param {IOOptions} [specificOptions]
     * @returns {Promise<Result>}
     */
    function ioReceiver(method = '', filter = () => true, specificOptions) {
        return new Promise((resolve, reject) => {
            const options = {...defaultOptions, ...specificOptions};
            let onMethod, timeout;
            if (options.timeout) timeout = setTimeout(() => {
                socket.off(method, onMethod);
                reject(new Error('ioReceiver timed out'));
            }, options.timeout);
            socket.on(method, onMethod = (result) => {
                if (!filter(result)) return;
                socket.off(method, onMethod);
                if (timeout) clearTimeout(timeout);
                resolve(result);
            });
        });
    } // ioReceiver

    return ioReceiver;

}; // createIOReceiver

module.exports = Object.freeze(util);
