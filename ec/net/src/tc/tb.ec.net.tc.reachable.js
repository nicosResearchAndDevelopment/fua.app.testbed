const
    util    = require('../tb.ec.net.util.js'),
    testing = require('@nrd/fua.module.testing');

/** @type {fua.module.testing.TestCase} */
module.exports = new testing.Case({
    '@id': 'urn:tb:ec:net:tc:reachable',
    /** @param {fua.module.testing.TestToken} token */
    async handler(token) {
        token.log(`started testcase ${this}`);

        util.expect(token.testCase).toBe(this.id);
        util.expect(token.param).toBeTruthy();

        const pingToken = await this.launchTestMethod(token.token({
            ecosystem:  'urn:tb:ec:net',
            testMethod: 'urn:tb:ec:net:tm:ping',
            param:      {
                host: token.param.host
            }
        }));

        token.assign({
            validation: {
                timestamp: util.utcDateTime(),
                isAlive:   pingToken.result.isAlive || false
            }
        });

        util.expect(token.validation.isAlive).toBe(true);
        token.state('IS_ALIVE', true);

        token.validation.success = true;
        token.log(`validation finished successfully`);
    }
});
