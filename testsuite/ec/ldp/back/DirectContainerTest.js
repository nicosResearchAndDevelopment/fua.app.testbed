// SEE: https://w3c.github.io/ldp-testsuite/manifest/#org.w3.ldp.testsuite.test.DirectContainerTest manifest#DirectContainerTest
// SEE: https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/DirectContainerTest.html

const
    /** @member exports */
    DirectContainerTest = exports,
    C                   = require('./ldp-const.json'),
    util                = require('./ldp-util.js'),
    expect              = require('./ldp-expect.js');

/**
 * LDP servers exposing LDPCs MUST advertise their LDP support by exposing a HTTP Link header with a target URI
 * matching the type of container (see below) the server supports, and a link relation type of type (that is, rel='type')
 * in all responses to requests made to the LDPC's HTTP Request-URI.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testHttpLinkHeader manifest#testHttpLinkHeader
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/DirectContainerTest.html#testHttpLinkHeader() api/DirectContainerTest#testHttpLinkHeader
 */
DirectContainerTest.testHttpLinkHeader = async function (url) {
    const response = await util.GET(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.LINK]).toContainLinkRelation(C.header.LINK_REL_TYPE, C.LDP.DirectContainer);
};

Object.assign(DirectContainerTest.testHttpLinkHeader, {
    title:       'DirectContainerTest#testHttpLinkHeader',
    description: 'LDP servers exposing LDPCs MUST advertise their LDP support by exposing a HTTP Link header with a target URI '
                     + 'matching the type of container (see below) the server supports, and a link relation type of type (that is, rel=\'type\') '
                     + 'in all responses to requests made to the LDPC\'s HTTP Request-URI.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP Direct Containers SHOULD use the ldp:member predicate as an LDPC's membership predicate
 * if there is no obvious predicate from an application vocabulary to use.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testUseMemberPredicate manifest#testUseMemberPredicate
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/DirectContainerTest.html#testUseMemberPredicate() api/DirectContainerTest#testUseMemberPredicate
 */
DirectContainerTest.testUseMemberPredicate = async function (url) {
    const response = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

    const data = await util.parseTurtle(response.body);
    expect(data).toContainMatches(
        util.namedNode(response.status.url),
        util.namedNode(C.LDP.hasMemberRelation),
        util.namedNode(C.LDP.member)
    );
};

Object.assign(DirectContainerTest.testUseMemberPredicate, {
    title:       'DirectContainerTest#testUseMemberPredicate',
    description: 'LDP Direct Containers SHOULD use the ldp:member predicate as an LDPC\'s membership predicate '
                     + 'if there is no obvious predicate from an application vocabulary to use.',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * Each LDP Direct Container representation MUST contain exactly one triple
 * whose subject is the LDPC URI, whose predicate is the ldp:membershipResource,
 * and whose object is the LDPC's membership-constant-URI. Commonly the LDPC's URI
 * is the membership-constant-URI, but LDP does not require this.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testMemberResourceTriple manifest#testMemberResourceTriple
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/DirectContainerTest.html#testMemberResourceTriple() api/DirectContainerTest#testMemberResourceTriple
 */
DirectContainerTest.testMemberResourceTriple = async function (url) {
    const response = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

    const data = await util.parseTurtle(response.body);
    expect(data).toContainMatches(
        util.namedNode(response.status.url),
        util.namedNode(C.LDP.membershipResource)
    );
};

Object.assign(DirectContainerTest.testMemberResourceTriple, {
    title:       'DirectContainerTest#testMemberResourceTriple',
    description: 'Each LDP Direct Container representation MUST contain exactly one triple '
                     + 'whose subject is the LDPC URI, whose predicate is the ldp:membershipResource, '
                     + 'and whose object is the LDPC\'s membership-constant-URI. Commonly the LDPC\'s URI '
                     + 'is the membership-constant-URI, but LDP does not require this.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * Each LDP Direct Container representation must contain exactly one triple whose subject is the LDPC URI,
 * and whose predicate is either ldp:hasMemberRelation or ldp:isMemberOfRelation.
 * The object of the triple is constrained by other sections, such as ldp:hasMemberRelation
 * or ldp:isMemberOfRelation, based on the membership triple pattern used by the container.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testMemberRelationOrIsMemberOfRelationTripleExists manifest#testMemberRelationOrIsMemberOfRelationTripleExists
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/DirectContainerTest.html#testMemberRelationOrIsMemberOfRelationTripleExists() api/DirectContainerTest#testMemberRelationOrIsMemberOfRelationTripleExists
 */
DirectContainerTest.testMemberRelationOrIsMemberOfRelationTripleExists = async function (url) {
    const response = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

    const data    = await util.parseTurtle(response.body);
    const subject = util.namedNode(response.status.url);
    expect(
        data.countQuads(subject, util.namedNode(C.LDP.hasMemberRelation))
        + data.countQuads(subject, util.namedNode(C.LDP.isMemberOfRelation))
    ).toBe(1);
};

Object.assign(DirectContainerTest.testMemberRelationOrIsMemberOfRelationTripleExists, {
    title:       'DirectContainerTest#testMemberRelationOrIsMemberOfRelationTripleExists',
    description: 'Each LDP Direct Container representation must contain exactly one triple whose subject is the LDPC URI, '
                     + 'and whose predicate is either ldp:hasMemberRelation or ldp:isMemberOfRelation. '
                     + 'The object of the triple is constrained by other sections, such as ldp:hasMemberRelation '
                     + 'or ldp:isMemberOfRelation, based on the membership triple pattern used by the container.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP Direct Containers MUST behave as if they have a (LDPC URI, ldp:insertedContentRelation , ldp:MemberSubject) triple,
 * but LDP imposes no requirement to materialize such a triple in the LDP-DC representation.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testActAsIfInsertedContentRelationTripleExists manifest#testActAsIfInsertedContentRelationTripleExists
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/DirectContainerTest.html#testActAsIfInsertedContentRelationTripleExists() api/DirectContainerTest#testActAsIfInsertedContentRelationTripleExists
 */
DirectContainerTest.testActAsIfInsertedContentRelationTripleExists = async function (url) {
    // TODO
    throw new Error('not implemented');
};

Object.assign(DirectContainerTest.testActAsIfInsertedContentRelationTripleExists, {
    title:       'DirectContainerTest#testActAsIfInsertedContentRelationTripleExists',
    description: 'LDP Direct Containers MUST behave as if they have a (LDPC URI, ldp:insertedContentRelation , ldp:MemberSubject) triple, '
                     + 'but LDP imposes no requirement to materialize such a triple in the LDP-DC representation.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED, C.tag.TODO]
});

/**
 * When a successful HTTP POST request to an LDPC results in the creation of an LDPR,
 * the LDPC MUST update its membership triples to reflect that addition, and the resulting membership triple
 * MUST be consistent with any LDP-defined predicates it exposes.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPostResourceUpdatesTriples manifest#testPostResourceUpdatesTriples
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/DirectContainerTest.html#testPostResourceUpdatesTriples() api/DirectContainerTest#testPostResourceUpdatesTriples
 */
DirectContainerTest.testPostResourceUpdatesTriples = async function (url) {
    // TODO
    throw new Error('not implemented');
};

Object.assign(DirectContainerTest.testPostResourceUpdatesTriples, {
    title:       'DirectContainerTest#testPostResourceUpdatesTriples',
    description: 'When a successful HTTP POST request to an LDPC results in the creation of an LDPR, '
                     + 'the LDPC MUST update its membership triples to reflect that addition, and the resulting membership triple '
                     + 'MUST be consistent with any LDP-defined predicates it exposes.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED, C.tag.TODO]
});

/**
 * When an LDPR identified by the object of a membership triple which was originally created by the LDP-DC is deleted,
 * the LDPC server MUST also remove the corresponding membership triple.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testDeleteResourceUpdatesTriples manifest#testDeleteResourceUpdatesTriples
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/DirectContainerTest.html#testDeleteResourceUpdatesTriples() api/DirectContainerTest#testDeleteResourceUpdatesTriples
 */
DirectContainerTest.testDeleteResourceUpdatesTriples = async function (url) {
    // TODO
    throw new Error('not implemented');
};

Object.assign(DirectContainerTest.testDeleteResourceUpdatesTriples, {
    title:       'DirectContainerTest#testDeleteResourceUpdatesTriples',
    description: 'When an LDPR identified by the object of a membership triple which was originally created by the LDP-DC is deleted, '
                     + 'the LDPC server MUST also remove the corresponding membership triple.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED, C.tag.TODO]
});

/**
 * Each LDP Direct Container MUST also be a conforming LDP Container
 * in section 5.2 Container along the following restrictions.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testConformsDcLdpContainer manifest#testConformsDcLdpContainer
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/DirectContainerTest.html#testConformsDcLdpContainer() api/DirectContainerTest#testConformsDcLdpContainer
 */
DirectContainerTest.testConformsDcLdpContainer = async function (url) {
    throw new Error('Covered indirectly by the MUST tests defined in CommonContainerTest');
};

Object.assign(DirectContainerTest.testConformsDcLdpContainer, {
    title:       'DirectContainerTest#testConformsDcLdpContainer',
    description: 'Each LDP Direct Container MUST also be a conforming LDP Container '
                     + 'in section 5.2 Container along the following restrictions.',
    tags:        [C.tag.MUST, C.tag.INDIRECT, C.tag.WG_APPROVED]
});

/**
 * LDP servers SHOULD respect all of a client's LDP-defined hints, for example which subsets
 * of LDP-defined state the client is interested in processing, to influence the set of triples returned
 * in representations of an LDPC, particularly for large LDPCs. See also [LDP-PAGING].
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPreferMembershipTriples manifest#testPreferMembershipTriples
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/DirectContainerTest.html#testPreferMembershipTriples() api/DirectContainerTest#testPreferMembershipTriples
 */
DirectContainerTest.testPreferMembershipTriples = async function (url) {
    // TODO
    throw new Error('not implemented');
};

Object.assign(DirectContainerTest.testPreferMembershipTriples, {
    title:       'DirectContainerTest#testPreferMembershipTriples',
    description: 'LDP servers SHOULD respect all of a client\'s LDP-defined hints, for example which subsets '
                     + 'of LDP-defined state the client is interested in processing, to influence the set of triples returned '
                     + 'in representations of an LDPC, particularly for large LDPCs. See also [LDP-PAGING].',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED, C.tag.TODO]
});