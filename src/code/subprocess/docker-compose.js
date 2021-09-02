const SubProcess = require('./subprocess.js');

module.exports = function DockerCompose(cwd = process.cwd()) {
    const dockerCompose = SubProcess(cwd, 'docker-compose');

    dockerCompose.help = (...args) => dockerCompose(...args, '--help');
    dockerCompose.pull = (...args) => dockerCompose('pull', ...args);
    dockerCompose.up   = (...args) => dockerCompose('up', ...args);
    dockerCompose.down = (...args) => dockerCompose('down', ...args);

    return dockerCompose;
};
