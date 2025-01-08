const
    util    = require('../../tb.ec.ids.util.js'),
    testing = require('@fua/module.testing');

/** @type {fua.module.testing.TestMethod} */
module.exports = new testing.Method({
    '@id': 'urn:tb:ec:ids:tm:DAPSInteraction:captureDAT',
    /** @param {fua.module.testing.TestToken} token */
    async executor(token) {
        const filter = ({header, payload}) => util.objectMatches({...header, ...payload}, token.param);
        const result = await this.ecosystem.observeDAPS('token', filter);
        token.assign({result});
    }
});
