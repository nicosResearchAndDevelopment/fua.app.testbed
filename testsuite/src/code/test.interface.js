const
    config = require('../config/config.testsuite.js'),
    fetch  = require('node-fetch'),
    util   = require('@nrd/fua.core.util'),
    {URL}  = require('url'),
    assert = new util.Assert('nrd-testsuite/test.interface');

module.exports = async function test(identifier, param = {}) {
    assert(util.isString(identifier), 'expected identifier to be a string');
    assert(util.isObject(param), 'expected param to be an object');
    const
        target   = new URL(identifier, config.testbed.baseURL),
        request  = {
            method:  'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body:    JSON.stringify(param)
        },
        response = await fetch(target, request),
        result   = await response.json();
    return result;
};