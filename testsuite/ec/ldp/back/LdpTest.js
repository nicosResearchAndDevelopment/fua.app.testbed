// SEE: https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/LdpTest.html

const
    /** @member exports */
    LdpTest = exports,
    C       = require('./ldp-const.json'),
    util    = require('./ldp-util.js'),
    expect  = require('./ldp-expect.js');

LdpTest.skipIfMethodNotAllowed = async function (url, method) {
    const response = await util.OPTIONS(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.ALLOW]).toMatch(method);
};