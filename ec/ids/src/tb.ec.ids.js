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
            dapsConfig        = {
                id:     'urn:tb:ec:ids:rc:daps',
                server: {
                    schema:   'https',
                    hostname: 'nrd-daps.nicos-rd.com',
                    port:     8083
                },
                http:   {
                    headers: {
                        // 'Authorization': 'Basic ...',
                        // 'Authorization': 'Bearer ...',
                    },
                    agent:   new util.https.Agent(aliceConfig.server.options)
                }
            },
            aliceUrl          = `${aliceConfig.server.schema}://${aliceConfig.server.hostname}:${aliceConfig.server.port}/`,
            bobUrl            = `${bobConfig.server.schema}://${bobConfig.server.hostname}:${bobConfig.server.port}/`,
            dapsUrl           = `${dapsConfig.server.schema}://${dapsConfig.server.hostname}:${dapsConfig.server.port}/`,
            dapsTweakerUrl    = `${dapsUrl}tweak`,
            dapsObserverUrl   = `${dapsUrl}observe`,
            connectorLauncher = './rc/connector/launch.rc-connector.js',
            socketOptions     = {
                rejectUnauthorized: false,
                connectTimeout:     10e3
                // reconnectionAttempts: 5
            },
            [
                aliceProc, bobProc,
                aliceSocket, bobSocket,
                dapsTweakerSocket, dapsObserverSocket
            ]                 = await Promise.all([
                util.launchNodeProcess(connectorLauncher, aliceConfig),
                util.launchNodeProcess(connectorLauncher, bobConfig),
                util.connectIOSocket(aliceUrl, socketOptions),
                util.connectIOSocket(bobUrl, socketOptions),
                util.connectIOSocket(dapsTweakerUrl, socketOptions),
                util.connectIOSocket(dapsObserverUrl, socketOptions)
            ]);

        // IDEA use IPC channel instead of socket.io

        Object.defineProperties(this, {
            callAlice: {value: util.createIOEmitter(aliceSocket, {timeout: 60e3})},
            callBob:   {value: util.createIOEmitter(bobSocket, {timeout: 60e3})},
            // tweakDAPS: {
            //     value: async function (type, param) {
            //         util.assert(util.isString(type), 'expected type to be a string');
            //         util.assert(util.isObject(param), 'expected param to be an object');
            //         return await util.callJsonApi(dapsTweakerUrl, dapsConfig.http.headers, {type, ...param}, dapsConfig.http.agent);
            //     }
            // }
            tweakDAPS:   {value: util.createIOEmitter(dapsTweakerSocket, {timeout: 60e3})},
            observeDAPS: {value: util.createIOReceiver(dapsObserverSocket, {timeout: 60e3})}
        });

    }, // initialize
    testMethods:    [
        // require('./tm/tb.ec.ids.tm.rc_refreshDAT.js'),
        // require('./tm/tb.ec.ids.tm.rc_createSelfDescription.js')
        require('./tm/develop.js'),
        require('./tm/captureDAT.js')
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
