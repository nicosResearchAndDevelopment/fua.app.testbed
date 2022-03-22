const
    interfaceName = 'module',
    util          = require('../util.testsuite.js');

exports.interface = interfaceName;
exports.generator = function ({location}) {
    util.assert(typeof location === 'string', `InterfaceGenerator<${interfaceName}> : invalid location`);
    const _module = require(location);
    util.assert(util.isObject(_module), `InterfaceGenerator<${interfaceName}> : invalid module`);

    async function module_interface(method = '', param = null) {
        util.assert(util.isString(method), `TestInterface<${interfaceName}> : invalid method`);
        util.assert(util.isNull(param) || util.isObject(param), `TestInterface<${interfaceName}> : invalid param`);
        const _callback = _module[method];
        util.assert(util.isFunction(_callback), `TestInterface<${interfaceName}> : invalid callback`);
        const result = _callback(param);
        util.assert(util.isNull(result) || util.isObject(result), `TestInterface<${interfaceName}> : invalid result`);
        return result;
    } // module_interface

    return module_interface;
}; // exports.generator
