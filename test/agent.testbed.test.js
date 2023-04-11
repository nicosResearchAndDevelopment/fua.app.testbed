const
    {describe, test}             = require('mocha'),
    expect                       = require('expect'),
    config                       = require('../src/config/config.testbed.js'),
    TestbedAgent                 = require('../src/code/agent.testbed.js'),
    {Space}                      = require('@nrd/fua.module.space'),
    {TestingProvider, Ecosystem} = require('@nrd/fua.module.testing'),
    ecosystems                   = {
        net: require('../ec/net/src/tb.ec.net.js'),
        ids: require('../ec/ids/src/tb.ec.ids.js')
    };

describe('agent.testbed', function () {

    this.timeout('10s');

    test('construct a basic agent without a server', async function () {
        const agent = await TestbedAgent.create();
        expect(agent.space).toBeInstanceOf(Space);
        expect(agent.testing).toBeInstanceOf(TestingProvider);
    });

    test('initialize net testing ecosystems', async function () {
        expect(ecosystems.net).toBeInstanceOf(Ecosystem);

        const agent = await TestbedAgent.create({
            ecosystems: [ecosystems.net]
        });

        expect(ecosystems.net.provider).toBe(agent.testing);
        await ecosystems.net.initialize();
    });

});
