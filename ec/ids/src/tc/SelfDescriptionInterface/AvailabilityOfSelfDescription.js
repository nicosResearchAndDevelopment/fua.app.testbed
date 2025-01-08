const
    util    = require('../../tb.ec.ids.util.js'),
    testing = require('@fua/module.testing');

/**
 * @type {fua.module.testing.TestCase}
 * @see https://github.com/International-Data-Spaces-Association/ids3c-co/blob/master/human_friendly/en/specification/test/case/specs/TCS_AvailabilityOfSelfDescription.md
 */
module.exports = new testing.Case({
    // '@id': 'ids3c-co:TCS_AvailabilityOfSelfDescription',
    '@id': 'urn:tb:ec:ids:tc:SelfDescriptionInterface:AvailabilityOfSelfDescription',
    /** @param {fua.module.testing.TestToken} token */
    async handler(token) {
        util.assert(util.isString(token.param.connector?.baseUrl), 'invalid connector baseUrl');

        const request = token.token({
            ecosystem:  'urn:tb:ec:ids',
            testMethod: 'urn:tb:ec:ids:tm:SelfDescriptionInterface:requestSelfDescription',
            param:      {baseUrl: token.param.connector.baseUrl}
        });

        try {
            await this.launchTestMethod(request);
        } catch (err) {
            if (err !== request.error) throw err;
        }

        const validation = {
            timestamp:                   util.utcDateTime(),
            selfDescriptionSend:         !!request.result.response,
            isDescriptionRequestMessage: util.objectMatches(request.result.response, {'@type': 'ids:DescriptionRequestMessage'})
        };

        token.assign({validation});
    }
});
