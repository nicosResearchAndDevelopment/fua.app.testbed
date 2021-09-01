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
async function _execGit(...args) {
    const subprocess = spawn('git', _flattenArgs(args));
    console.log(':git.js> ' + subprocess.spawnargs.join(' '));
    let stdout = '', stderr = '';
    subprocess.stdout.on('data', (data) => (stdout += data) && process.stdout.write(data));
    subprocess.stderr.on('data', (data) => (stderr += data) && process.stderr.write(data));
    const exitCode = await new Promise((resolve) => subprocess.on('close', resolve));
    if (exitCode !== 0) throw new Error(stderr);
    return stdout;
} // _execGit

exports.help  = (...args) => _execGit(...args, '--help');
exports.clone = (...args) => _execGit('clone', ...args);
