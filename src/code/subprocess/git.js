const
    {spawn}       = require('child_process'),
    {flattenArgs} = require('./util.js');

module.exports = function Git(cwd = process.cwd()) {
    if (!new.target) return new Git(cwd);

    /**
     * @param {...(string|Array<string>|{[key: string]: string})} args
     * @returns {Promise<string>}
     */
    async function _exec(...args) {
        const subprocess = spawn('git', flattenArgs(args), {cwd});
        console.log(':$> ' + subprocess.spawnargs.join(' '));
        let stdout = '', stderr = '';
        subprocess.stdout.on('data', (data) => (stdout += data) && process.stdout.write(data));
        subprocess.stderr.on('data', (data) => (stderr += data) && process.stderr.write(data));
        const exitCode = await new Promise((resolve) => subprocess.on('close', resolve));
        if (exitCode !== 0) throw new Error(stderr);
        return stdout;
    } // _exec

    this.help  = (...args) => _exec(...args, '--help');
    this.clone = (...args) => _exec('clone', ...args);
};
