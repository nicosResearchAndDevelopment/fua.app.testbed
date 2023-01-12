const
    _util      = require('@nrd/fua.core.util'),
    util       = exports = module.exports = {
        ..._util,
        assert: _util.Assert('tb.ec.ids'),
        expect: require('expect')
    },
    {io}       = require('socket.io-client'),
    subprocess = require('@nrd/fua.module.subprocess'),
    NODE       = subprocess.RunningProcess('node', {verbose: false, cwd: __dirname});

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
    const socket = io(url, options);
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

util.createIOEmitter = function (socket) {
    return (method = '', param = {}) => new Promise((resolve, reject) => {
        const callback = (err, result) => err ? reject(err) : resolve(result);
        socket.emit(method, param, callback);
    });
};

module.exports = Object.freeze(util);
