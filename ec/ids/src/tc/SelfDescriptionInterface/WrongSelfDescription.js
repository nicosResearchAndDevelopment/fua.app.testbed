const
    util    = require('../../tb.ec.ids.util.js'),
    testing = require('@fua/module.testing');

/**
 * @type {fua.module.testing.TestCase}
 * @see https://github.com/International-Data-Spaces-Association/ids3c-co/blob/master/human_friendly/en/specification/test/case/specs/TCS_WrongSelfDescription.md
 */
module.exports = new testing.Case({
    // '@id': 'ids3c-co:TCS_WrongSelfDescription',
    '@id': 'urn:tb:ec:ids:tc:SelfDescriptionInterface:WrongSelfDescription',
    /** @param {fua.module.testing.TestToken} token */
    async handler(token) {

        util.assertTodo(/* TODO */);

    }
});
