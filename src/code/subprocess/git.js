const SubProcess = require('./subprocess.js');

module.exports = function Git(cwd = process.cwd()) {
    const git = SubProcess(cwd, 'git');

    git.help  = (...args) => git(...args, '--help');
    git.clone = (...args) => git('clone', ...args);

    return git;
};
