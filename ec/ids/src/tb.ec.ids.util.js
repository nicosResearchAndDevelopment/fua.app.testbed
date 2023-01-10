const
    _util      = require('@nrd/fua.core.util'),
    util       = exports = module.exports = {
        ..._util,
        assert: _util.Assert('tb.ec.ids'),
        expect: require('expect')
    },
    subprocess = require('@nrd/fua.module.subprocess'),
    NODE       = subprocess.RunningProcess('node', {verbose: true, cwd: __dirname});

exports.launchNodeProcess = async function (launcherFile, launchConfig) {
    const proc = NODE(launcherFile, {
        config: Buffer.from(JSON.stringify(launchConfig)).toString('base64')
    });
    await new Promise((resolve, reject) => {
        let onSpawn, onError;
        proc.once('spawn', onSpawn = () => {
            proc.off('error', onError);
            resolve();
        });
        proc.once('error', onError = (err) => {
            proc.off('spawn', onSpawn);
            reject(err);
        });
    });
    return proc;
};

module.exports = Object.freeze(util);
