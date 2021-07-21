const
    {describe, test} = require('mocha'),
    expect           = require('expect'),
    fn_ping          = require('./ping.js');

describe('ec/net/ping', function () {

    this.timeout(0);

    test('should ping "www.google.com" successfully', async function () {

        const
            param  = {address: 'www.google.com'},
            result = await fn_ping(param);

        expect(typeof result).toBe('object');

    }); // test

    test('should ping "www.google-marzipan.com" with an error', async function () {

        const
            param  = {address: 'www.google-marzipan.com'},
            result = await fn_ping(param);

        expect(typeof result).toBe('object');

    }); // test

}); // describe