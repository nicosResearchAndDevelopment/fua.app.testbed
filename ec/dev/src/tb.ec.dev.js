const
    util    = require('@nrd/fua.core.util'),
    testing = require('@nrd/fua.module.testing');

/** @type {fua.module.testing.TestingEcosystem} */
module.exports = new testing.Ecosystem({
    '@id':       'urn:tb:ec:dev',
    testMethods: [
        require('./tm/tb.ec.dev.tm.datetime.js')
    ]
    // testCases:        []
    // testProcedures:   []
});
