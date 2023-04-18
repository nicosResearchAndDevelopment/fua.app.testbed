const
    util    = require('../../tb.ec.ids.util.js'),
    testing = require('@nrd/fua.module.testing');

/**
 * @type {fua.module.testing.TestCase}
 * @see https://github.com/International-Data-Spaces-Association/ids3c-co/blob/master/human_friendly/en/specification/test/case/specs/TCS_ReceiveDATfromDAPS.md
 */
module.exports = new testing.Case({
    // '@id': 'ids3c-co:TCS_ReceiveDATfromDAPS',
    '@id': 'urn:tb:ec:ids:tc:DAPSInteraction:ReceiveDATfromDAPS',
    /** @param {fua.module.testing.TestToken} token */
    async handler(token) {
        util.assertTodo(/* TODO */);

        const clientId = token.param.connector?.clientId;
        util.assert(util.isString(clientId), 'invalid connector clientId');
        const isClientToken = ({payload}) => payload?.sub === clientId;
        const result        = await this.ecosystem.observeDAPS('token', isClientToken);

    }
});
