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

exports.launchNodeProcess = async function (launcherFile, launchConfig) {
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

    util.logText(`process ${launchConfig.name || subprocess.pid} launched successfully`);
    return subprocess;
};

exports.createIOEmitter = async function (url = 'http://localhost', options = {}) {
    const socket = io(url, options);
    await new Promise((resolve, reject) => {
        let onConnect, onError, connectTimeout;
        socket.once('connect', onConnect = () => {
            if (connectTimeout) clearTimeout(connectTimeout);
            socket.io.off('reconnect_failed', onError);
            resolve();
        });
        socket.io.once('reconnect_failed', onError = () => {
            if (connectTimeout) clearTimeout(connectTimeout);
            socket.off('connect', onConnect);
            socket.io.once('reconnect_error', (err) => {
                socket.disconnect();
                reject(err);
            });
        });
        if (util.isFiniteNumber(options.connectTimeout)) connectTimeout = setTimeout(() => {
            socket.off('connect', onConnect);
            socket.io.off('reconnect_failed', onError);
            reject(new Error('initial connect timed out'));
        }, options.connectTimeout);
    });
    return (method = '', param = {}) => new Promise((resolve, reject) => {
        const callback = (err, result) => err ? reject(err) : resolve(result);
        socket.emit(method, param, callback);
    });
};

module.exports = Object.freeze(util);
