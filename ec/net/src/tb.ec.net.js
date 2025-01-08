const
    util    = require('./tb.ec.net.util.js'),
    testing = require('@fua/module.testing');

/** @type {fua.module.testing.TestingEcosystem} */
module.exports = new testing.Ecosystem({
    '@id':       'urn:tb:ec:net',
    testMethods: [
        require('./tm/tb.ec.net.tm.ping.js'),
        require('./tm/tb.ec.net.tm.portscan.js')
    ],
    testCases:   [
        require('./tc/tb.ec.net.tc.reachable.js')
    ]
});
