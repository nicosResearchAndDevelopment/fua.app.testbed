const
    util    = require('./tb.ec.ids.util.js'),
    testing = require('@nrd/fua.module.testing');

/** @type {fua.module.testing.TestingEcosystem} */
module.exports = new testing.Ecosystem({
    '@id': 'urn:tb:ec:ids',
    async initializer(args = {}) {
        // TODO
    },
    testMethods:    [
        // require('./tm/tb.ec.ids.tm.rc_refreshDAT.js'),
        // require('./tm/tb.ec.ids.tm.rc_createSelfDescription.js')
    ],
    testCases:      [
        // require('./tc/tb.ec.ids.tc.SUT_provideSelfDescription.js')
    ],
    testProcedures: []
});
