const
    util         = require('./tb.ec.ids.util.js'),
    testing      = require('@nrd/fua.module.testing'),
    alice_config = require('../cert/alice/index.js'),
    bob_config   = require('../cert/bob/index.js');

/** @type {fua.module.testing.TestingEcosystem} */
module.exports = new testing.Ecosystem({
    '@id': 'urn:tb:ec:ids',
    async initializer(args = {}) {

        util.assertTodo(/* TODO */);

        const [aliceProc, bobProc] = await Promise.all([
            util.launchNodeProcess('./rc/connector/launch.rc-connector.js', {
                name:      'ALICE',
                server:    {
                    schema:  'https',
                    host:    'alice.nicos-rd.com',
                    port:    8099,
                    options: {
                        key:  alice_config.server.key.toString(),
                        cert: alice_config.server.cert.toString(),
                        ca:   alice_config.server.ca.toString()
                    }
                },
                connector: {
                    uri: 'https://alice.nicos-rd.com/',
                    id:  alice_config.connector.meta.SKIAKI,
                    key: alice_config.connector.key.toString(),
                    pub: alice_config.connector.pub.toString()
                }
            }),
            util.launchNodeProcess('./rc/connector/launch.rc-connector.js', {
                name:      'BOB',
                server:    {
                    schema:  'https',
                    host:    'bob.nicos-rd.com',
                    port:    8098,
                    options: {
                        key:  bob_config.server.key.toString(),
                        cert: bob_config.server.cert.toString(),
                        ca:   bob_config.server.ca.toString()
                    }
                },
                connector: {
                    uri: 'https://bob.nicos-rd.com/',
                    id:  bob_config.connector.meta.SKIAKI,
                    key: bob_config.connector.key.toString(),
                    pub: bob_config.connector.pub.toString()
                }
            })
        ]);

        // TODO

    }, // initialize
    testMethods:    [
        // require('./tm/tb.ec.ids.tm.rc_refreshDAT.js'),
        // require('./tm/tb.ec.ids.tm.rc_createSelfDescription.js')
    ],
    testCases:      [
        // require('./tc/tb.ec.ids.tc.SUT_provideSelfDescription.js')
        require('./tc/DAPSInteraction/CheckDATfromDAPS.js'),
        require('./tc/DAPSInteraction/CommunicationDATProvisioning.js'),
        require('./tc/DAPSInteraction/DATDeniedfromDAPS.js'),
        require('./tc/DAPSInteraction/NoDATObtainedfromDAPS.js'),
        require('./tc/DAPSInteraction/ReceiveDATfromDAPS.js'),
        require('./tc/DAPSInteraction/ReceiveInvalidDATfromDAPS.js')
    ],
    testProcedures: []
});
