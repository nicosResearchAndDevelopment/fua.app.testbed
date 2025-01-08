const
    util    = require('../../tb.ec.ids.util.js'),
    testing = require('@fua/module.testing');

/**
 * @type {fua.module.testing.TestCase}
 * @see https://github.com/International-Data-Spaces-Association/ids3c-co/blob/master/human_friendly/en/specification/test/case/specs/TCS_ReceiveDATfromDAPS.md
 */
module.exports = new testing.Case({
    // '@id': 'ids3c-co:TCS_ReceiveDATfromDAPS',
    '@id': 'urn:tb:ec:ids:tc:DAPSInteraction:ReceiveDATfromDAPS',
    /** @param {fua.module.testing.TestToken} token */
    async handler(token) {
        util.assert(util.isString(token.param.connector?.clientId), 'invalid connector clientId');

        const capture = token.token({
            ecosystem:  'urn:tb:ec:ids',
            testMethod: 'urn:tb:ec:ids:tm:DAPSInteraction:captureDAT',
            param:      {sub: token.param.connector.clientId}
        });

        try {
            await this.launchTestMethod(capture);
        } catch (err) {
            if (err !== capture.error) throw err;
        }

        const validation = {
            timestamp:   util.utcDateTime(),
            datReceived: !!capture.result.token
        };

        token.assign({validation});
    }
});
