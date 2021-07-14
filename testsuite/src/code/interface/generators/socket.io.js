const
    interfaceName    = 'socket.io',
    {assert}         = require('../util.js'),
    socket_io_client = require('socket.io-client');

exports.interface = interfaceName;
exports.generator = function ({url}) {
    assert(typeof url === 'string', `InterfaceGenerator<${interfaceName}> : invalid url`);

    const
        socket = socket_io_client(url, {
            forceNew: true
        });

    async function io_interface(method = '', param = null) {
        assert(typeof method === 'string', `TestInterface<${interfaceName}> : invalid method`);
        assert(typeof param === 'object', `TestInterface<${interfaceName}> : invalid param`);

        if (socket.disconnected)
            await new Promise(resolve => socket.on('connect', resolve));

        return new Promise((resolve, reject) => socket.emit(
            method, param, (err, result) => {
                if (err) {
                    if (typeof err === 'string') {
                        reject(new Error(err));
                    } else if (typeof err.message === 'string') {
                        reject(new Error(err.message));
                    } else {
                        reject(err);
                    }
                } else {
                    if (typeof result === 'string') {
                        resolve(JSON.parse(result));
                    } else {
                        resolve(result);
                    }
                }
            }
        ));
    } // io_interface

    return io_interface;
}; // exports.generator