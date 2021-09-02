const
    {spawn}       = require('child_process'),
    {flattenArgs} = require('./util.js');

module.exports = function Docker(cwd = process.cwd()) {
    if (!new.target) return new Docker(cwd);

    /**
     * @param {...(string|Array<string>|{[key: string]: string})} args
     * @returns {Promise<string>}
     */
    async function _exec(...args) {
        const subprocess = spawn('docker', flattenArgs(args), {cwd});
        console.log(':$> ' + subprocess.spawnargs.join(' '));
        let stdout = '', stderr = '';
        subprocess.stdout.on('data', (data) => (stdout += data) && process.stdout.write(data));
        subprocess.stderr.on('data', (data) => (stderr += data) && process.stderr.write(data));
        const exitCode = await new Promise((resolve) => subprocess.on('close', resolve));
        if (exitCode !== 0) throw new Error(stderr);
        return stdout;
    } // _exec

    this.help    = (...args) => _exec(...args, '--help');
    this.run     = (...args) => _exec('run', ...args);
    this.build   = (...args) => _exec('build', ...args);
    this.create  = (...args) => _exec('create', ...args);
    this.run     = (...args) => _exec('run', ...args);
    this.rm      = (...args) => _exec('rm', ...args);
    this.rmi     = (...args) => _exec('rmi', ...args);
    this.update  = (...args) => _exec('update', ...args);
    this.start   = (...args) => _exec('start', ...args);
    this.restart = (...args) => _exec('restart', ...args);
    this.stop    = (...args) => _exec('stop', ...args);
    this.kill    = (...args) => _exec('kill', ...args);
};
