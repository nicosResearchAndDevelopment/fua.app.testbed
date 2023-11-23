const
    util     = require('./tb.ec.ids.util.js'),
    defaults = require('./tb.ec.ids.defaults.js'),
    testing  = require('@nrd/fua.module.testing');

/**
 * @type {fua.module.testing.TestingEcosystem}
 * @see https://github.com/International-Data-Spaces-Association/IDS-testbed/tree/master/Testsuite
 */
module.exports = new testing.Ecosystem({
    '@id': 'urn:tb:ec:ids',
    async initializer({config}) {
        config       = util.extendObject({}, defaults, config || {});
        config.alice = util.extendObject({}, config.socketIO, config.alice || {});
        config.bob   = util.extendObject({}, config.socketIO, config.bob || {});
        config.daps  = util.extendObject({}, config.socketIO, config.daps || {});

        const
            sockets = await util.asyncMapObject({
                alice:        util.connectIOSocket(config.alice.url, config.alice.options),
                bob:          util.connectIOSocket(config.bob.url, config.bob.options),
                dapsTweaker:  util.connectIOSocket(util.joinURL(config.daps.url, config.daps.tweakerPath), config.daps.options),
                dapsObserver: util.connectIOSocket(util.joinURL(config.daps.url, config.daps.observerPath), config.daps.options)
            }),
            methods = {
                callAlice:   util.createIOEmitter(sockets.alice, {timeout: 60e3}),
                callBob:     util.createIOEmitter(sockets.bob, {timeout: 60e3}),
                tweakDAPS:   util.createIOEmitter(sockets.dapsTweaker, {timeout: 60e3}),
                observeDAPS: util.createIOReceiver(sockets.dapsObserver, {timeout: 60e3})
            };

        Object.defineProperties(this, Object.fromEntries(
            Object.entries(methods).map(([key, value]) => [key, {value}])
        ));
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
