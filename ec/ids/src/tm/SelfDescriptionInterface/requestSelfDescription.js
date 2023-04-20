const
    util    = require('../../tb.ec.ids.util.js'),
    testing = require('@nrd/fua.module.testing');

/** @type {fua.module.testing.TestMethod} */
module.exports = new testing.Method({
    '@id': 'urn:tb:ec:ids:tm:SelfDescriptionInterface:requestSelfDescription',
    /** @param {fua.module.testing.TestToken} token */
    async executor(token) {
        util.assert(util.isString(token.param.baseUrl), 'expected baseUrl to be a string');
        // const target          = new util.url.URL('/about', token.param.baseUrl);
        const target          = new util.url.URL('/', token.param.baseUrl);
        token.result.url      = target.toString();
        token.result.response = await this.ecosystem.callAlice('fetchApplicantResource', {
            daps:    'nrd_daps',
            url:     target.toString(),
            headers: {
                'Accept': 'application/ld+json'
            }
        });
    }
});
