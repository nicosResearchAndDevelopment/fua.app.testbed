const
    interfaceName = 'http',
    util          = require('../util.testsuite.js'),
    {URL}         = require('url'),
    fetch         = require('node-fetch');

exports.interface = interfaceName;
exports.generator = function ({baseUrl, httpMethod = 'POST', httpHeaders = {'Content-Type': 'application/json'}}) {
    util.assert(util.isString(baseUrl), `InterfaceGenerator<${interfaceName}> : invalid baseUrl`);
    util.assert(util.isString(httpMethod), `InterfaceGenerator<${interfaceName}> : invalid httpMethod`);
    util.assert(util.isObject(httpHeaders), `InterfaceGenerator<${interfaceName}> : invalid httpHeaders`);

    async function http_interface(method = '', param = null) {
        util.assert(util.isString(method), `TestInterface<${interfaceName}> : invalid method`);
        util.assert(util.isNull(param) || util.isObject(param), `TestInterface<${interfaceName}> : invalid param`);
        const
            targetUrl = new URL(method, baseUrl),
            httpBody  = param ? JSON.stringify(param) : undefined,
            response  = await fetch(targetUrl, {
                method:  httpMethod,
                headers: httpHeaders,
                body:    httpBody
            });
        util.assert(response.ok, `TestInterface<${interfaceName}> : invalid response`);
        const result = await response.json();
        util.assert(util.isNull(result) || util.isObject(result), `TestInterface<${interfaceName}> : invalid result`);
        return result;
    } // http_interface

    return http_interface;
}; // exports.generator
