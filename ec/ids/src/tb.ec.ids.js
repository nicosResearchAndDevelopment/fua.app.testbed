const
    util    = require('./tb.ec.ids.util.js'),
    testing = require('@nrd/fua.module.testing');

/** @type {fua.module.testing.TestingEcosystem} */
module.exports = new testing.Ecosystem({
    '@id': 'urn:tb:ec:ids',
    async initializer(args = {}) {

        const [alice, bob] = await Promise.all([
            util.launchNodeProcess('./rc/connector/launch.rc-connector.js', {
                name:   'ALICE',
                server: {
                    schema:  'https',
                    host:    'alice.nicos-rd.com',
                    port:    8099,
                    options: {}
                }
            }),
            util.launchNodeProcess('./rc/connector/launch.rc-connector.js', {
                name:   'BOB',
                server: {
                    schema: 'https',
                    host:   'bob.nicos-rd.com',
                    port:   8098,
                    options: {}
                }
            })
        ]);

        // TODO

    },
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
