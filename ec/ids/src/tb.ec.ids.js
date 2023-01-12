const
    util       = require('./tb.ec.ids.util.js'),
    testing    = require('@nrd/fua.module.testing'),
    aliceCerts = require('../cert/alice/index.js'),
    bobCerts   = require('../cert/bob/index.js');

/** @type {fua.module.testing.TestingEcosystem} */
module.exports = new testing.Ecosystem({
    '@id': 'urn:tb:ec:ids',
    async initializer(args = {}) {

        const
            aliceConfig       = {
                id:        'urn:tb:ec:ids:rc:alice',
                server:    {
                    schema:   'https',
                    hostname: 'alice.nicos-rd.com',
                    port:     8099,
                    options:  {
                        key:  aliceCerts.server.key.toString(),
                        cert: aliceCerts.server.cert.toString(),
                        ca:   aliceCerts.server.ca.toString()
                    }
                },
                connector: {
                    uri: 'https://alice.nicos-rd.com/',
                    id:  aliceCerts.connector.meta.SKIAKI,
                    key: aliceCerts.connector.key.toString(),
                    pub: aliceCerts.connector.pub.toString()
                }
            },
            bobConfig         = {
                id:        'urn:tb:ec:ids:rc:bob',
                server:    {
                    schema:   'https',
                    hostname: 'bob.nicos-rd.com',
                    port:     8098,
                    options:  {
                        key:  bobCerts.server.key.toString(),
                        cert: bobCerts.server.cert.toString(),
                        ca:   bobCerts.server.ca.toString()
                    }
                },
                connector: {
                    uri: 'https://bob.nicos-rd.com/',
                    id:  bobCerts.connector.meta.SKIAKI,
                    key: bobCerts.connector.key.toString(),
                    pub: bobCerts.connector.pub.toString()
                }
            },
            aliceUrl          = `${aliceConfig.server.schema}://${aliceConfig.server.hostname}:${aliceConfig.server.port}/`,
            bobUrl            = `${bobConfig.server.schema}://${bobConfig.server.hostname}:${bobConfig.server.port}/`,
            connectorLauncher = './rc/connector/launch.rc-connector.js',
            socketOptions     = {
                rejectUnauthorized: false,
                connectTimeout:     10e3
                // reconnectionAttempts: 5
            },
            [
                aliceProc,
                bobProc,
                aliceSocket,
                bobSocket
            ]                 = await Promise.all([
                util.launchNodeProcess(connectorLauncher, aliceConfig),
                util.launchNodeProcess(connectorLauncher, bobConfig),
                util.connectIOSocket(aliceUrl, socketOptions),
                util.connectIOSocket(bobUrl, socketOptions)
            ]);

        // IDEA use IPC channel instead of socket.io

        Object.defineProperties(this, {
            callAlice: {value: util.createIOEmitter(aliceSocket)},
            callBob:   {value: util.createIOEmitter(bobSocket)}
        });

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
