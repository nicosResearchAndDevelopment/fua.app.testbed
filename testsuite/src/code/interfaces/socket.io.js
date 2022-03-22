const
    interfaceName    = 'socket.io',
    util             = require('../util.testsuite.js'),
    socket_io_client = require('socket.io-client');

exports.interface = interfaceName;
exports.generator = function ({url}) {
    util.assert(util.isString(url), `InterfaceGenerator<${interfaceName}> : invalid url`);

    const
        socket = socket_io_client(url, {
            forceNew: true
        });

    async function io_interface(method = '', param = null) {
        util.assert(util.isString(method), `TestInterface<${interfaceName}> : invalid method`);
        util.assert(util.isNull(param) || util.isObject(param), `TestInterface<${interfaceName}> : invalid param`);

        if (socket.disconnected)
            await new Promise(resolve => socket.on('connect', resolve));

        return new Promise((resolve, reject) => socket.emit(
            method, param,
            (err, result) => {
                try {
                    if (err) {
                        if (util.isString(err)) throw new Error(err);
                        if (util.isString(err?.message)) throw new Error(err.message);
                        throw err;
                    }
                    if (util.isString(result)) result = JSON.parse(result);
                    util.assert(util.isNull(result) || util.isObject(result), `TestInterface<${interfaceName}> : invalid result`);
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            }
        ));
    } // io_interface

    return io_interface;
}; // exports.generator
