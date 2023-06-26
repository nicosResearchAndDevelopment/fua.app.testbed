const
    {describe, test, before} = require('mocha'),
    expect                   = require('expect'),
    {TestToken}              = require('@nrd/fua.module.testing'),
    dev                      = require('../src/tb.ec.dev.js'),
    config                   = {};

describe('tb.ec.dev', function () {

    this.timeout(0);

    before(async function () {
        await dev.initialize(config);
    });

    test('datetime', async function () {
        const token = await dev.launch(new TestToken({
            ecosystem:  'urn:tb:ec:dev',
            testMethod: 'urn:tb:ec:dev:tm:datetime'
        }));
        expect(token).toBeInstanceOf(TestToken);
        expect(token.result).toHaveProperty('datetime');
        const datetime = new Date(token.result.datetime);
        expect(datetime).toBeInstanceOf(Date);
        console.log(datetime);
    });

});
