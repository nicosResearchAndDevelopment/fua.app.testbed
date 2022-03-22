const
    interfaceName = 'shell',
    util          = require('../util.testsuite.js'),
    child_process = require('child_process');

exports.interface = interfaceName;
exports.generator = function ({application, directory}) {
    util.assert(util.isString(application), `InterfaceGenerator<${interfaceName}> : invalid application`);
    util.assert(util.isNull(directory) || util.isString(directory), `InterfaceGenerator<${interfaceName}> : invalid directory`);

    /** @type {TestInterface} */
    async function shell_interface(method = '', param = null) {
        util.assert(util.isString(method), `TestInterface<${interfaceName}> : invalid method`);
        util.assert(util.isNull(param) || util.isObject(param), `TestInterface<${interfaceName}> : invalid param`);

        const cmdChunks = [application];
        if (method) cmdChunks.push(method);
        if (param) for (let [key, value] of Object.entries(param)) {
            const tag = (key.length > 1 ? '--' : '-') + key;
            cmdChunks.push(value === true ? tag : tag + ' ' + value);
        }

        const
            command    = cmdChunks.join(' '),
            child      = child_process.exec(command, {
                cwd:         directory || null,
                windowsHide: true
            }),
            stdPromise = Promise.all([
                util.streamToString(child.stdout),
                util.streamToString(child.stderr)
            ]);

        return new Promise((resolve, reject) => {
            child.addListener('exit', async (errCode) => {
                try {
                    const [stdout, stderr] = await stdPromise;
                    util.assert(errCode === 0, `Application exited with code ${errCode}. \n${stderr}`);
                    const result = JSON.parse(stdout);
                    util.assert(util.isNull(result) || util.isObject(result), `TestInterface<${interfaceName}> : invalid result`);
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
        });
    } // shell_interface

    return shell_interface;
}; // exports.generator
