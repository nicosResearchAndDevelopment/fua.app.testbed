// SEE: https://w3c.github.io/ldp-testsuite/manifest/#org.w3.ldp.testsuite.test.BasicContainerTest manifest#BasicContainerTest
// SEE: https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/BasicContainerTest.html

const
    /** @member exports */
    BasicContainerTest = exports,
    C                  = require('./ldp-const.json'),
    util               = require('./ldp-util.js'),
    expect             = require('./ldp-expect.js');

/**
 * Each LDP Basic Container MUST also be a conforming LDP Container in section 5.2 Container
 * along with the following restrictions in this section.
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testConformsBcLdpContainer manifest#testConformsBcLdpContainer
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/BasicContainerTest.html#testConformsBcLdpContainer() api/BasicContainerTest#testConformsBcLdpContainer
 */
BasicContainerTest.testConformsBcLdpContainer = async function () {
    throw new Error('Covered indirectly by the MUST tests defined in CommonContainerTest');
};

Object.assign(BasicContainerTest.testConformsBcLdpContainer, {
    title:       'BasicContainerTest#testConformsBcLdpContainer',
    description: 'Each LDP Basic Container MUST also be a conforming LDP Container in section 5.2 Container '
                     + 'along with the following restrictions in this section.',
    tags:        [C.tag.MUST, C.tag.INDIRECT, C.tag.WG_APPROVED]
});

/**
 * LDP servers exposing LDPCs MUST advertise their LDP support by exposing a HTTP Link header
 * with a target URI matching the type of container (see below) the server supports,
 * and a link relation type of type (that is, rel='type') in all responses
 * to requests made to the LDPC's HTTP Request-URI.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testContainerSupportsHttpLinkHeader manifest#testContainerSupportsHttpLinkHeader
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/BasicContainerTest.html#testContainerSupportsHttpLinkHeader() api/BasicContainerTest#testContainerSupportsHttpLinkHeader
 */
BasicContainerTest.testContainerSupportsHttpLinkHeader = async function (url) {
    const response = await util.GET(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.LINK]).toContainLinkRelation(C.header.LINK_REL_TYPE, C.LDP.BasicContainer);
};

Object.assign(BasicContainerTest.testContainerSupportsHttpLinkHeader, {
    title:       'BasicContainerTest#testContainerSupportsHttpLinkHeader',
    description: 'LDP servers exposing LDPCs MUST advertise their LDP support by exposing a HTTP Link header '
                     + 'with a target URI matching the type of container (see below) the server supports, '
                     + 'and a link relation type of type (that is, rel=\'type\') in all responses '
                     + 'to requests made to the LDPC\'s HTTP Request-URI.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});