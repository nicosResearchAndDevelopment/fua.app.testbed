const
    util    = require('@nrd/fua.core.util'),
    testing = require('@nrd/fua.module.testing');

/** @type {fua.module.testing.TestMethod} */
module.exports = new testing.Method({
    '@id': 'urn:tb:ec:dev:tm:datetime',
    /** @param {fua.module.testing.TestToken} token */
    async executor(token) {
        token.result.datetime = util.dateTime();
    }
});
