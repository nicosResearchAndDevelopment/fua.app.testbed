const SubProcess = require('./subprocess.js');

module.exports = function Node(cwd = process.cwd()) {
    const node = SubProcess(cwd, 'node');

    return node;
};
