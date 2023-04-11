const
    {describe, test}                        = require('mocha'),
    expect                                  = require('expect'),
    TestbedAgent                            = require('../src/code/agent.testbed.js'),
    {Space}                                 = require('@nrd/fua.module.space'),
    {TestingProvider, Ecosystem, TestToken} = require('@nrd/fua.module.testing'),
    ecosystems                              = {
        net: require('../ec/net/src/tb.ec.net.js'),
        ids: require('../ec/ids/src/tb.ec.ids.js')
    },
    config                                  = require('../src/config/config.testbed.js'),
    aliceCerts                              = require('../ec/ids/cert/alice/index.js');

describe('agent.testbed', function () {

    this.timeout('10s');

    test('construct a basic agent without a server', async function () {
        const agent = await TestbedAgent.create();
        expect(agent.space).toBeInstanceOf(Space);
        expect(agent.testing).toBeInstanceOf(TestingProvider);
    });

    test('initialize testing ecosystems and launch a test', async function () {
        expect(ecosystems.net).toBeInstanceOf(Ecosystem);
        expect(ecosystems.ids).toBeInstanceOf(Ecosystem);

        const agent = await TestbedAgent.create({
            ecosystems: [
                ecosystems.net,
                ecosystems.ids
            ]
        });

        expect(ecosystems.net.provider).toBe(agent.testing);
        expect(ecosystems.ids.provider).toBe(agent.testing);

        await ecosystems.net.initialize();
        await ecosystems.ids.initialize();

        const token = TestToken.from({
            ecosystem: 'urn:tb:ec:ids',
            testCase:  'urn:tb:ec:ids:tc:DAPSInteraction:ReceiveDATfromDAPS',
            param:     {
                connector: {
                    clientId:  aliceCerts.connector.meta.SKIAKI,
                    clientUri: 'https://alice.nicos-rd.com/',
                    publicKey: aliceCerts.connector.pub.toString(),
                    serverUrl: 'https://alice.nicos-rd.com:8099/',
                    tlsCert:   aliceCerts.server.cert.toString()
                }
            }
        });

        expect(token).toBeInstanceOf(TestToken);
        await agent.testing.launch(token);
        console.log(token.toJSON());
    });

});
