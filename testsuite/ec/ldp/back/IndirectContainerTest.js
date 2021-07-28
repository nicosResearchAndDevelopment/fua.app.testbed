// SEE: https://w3c.github.io/ldp-testsuite/manifest/#org.w3.ldp.testsuite.test.IndirectContainerTest manifest#IndirectContainerTest
// SEE: https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/IndirectContainerTest.html

const
    /** @member exports */
    IndirectContainerTest = exports,
    C                     = require('./ldp-const.json'),
    util                  = require('./ldp-util.js'),
    expect                = require('./ldp-expect.js');

/**
 * LDP servers exposing LDPCs MUST advertise their LDP support by exposing a HTTP Link header
 * with a target URI matching the type of container (see below) the server supports, and a link relation type
 * of type (that is, rel='type') in all responses to requests made to the LDPC's HTTP Request-URI.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testContainerSupportsHttpLinkHeader manifest#testContainerSupportsHttpLinkHeader
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/IndirectContainerTest.html#testContainerSupportsHttpLinkHeader() api/IndirectContainerTest#testContainerSupportsHttpLinkHeader
 */
IndirectContainerTest.testContainerSupportsHttpLinkHeader = async function (url) {
    const response = await util.GET(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.LINK]).toContainLinkRelation(C.header.LINK_REL_TYPE, C.LDP.IndirectContainer);
};

Object.assign(IndirectContainerTest.testContainerSupportsHttpLinkHeader, {
    title:       'IndirectContainerTest#testContainerSupportsHttpLinkHeader',
    description: 'LDP servers exposing LDPCs MUST advertise their LDP support by exposing a HTTP Link header '
                     + 'with a target URI matching the type of container (see below) the server supports, and a link relation type '
                     + 'of type (that is, rel=\'type\') in all responses to requests made to the LDPC\'s HTTP Request-URI.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * Each LDP Indirect Container MUST also be a conforming LDP Direct Container
 * in section 5.4 Direct along the following restrictions.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testConformsIcLdpContainer manifest#testConformsIcLdpContainer
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/IndirectContainerTest.html#testConformsIcLdpContainer() api/IndirectContainerTest#testConformsIcLdpContainer
 */
IndirectContainerTest.testConformsIcLdpContainer = async function (url) {
    // TODO
    throw new Error('not implemented');
};

Object.assign(IndirectContainerTest.testConformsIcLdpContainer, {
    title:       'IndirectContainerTest#testConformsIcLdpContainer',
    description: 'Each LDP Indirect Container MUST also be a conforming LDP Direct Container '
                     + 'in section 5.4 Direct along the following restrictions.',
    tags:        [C.tag.MUST, C.tag.NOT_IMPLEMENTED, C.tag.WG_PENDING]
});

/**
 * LDP Indirect Containers MUST contain exactly one triple whose subject is the LDPC URI,
 * whose predicate is ldp:insertedContentRelation, and whose object ICR describes
 * how the member-derived-URI in the container's membership triples is chosen.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testContainerHasInsertedContentRelation manifest#testContainerHasInsertedContentRelation
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/IndirectContainerTest.html#testContainerHasInsertedContentRelation() api/IndirectContainerTest#testContainerHasInsertedContentRelation
 */
IndirectContainerTest.testContainerHasInsertedContentRelation = async function (url) {
    // TODO
    throw new Error('not implemented');
};

Object.assign(IndirectContainerTest.testContainerHasInsertedContentRelation, {
    title:       'IndirectContainerTest#testContainerHasInsertedContentRelation',
    description: 'LDP Indirect Containers MUST contain exactly one triple whose subject is the LDPC URI, '
                     + 'whose predicate is ldp:insertedContentRelation, and whose object ICR describes '
                     + 'how the member-derived-URI in the container\'s membership triples is chosen.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_PENDING, C.tag.TODO]
});

/**
 * LDPCs whose ldp:insertedContentRelation triple has an object other than ldp:MemberSubject
 * and that create new resources MUST add a triple to the container whose subject is the container's URI,
 * whose predicate is ldp:contains, and whose object is the newly created resource's URI (which will be different
 * from the member-derived URI in this case). This ldp:contains triple can be the only link
 * from the container to the newly created resource in certain cases.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPostResource manifest#testPostResource
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/IndirectContainerTest.html#testPostResource() api/IndirectContainerTest#testPostResource
 */
IndirectContainerTest.testPostResource = async function (url) {
    // TODO
    throw new Error('not implemented');
};

Object.assign(IndirectContainerTest.testPostResource, {
    title:       'IndirectContainerTest#testPostResource',
    description: 'LDPCs whose ldp:insertedContentRelation triple has an object other than ldp:MemberSubject '
                     + 'and that create new resources MUST add a triple to the container whose subject is the container\'s URI, '
                     + 'whose predicate is ldp:contains, and whose object is the newly created resource\'s URI (which will be different '
                     + 'from the member-derived URI in this case). This ldp:contains triple can be the only link '
                     + 'from the container to the newly created resource in certain cases.',
    tags:        [C.tag.MUST, C.tag.NOT_IMPLEMENTED, C.tag.WG_PENDING]
});