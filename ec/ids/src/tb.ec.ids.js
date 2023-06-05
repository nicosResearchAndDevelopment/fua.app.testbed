const
    util    = require('./tb.ec.ids.util.js'),
    config  = require('./tb.ec.ids.config.js'),
    testing = require('@nrd/fua.module.testing');

/**
 * @type {fua.module.testing.TestingEcosystem}
 * @see https://github.com/International-Data-Spaces-Association/IDS-testbed/tree/master/Testsuite
 */
module.exports = new testing.Ecosystem({
    '@id': 'urn:tb:ec:ids',
    async initializer(args = {}) {

        const [aliceSocket, bobSocket, dapsTweakerSocket, dapsObserverSocket] = await Promise.all([
            util.connectIOSocket(config.alice.url, config.socketIO.options),
            util.connectIOSocket(config.bob.url, config.socketIO.options),
            util.connectIOSocket(config.daps.tweakerUrl, config.socketIO.options),
            util.connectIOSocket(config.daps.observerUrl, config.socketIO.options)
        ]);

        Object.defineProperties(this, {
            callAlice:   {value: util.createIOEmitter(aliceSocket, {timeout: 60e3})},
            callBob:     {value: util.createIOEmitter(bobSocket, {timeout: 60e3})},
            tweakDAPS:   {value: util.createIOEmitter(dapsTweakerSocket, {timeout: 60e3})},
            observeDAPS: {value: util.createIOReceiver(dapsObserverSocket, {timeout: 60e3})}
        });

    }, // initialize
    testMethods:    [
        // require('./tm/tb.ec.ids.tm.rc_refreshDAT.js'),
        // require('./tm/tb.ec.ids.tm.rc_createSelfDescription.js')

        require('./tm/develop.js'),

        require('./tm/DAPSInteraction/captureDAT.js'),

        require('./tm/SelfDescriptionInterface/requestSelfDescription.js')
    ],
    testCases:      [
        // require('./tc/tb.ec.ids.tc.SUT_provideSelfDescription.js')

        require('./tc/DAPSInteraction/CheckDATfromDAPS.js'),
        require('./tc/DAPSInteraction/CommunicationDATProvisioning.js'),
        require('./tc/DAPSInteraction/DATDeniedfromDAPS.js'),
        require('./tc/DAPSInteraction/NoDATObtainedfromDAPS.js'),
        require('./tc/DAPSInteraction/ReceiveDATfromDAPS.js'),
        require('./tc/DAPSInteraction/ReceiveInvalidDATfromDAPS.js'),

        require('./tc/SelfDescriptionInterface/AvailabilityOfSelfDescription.js'),
        require('./tc/SelfDescriptionInterface/ContentOfSelfDescription.js'),
        require('./tc/SelfDescriptionInterface/UnavailabilityOfSelfDescription.js'),
        require('./tc/SelfDescriptionInterface/WrongSelfDescription.js')
    ],
    testProcedures: []
});
