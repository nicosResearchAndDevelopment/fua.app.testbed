const SubProcess = require('./subprocess.js');

module.exports = function Docker(cwd = process.cwd()) {
    const docker = SubProcess(cwd, 'docker');

    docker.help    = (...args) => docker(...args, '--help');
    docker.run     = (...args) => docker('run', ...args);
    docker.build   = (...args) => docker('build', ...args);
    docker.create  = (...args) => docker('create', ...args);
    docker.run     = (...args) => docker('run', ...args);
    docker.rm      = (...args) => docker('rm', ...args);
    docker.rmi     = (...args) => docker('rmi', ...args);
    docker.update  = (...args) => docker('update', ...args);
    docker.start   = (...args) => docker('start', ...args);
    docker.restart = (...args) => docker('restart', ...args);
    docker.stop    = (...args) => docker('stop', ...args);
    docker.kill    = (...args) => docker('kill', ...args);

    return docker;
};
