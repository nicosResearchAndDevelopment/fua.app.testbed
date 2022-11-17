const
    util               = require('./tb.ec.net.util.js'),
    {TestingEcosystem} = require('@nrd/fua.module.testing/model');

/** @type {fua.module.testing.TestingEcosystem} */
module.exports = new TestingEcosystem({
    '@id':       'urn:tb:ec:net',
    testMethods: [
        require('./tb.ec.net.tm.ping.js')
    ]
});
