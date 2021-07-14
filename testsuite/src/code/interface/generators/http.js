const
    interfaceName                = 'http',
    {assert, isString, isObject} = require('../util.js'),
    {URL}                        = require('url'),
    fetch                        = require('node-fetch');

exports.interface = interfaceName;
exports.generator = function ({baseUrl, httpMethod = 'POST', httpHeaders = {'Content-Type': 'application/json'}}) {
    assert(isString(baseUrl), `InterfaceGenerator<${interfaceName}> : invalid baseUrl`);
    assert(isString(httpMethod), `InterfaceGenerator<${interfaceName}> : invalid httpMethod`);
    assert(isObject(httpHeaders), `InterfaceGenerator<${interfaceName}> : invalid httpHeaders`);

    async function http_interface(method = '', param = null) {
        assert(typeof method === 'string', `TestInterface<${interfaceName}> : invalid method`);
        assert(typeof param === 'object', `TestInterface<${interfaceName}> : invalid param`);
        const
            targetUrl = new URL(method, baseUrl),
            httpBody  = param ? JSON.stringify(param) : undefined,
            response  = await fetch(targetUrl, {
                method:  httpMethod,
                headers: httpHeaders,
                body:    httpBody
            });
        assert(response.ok, `TestInterface<${interfaceName}> : invalid response`);
        const result = await response.json();
        assert(typeof result === 'object', `TestInterface<${interfaceName}> : invalid result`);
        return result;
    } // http_interface

    return http_interface;
}; // exports.generator