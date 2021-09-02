const {spawn} = require('child_process');

function _flattenArgs(args) {
    if (Array.isArray(args)) {
        return args.map(_flattenArgs).flat(1);
    } else if (args && typeof args === 'object') {
        const res = [];
        for (let [key, value] of Object.entries(args)) {
            if (!key.startsWith('-')) key = (key.length > 1 ? '--' : '-') + key;
            if (Array.isArray(value)) {
                for (let entry of value) {
                    res.push(key);
                    res.push(entry);
                }
            } else if (value === null) {
                res.push(key);
            } else if (typeof value === 'string') {
                res.push(key);
                res.push(value);
            } else if (typeof value === 'number') {
                res.push(key);
                res.push(value.toString());
            }
        }
        return res;
    } else if (typeof args === 'string') {
        return [args];
    } else if (typeof args === 'number') {
        return [args.toString()];
    }
} // _flattenArgs

async function _executeProc(cwd, cmd, args) {
    const subprocess = spawn(cmd, args, {cwd});
    console.log('$ ' + cwd + '> ' + subprocess.spawnargs.join(' '));
    let stdout = '', stderr = '';
    subprocess.stdout.on('data', (data) => (stdout += data) && process.stdout.write(data));
    subprocess.stderr.on('data', (data) => (stderr += data) && process.stderr.write(data));
    const exitCode = await new Promise((resolve) => subprocess.on('close', resolve));
    if (exitCode !== 0) throw new Error(stderr);
    return stdout;
} // _executeProc

module.exports = function SubProcess(cwd = process.cwd(), cmd = '') {
    /**
     * @param {...(string|Array<string>|{[key: string]: string})} args
     * @returns {Promise<string>}
     */
    return function subprocess(...args) {
        return _executeProc(cwd, cmd, _flattenArgs(args));
    };
};
