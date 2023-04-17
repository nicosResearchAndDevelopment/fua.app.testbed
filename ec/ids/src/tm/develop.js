const
    util    = require('../tb.ec.ids.util.js'),
    testing = require('@nrd/fua.module.testing');

/** @type {fua.module.testing.TestMethod} */
module.exports = new testing.Method({
    '@id': 'urn:tb:ec:ids:tm:develop',
    /** @param {fua.module.testing.TestToken} token */
    async executor(token) {
        const [request, result] = await Promise.all([
            this.ecosystem.observeDAPS('request', (details) => {
                // console.log(details);
                return true;
            }),
            util.fetch('https://nrd-daps.nicos-rd.com:8083/jwks.json', {
                agent: new util.https.Agent({rejectUnauthorized: false})
            }).then(response => response.json())
        ]);

        return {request, result};
    }
});
