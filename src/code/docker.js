const
    {spawn} = require('child_process'),
    util    = require('@nrd/fua.core.util');

function _flattenArgs(args) {
    if (util.isArray(args)) {
        return args.map(_flattenArgs).flat(1);
    } else if (util.isObject(args)) {
        const res = [];
        for (let [key, value] of Object.entries(args)) {
            if (!key.startsWith('-')) key = (key.length > 1 ? '--' : '-') + key;
            if (util.isArray(value)) {
                for (let entry of value) {
                    res.push(key);
                    res.push(entry);
                }
            } else {
                res.push(key);
                res.push(value);
            }
        }
        return res;
    } else {
        return args;
    }
} // _flattenArgs

/**
 * @param {...(string|Array<string>|{[key: string]: string})} args
 * @returns {Promise<string>}
 */
async function _execDocker(...args) {
    const subprocess = spawn('docker', _flattenArgs(args));
    console.log(':docker.js> ' + subprocess.spawnargs.join(' '));
    let stdout = '', stderr = '';
    subprocess.stdout.on('data', (data) => (stdout += data) && process.stdout.write(data));
    subprocess.stderr.on('data', (data) => (stderr += data) && process.stderr.write(data));
    const exitCode = await new Promise((resolve) => subprocess.on('close', resolve));
    if (exitCode !== 0) throw new Error(stderr);
    return stdout;
} // _execDocker

exports.help    = (...args) => _execDocker(...args, '--help');
exports.run     = (...args) => _execDocker('run', ...args);
exports.build   = (...args) => _execDocker('build', ...args);
exports.create  = (...args) => _execDocker('create', ...args);
exports.run     = (...args) => _execDocker('run', ...args);
exports.rm      = (...args) => _execDocker('rm', ...args);
exports.rmi     = (...args) => _execDocker('rmi', ...args);
exports.update  = (...args) => _execDocker('update', ...args);
exports.start   = (...args) => _execDocker('start', ...args);
exports.restart = (...args) => _execDocker('restart', ...args);
exports.stop    = (...args) => _execDocker('stop', ...args);
exports.kill    = (...args) => _execDocker('kill', ...args);
