const
    interfaceName            = 'binary',
    {assert, streamToString} = require('../util.js'),
    child_process            = require('child_process');

exports.interface = interfaceName;
exports.generator = function ({application, directory}) {
    assert(typeof application === 'string', `InterfaceGenerator<${interfaceName}> : invalid application`);
    if (directory) assert(typeof directory === 'string', `InterfaceGenerator<${interfaceName}> : invalid directory`);

    async function binary_interface(method = '', param = null) {
        assert(typeof method === 'string', `TestInterface<${interfaceName}> : invalid method`);
        assert(typeof param === 'object', `TestInterface<${interfaceName}> : invalid param`);

        const args = [];
        if (method) args.push(method);
        if (param) for (let [key, value] of Object.entries(param)) {
            const tag = (key.length > 1 ? '--' : '-') + key;
            args.push(value === true ? tag : tag + ' ' + value);
        }

        const
            child      = child_process.spawn(application, args, {
                cwd:         directory || null,
                shell:       false,
                windowsHide: true
            }),
            stdPromise = Promise.all([
                streamToString(child.stdout),
                streamToString(child.stderr)
            ]);

        return new Promise((resolve, reject) => {
            child.addListener('exit', async (errCode) => {
                const [stdout, stderr] = await stdPromise;
                if (errCode === 0) {
                    const result = JSON.parse(stdout);
                    resolve(result);
                } else {
                    const err = new Error(`Application exited with code ${errCode}. \n${stderr}`);
                    reject(err);
                }
            });
        });
    } // binary_interface

    return binary_interface;
}; // exports.generator