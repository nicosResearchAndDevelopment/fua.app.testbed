const
    {describe, test} = require('mocha'),
    expect           = require('expect'),
    portscan             = require('./portscan.js');

describe('ec/net/portscan', function () {

    test('portscan should be a function', function () {
        expect(typeof portscan).toBe('function');
    });

    test('portscan should be async and return a result object', async function () {
        const result = await portscan({host: '127.0.0.1'});
        expect(typeof result).toBe('object');
        console.log(result);
    });

});
