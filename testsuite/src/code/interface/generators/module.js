const
    interfaceName = 'module',
    {assert}      = require('../util.js');

exports.interface = interfaceName;
exports.generator = function ({location}) {
    assert(typeof location === 'string', `InterfaceGenerator<${interfaceName}> : invalid location`);
    const _module = require(location);
    assert(_module && typeof _module === 'object', `InterfaceGenerator<${interfaceName}> : invalid module`);

    async function module_interface(method = '', param = null) {
        assert(typeof method === 'string', `TestInterface<${interfaceName}> : invalid method`);
        assert(typeof param === 'object', `TestInterface<${interfaceName}> : invalid param`);
        const _callback = _module[method];
        assert(typeof _callback === 'function', `TestInterface<${interfaceName}> : invalid callback`);
        const result = _callback(param);
        assert(typeof result === 'object', `TestInterface<${interfaceName}> : invalid result`);
        return result;
    } // module_interface

    return module_interface;
}; // exports.generator