const
    {describe, test} = require('mocha'),
    expect           = require('expect'),
    ping             = require('./ping.js');

describe('ec/ip/ping', function () {

    test('ping should be a function', function () {
        expect(typeof ping).toBe('function');
    });

    test('ping should be async and return a ping result object', async function () {
        const result = await ping({host: 'google.com'});
        expect(typeof result).toBe('object');
        console.log(result);
    });

});
