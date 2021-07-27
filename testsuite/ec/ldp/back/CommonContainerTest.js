// SEE: https://w3c.github.io/ldp-testsuite/manifest/#org.w3.ldp.testsuite.test.CommonContainerTest manifest#CommonContainerTest
// SEE: https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html

const
    /** @member exports */
    CommonContainerTest = exports,
    C                   = require('./ldp-const.json'),
    util                = require('./ldp-util.js'),
    expect              = require('./ldp-expect.js');

/**
 * @param {string} url
 * @param {string} slug
 * @returns {Promise<void>}
 */
async function testRestrictUriReUse(url, slug) {
    const headers = {[C.header.CONTENT_TYPE]: C.format.TURTLE};
    if (slug) headers[C.header.SLUG] = slug;
    const body = await util.readData('test-bug.ttl');

    const postResponse = await util.POST(url, headers, body);
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location1 = postResponse.headers[C.header.LOCATION];
    expect(location1).toBeNotNull();

    const deleteResponse = await util.DELETE(location1);
    expect(deleteResponse.status.code).toBeStatusCode(C.status.Successful);

    const secondResponse = await util.POST(url, headers, body);
    expect(secondResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location2 = secondResponse.headers[C.header.LOCATION];
    expect(location2).toBeNotNull();

    try {
        expect(location2).not.toBe(location1);
    } finally {
        await util.DELETE(location2);
    }
}

/**
 * LDP servers MAY choose to allow the creation of new resources using HTTP PUT.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPutToCreate manifest#testPutToCreate
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testPutToCreate() api/CommonContainerTest#testPutToCreate
 */
CommonContainerTest.testPutToCreate = async function (url) {
    // REM put is currently disabled on containers
    throw new Error('not implemented');
};

Object.assign(CommonContainerTest.testPutToCreate, {
    title:       'CommonContainerTest#testPutToCreate',
    description: 'LDP servers MAY choose to allow the creation of new resources using HTTP PUT.',
    tags:        [C.tag.MAY, C.tag.AUTOMATED, C.tag.WG_APPROVED, C.tag.TODO]
});

/**
 * LDP servers MUST assign the default base-URI for [RFC3987] relative-URI resolution to be the HTTP Request-URI
 * when the resource already exists, and to the URI of the created resource
 * when the request results in the creation of a new resource.
 * @param {string} url
 * @param {string} [relativeUri=C.default.RELATIVE_URI]
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testRelativeUriResolutionPost manifest#testRelativeUriResolutionPost
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testRelativeUriResolutionPost(java.lang.String) api/CommonContainerTest#testRelativeUriResolutionPost
 */
CommonContainerTest.testRelativeUriResolutionPost = async function (url, relativeUri = C.default.RELATIVE_URI) {
    const creationData = await util.parseTurtle(await util.readData('test-bug.ttl'));
    creationData.addQuad(util.quad(
        util.namedNode(''),
        util.namedNode(C.DCT.relation),
        util.namedNode(relativeUri)
    ));

    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.TURTLE
    }, await util.serializeTurtle(creationData));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    try {
        const getResponse = await util.GET(location, {
            [C.header.ACCEPT]: C.format.TURTLE
        });
        expect(getResponse.status.code).toBeStatusCode(C.status.Successful);
        expect(getResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

        const
            getData             = await util.parseTurtle(getResponse.body),
            relationAbsoluteUri = util.ldpAbsoluteUri(location, relativeUri);
        expect(getData).toContainMatches(
            util.namedNode(location),
            util.namedNode(C.DCT.relation),
            util.namedNode(relationAbsoluteUri)
        );
    } finally {
        await util.DELETE(location);
    }
};

Object.assign(CommonContainerTest.testRelativeUriResolutionPost, {
    title:       'CommonContainerTest#testRelativeUriResolutionPost',
    description: 'LDP servers MUST assign the default base-URI for [RFC3987] relative-URI resolution to be the HTTP Request-URI '
                     + 'when the resource already exists, and to the URI of the created resource '
                     + 'when the request results in the creation of a new resource.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDPC representations SHOULD NOT use RDF container types rdf:Bag, rdf:Seq or rdf:List.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testNoRdfBagSeqOrList manifest#testNoRdfBagSeqOrList
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testNoRdfBagSeqOrList() api/CommonContainerTest#testNoRdfBagSeqOrList
 */
CommonContainerTest.testNoRdfBagSeqOrList = async function (url) {
    const response = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

    const data = await util.parseTurtle(response.body);
    expect(data).not.toContainMatches(
        util.namedNode(response.status.url),
        util.namedNode(C.RDF.type),
        util.namedNode(C.RDF.Bag)
    );
    expect(data).not.toContainMatches(
        util.namedNode(response.status.url),
        util.namedNode(C.RDF.type),
        util.namedNode(C.RDF.Seq)
    );
    expect(data).not.toContainMatches(
        util.namedNode(response.status.url),
        util.namedNode(C.RDF.type),
        util.namedNode(C.RDF.List)
    );
};

Object.assign(CommonContainerTest.testNoRdfBagSeqOrList, {
    title:       'CommonContainerTest#testNoRdfBagSeqOrList',
    description: 'LDPC representations SHOULD NOT use RDF container types rdf:Bag, rdf:Seq or rdf:List.',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers SHOULD respect all of a client's LDP-defined hints, for example which subsets of LDP-defined state
 * the client is interested in processing, to influence the set of triples returned in representations of an LDPC,
 * particularly for large LDPCs. See also [LDP-PAGING].
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPreferContainmentTriples manifest#testPreferContainmentTriples
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testPreferContainmentTriples() api/CommonContainerTest#testPreferContainmentTriples
 */
CommonContainerTest.testPreferContainmentTriples = async function (url) {
    // TODO
    throw new Error('not implemented');
};

Object.assign(CommonContainerTest.testPreferContainmentTriples, {
    title:       'CommonContainerTest#testPreferContainmentTriples',
    description: 'LDP servers SHOULD respect all of a client\'s LDP-defined hints, for example which subsets of LDP-defined state '
                     + 'the client is interested in processing, to influence the set of triples returned in representations of an LDPC, '
                     + 'particularly for large LDPCs. See also [LDP-PAGING].',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED, C.tag.TODO]
});

/**
 * If the resource was created successfully, LDP servers MUST respond with status code 201 (Created)
 * and the Location header set to the new resource’s URL. Clients shall not expect any representation
 * in the response entity body on a 201 (Created) response.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPostResponseStatusAndLocation manifest#testPostResponseStatusAndLocation
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testPostResponseStatusAndLocation() api/CommonContainerTest#testPostResponseStatusAndLocation
 */
CommonContainerTest.testPostResponseStatusAndLocation = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.TURTLE
    }, await util.readData('test-bug.ttl'));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    await util.DELETE(location);
};

Object.assign(CommonContainerTest.testPostResponseStatusAndLocation, {
    title:       'CommonContainerTest#testPostResponseStatusAndLocation',
    description: 'If the resource was created successfully, LDP servers MUST respond with status code 201 (Created) '
                     + 'and the Location header set to the new resource’s URL. Clients shall not expect any representation '
                     + 'in the response entity body on a 201 (Created) response.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * When a successful HTTP POST request to an LDPC results in the creation of an LDPR, a containment triple
 * MUST be added to the state of LDPC.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPostContainer manifest#testPostContainer
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testPostContainer() api/CommonContainerTest#testPostContainer
 */
CommonContainerTest.testPostContainer = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.TURTLE
    }, await util.readData('test-bug.ttl'));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    try {
        const getResponse = await util.GET(url, {
            [C.header.ACCEPT]: C.format.TURTLE
        });
        expect(getResponse.status.code).toBeStatusCode(C.status.Successful);
        expect(getResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

        const getData = await util.parseTurtle(getResponse.body);
        expect(getData).toContainMatches(
            util.namedNode(getResponse.status.url),
            util.namedNode(C.LDP.contains),
            util.namedNode(location)
        );
    } finally {
        await util.DELETE(location);
    }
};

Object.assign(CommonContainerTest.testPostContainer, {
    title:       'CommonContainerTest#testPostContainer',
    description: 'When a successful HTTP POST request to an LDPC results in the creation of an LDPR, a containment triple '
                     + 'MUST be added to the state of LDPC.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers that successfully create a resource from a RDF representation in the request entity body
 * MUST honor the client's requested interaction model(s). The created resource can be thought of
 * as an RDF named graph [rdf11-concepts]. If any model cannot be honored, the server MUST fail the request.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testRequestedInteractionModelCreateNotAllowed manifest#testRequestedInteractionModelCreateNotAllowed
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testRequestedInteractionModelCreateNotAllowed(java.lang.String) api/CommonContainerTest#testRequestedInteractionModelCreateNotAllowed
 */
CommonContainerTest.testRequestedInteractionModelCreateNotAllowed = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.TURTLE
    }, await util.readData('test-bug.ttl'));

    if (postResponse.status.code === C.status.CREATED && postResponse.headers['location'])
        await util.DELETE(postResponse.headers['location']);

    expect(postResponse.status.code).not.toBeStatusCode(C.status.CREATED);
};

Object.assign(CommonContainerTest.testRequestedInteractionModelCreateNotAllowed, {
    title:       'CommonContainerTest#testRequestedInteractionModelCreateNotAllowed',
    description: 'LDP servers that successfully create a resource from a RDF representation in the request entity body '
                     + 'MUST honor the client\'s requested interaction model(s). The created resource can be thought of '
                     + 'as an RDF named graph [rdf11-concepts]. If any model cannot be honored, the server MUST fail the request.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers that successfully create a resource from a RDF representation in the request entity body
 * MUST honor the client's requested interaction model(s). The created resource can be thought of
 * as an RDF named graph [rdf11-concepts]. If any model cannot be honored, the server MUST fail the request.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testRequestedInteractionModelHeaders manifest#testRequestedInteractionModelHeaders
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testRequestedInteractionModelHeaders(java.lang.String) api/CommonContainerTest#testRequestedInteractionModelHeaders
 */
CommonContainerTest.testRequestedInteractionModelHeaders = async function (url) {
    const response = await util.HEAD(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.LINK]).not.toContainLinkRelation(C.header.LINK_REL_TYPE, C.LDP.BasicContainer);
    expect(response.headers[C.header.LINK]).not.toContainLinkRelation(C.header.LINK_REL_TYPE, C.LDP.DirectContainer);
    expect(response.headers[C.header.LINK]).not.toContainLinkRelation(C.header.LINK_REL_TYPE, C.LDP.IndirectContainer);
};

Object.assign(CommonContainerTest.testRequestedInteractionModelHeaders, {
    title:       'CommonContainerTest#testRequestedInteractionModelHeaders',
    description: 'LDP servers that successfully create a resource from a RDF representation in the request entity body '
                     + 'MUST honor the client\'s requested interaction model(s). The created resource can be thought of '
                     + 'as an RDF named graph [rdf11-concepts]. If any model cannot be honored, the server MUST fail the request.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers MUST accept a request entity body with a request header of Content-Type
 * with value of text/turtle [turtle].
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testAcceptTurtle manifest#testAcceptTurtle
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testAcceptTurtle() api/CommonContainerTest#testAcceptTurtle
 */
CommonContainerTest.testAcceptTurtle = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.TURTLE
    }, await util.readData('test-bug.ttl'));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    if (location) await util.DELETE(location);
};

Object.assign(CommonContainerTest.testAcceptTurtle, {
    title:       'CommonContainerTest#testAcceptTurtle',
    description: 'LDP servers MUST accept a request entity body with a request header of Content-Type '
                     + 'with value of text/turtle [turtle].',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers SHOULD use the Content-Type request header to determine the representation format
 * when the request has an entity body.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testContentTypeHeader manifest#testContentTypeHeader
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testContentTypeHeader() api/CommonContainerTest#testContentTypeHeader
 */
CommonContainerTest.testContentTypeHeader = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: 'text/this-is-not-turtle'
    }, util.readData('test-bug.ttl'));
    if (postResponse.status.code === C.status.UNSUPPORTED_MEDIA_TYPE) return;

    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    try {
        const getResponse = await util.GET(location);
        expect(postResponse.status.code).toBeStatusCode(C.status.Successful);
        expect(getResponse.headers[C.header.CONTENT_TYPE]).not.toBeContentType(C.format.TURTLE);
        expect(getResponse.headers[C.header.LINK]).not.toContainLinkRelation(C.header.LINK_REL_TYPE, C.LDP.RDFSource);
    } finally {
        await util.DELETE(location);
    }
};

Object.assign(CommonContainerTest.testContentTypeHeader, {
    title:       'CommonContainerTest#testContentTypeHeader',
    description: 'LDP servers SHOULD use the Content-Type request header to determine the representation format '
                     + 'when the request has an entity body.',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * In RDF representations, LDP servers MUST interpret the null relative URI for the subject of triples
 * in the LDPR representation in the request entity body as referring to the entity in the request body.
 * Commonly, that entity is the model for the “to be created” LDPR, so triples whose subject is the null
 * relative URI will usually result in triples in the created resource whose subject is the created resource.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testNullRelativeUriPost manifest#testNullRelativeUriPost
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testNullRelativeUriPost() api/CommonContainerTest#testNullRelativeUriPost
 */
CommonContainerTest.testNullRelativeUriPost = async function (url) {
    const creationData = await util.parseTurtle(await util.readData('test-bug.ttl'));

    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.TURTLE
    }, await util.serializeTurtle(creationData));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    try {
        const getResponse = await util.GET(location, {
            [C.header.ACCEPT]: C.format.TURTLE
        });
        expect(getResponse.status.code).toBeStatusCode(C.status.Successful);
        expect(getResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

        const getData = await util.parseTurtle(getResponse.body);
        for (let quad of creationData.getQuads(util.namedNode(''))) {
            expect(getData).toContainMatches(
                util.namedNode(location),
                quad.predicate,
                quad.object
            );
        }
    } finally {
        await util.DELETE(location);
    }
};

Object.assign(CommonContainerTest.testNullRelativeUriPost, {
    title:       'CommonContainerTest#testNullRelativeUriPost',
    description: 'In RDF representations, LDP servers MUST interpret the null relative URI for the subject of triples '
                     + 'in the LDPR representation in the request entity body as referring to the entity in the request body. '
                     + 'Commonly, that entity is the model for the “to be created” LDPR, so triples whose subject is the null '
                     + 'relative URI will usually result in triples in the created resource whose subject is the created resource.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers SHOULD assign the URI for the resource to be created using server application specific rules
 * in the absence of a client hint.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPostNoSlug manifest#testPostNoSlug
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testPostNoSlug() api/CommonContainerTest#testPostNoSlug
 */
CommonContainerTest.testPostNoSlug = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.TURTLE
    }, await util.readData('test-bug.ttl'));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    await util.DELETE(location);
};

Object.assign(CommonContainerTest.testPostNoSlug, {
    title:       'CommonContainerTest#testPostNoSlug',
    description: 'LDP servers SHOULD assign the URI for the resource to be created using server application specific rules '
                     + 'in the absence of a client hint.',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers SHOULD allow clients to create new resources without requiring detailed knowledge
 * of application-specific constraints. This is a consequence of the requirement to enable simple creation
 * and modification of LDPRs. LDP servers expose these application-specific constraints
 * as described in section 4.2.1 General.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testCreateWithoutConstraints manifest#testCreateWithoutConstraints
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testCreateWithoutConstraints() api/CommonContainerTest#testCreateWithoutConstraints
 */
CommonContainerTest.testCreateWithoutConstraints = async function (url) {
    const creationData = await util.parseTurtle('');
    creationData.addQuad(util.quad(
        util.namedNode(''),
        util.namedNode(C.DCT.title),
        util.literal('Created by the LDP test suite')
    ));

    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.TURTLE
    }, await util.serializeTurtle(creationData));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    if (location) await util.DELETE(location);
};

Object.assign(CommonContainerTest.testCreateWithoutConstraints, {
    title:       'CommonContainerTest#testCreateWithoutConstraints',
    description: 'LDP servers SHOULD allow clients to create new resources without requiring detailed knowledge '
                     + 'of application-specific constraints. This is a consequence of the requirement to enable simple creation '
                     + 'and modification of LDPRs. LDP servers expose these application-specific constraints '
                     + 'as described in section 4.2.1 General.',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers that allow member creation via POST SHOULD NOT re-use URIs.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testRestrictUriReUseSlug manifest#testRestrictUriReUseSlug
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testRestrictUriReUseSlug() api/CommonContainerTest#testRestrictUriReUseSlug
 */
CommonContainerTest.testRestrictUriReUseSlug = async function (url) {
    await testRestrictUriReUse(url, 'uritest');
};

Object.assign(CommonContainerTest.testRestrictUriReUseSlug, {
    title:       'CommonContainerTest#testRestrictUriReUseSlug',
    description: 'LDP servers that allow member creation via POST SHOULD NOT re-use URIs.',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers that allow member creation via POST SHOULD NOT re-use URIs.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testRestrictUriReUseNoSlug manifest#testRestrictUriReUseNoSlug
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testRestrictUriReUseNoSlug() api/CommonContainerTest#testRestrictUriReUseNoSlug
 */
CommonContainerTest.testRestrictUriReUseNoSlug = async function (url) {
    await testRestrictUriReUse(url);
};

Object.assign(CommonContainerTest.testRestrictUriReUseNoSlug, {
    title:       'CommonContainerTest#testRestrictUriReUseNoSlug',
    description: 'LDP servers that allow member creation via POST SHOULD NOT re-use URIs.',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers that support POST MUST include an Accept-Post response header on HTTP OPTIONS responses,
 * listing post document media type(s) supported by the server.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testAcceptPostResponseHeader manifest#testAcceptPostResponseHeader
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testAcceptPostResponseHeader() api/CommonContainerTest#testAcceptPostResponseHeader
 */
CommonContainerTest.testAcceptPostResponseHeader = async function (url) {
    const response = await util.OPTIONS(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.ALLOW]).toMatch('POST');
    expect(response.headers[C.header.ACCEPT_POST]).toBeNotNull();
};

Object.assign(CommonContainerTest.testAcceptPostResponseHeader, {
    title:       'CommonContainerTest#testAcceptPostResponseHeader',
    description: 'LDP servers that support POST MUST include an Accept-Post response header on HTTP OPTIONS responses, '
                     + 'listing post document media type(s) supported by the server.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers SHOULD NOT allow HTTP PUT to update an LDPC’s containment triples;
 * if the server receives such a request, it SHOULD respond with a 409 (Conflict) status code.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testRejectPutModifyingContainmentTriples manifest#testRejectPutModifyingContainmentTriples
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testRejectPutModifyingContainmentTriples() api/CommonContainerTest#testRejectPutModifyingContainmentTriples
 */
CommonContainerTest.testRejectPutModifyingContainmentTriples = async function (url) {
    const getResponse = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(getResponse.status.code).toBeStatusCode(C.status.Successful);
    expect(getResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);
    const etag = getResponse.headers['etag'];

    const getData = await util.parseTurtle(getResponse.body);
    getData.addQuad(util.quad(
        util.namedNode(getResponse.status.url),
        util.namedNode(C.LDP.contains),
        util.namedNode('#' + Date.now())
    ));

    const headers = {[C.header.CONTENT_TYPE]: C.format.TURTLE};
    if (etag) headers[C.header.IF_MATCH] = etag;
    const putResponse = await util.PUT(url, headers, await util.serializeTurtle(getData));
    expect(putResponse.status.code).not.toBeStatusCode(C.status.Successful);
};

Object.assign(CommonContainerTest.testRejectPutModifyingContainmentTriples, {
    title:       'CommonContainerTest#testRejectPutModifyingContainmentTriples',
    description: 'LDP servers SHOULD NOT allow HTTP PUT to update an LDPC’s containment triples; '
                     + 'if the server receives such a request, it SHOULD respond with a 409 (Conflict) status code.',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers that allow LDPR creation via PUT SHOULD NOT re-use URIs. For RDF representations (LDP-RSs),
 * the created resource can be thought of as an RDF named graph [rdf11-concepts].
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testRestrictPutReUseUri manifest#testRestrictPutReUseUri
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testRestrictPutReUseUri() api/CommonContainerTest#testRestrictPutReUseUri
 */
CommonContainerTest.testRestrictPutReUseUri = async function (url) {
    // REM put is currently disabled on containers
    throw new Error('not implemented');
};

Object.assign(CommonContainerTest.testRestrictPutReUseUri, {
    title:       'CommonContainerTest#testRestrictPutReUseUri',
    description: 'LDP servers that allow LDPR creation via PUT SHOULD NOT re-use URIs. For RDF representations (LDP-RSs), '
                     + 'the created resource can be thought of as an RDF named graph [rdf11-concepts].',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED, C.tag.TODO]
});

/**
 * When an LDPR identified by the object of a containment triple is deleted,
 * the LDPC server MUST also remove the LDPR from the containing LDPC by removing the corresponding containment triple.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testDeleteRemovesContainmentTriple manifest#testDeleteRemovesContainmentTriple
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testDeleteRemovesContainmentTriple() api/CommonContainerTest#testDeleteRemovesContainmentTriple
 */
CommonContainerTest.testDeleteRemovesContainmentTriple = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.TURTLE
    }, await util.readData('test-bug.ttl'));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    const deleteResponse = await util.DELETE(location);
    expect(deleteResponse.status.code).toBeStatusCode(C.status.Successful);

    const getResponse = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE,
        [C.header.PREFER]: util.ldpPreference(C.header.PREFER_INCLUDE, C.LDP.PreferContainment)
    });
    expect(getResponse.status.code).toBeStatusCode(C.status.Successful);
    expect(getResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

    const getData = await util.parseTurtle(getResponse.body);
    expect(getData).not.toContainMatches(
        util.namedNode(postResponse.status.url),
        util.namedNode(C.LDP.contains),
        util.namedNode(location)
    );
};

Object.assign(CommonContainerTest.testDeleteRemovesContainmentTriple, {
    title:       'CommonContainerTest#testDeleteRemovesContainmentTriple',
    description: 'When an LDPR identified by the object of a containment triple is deleted, '
                     + 'the LDPC server MUST also remove the LDPR from the containing LDPC by removing the corresponding containment triple.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers are RECOMMENDED to support HTTP PATCH as the preferred method
 * for updating an LDPC's empty-container triples.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPatchMethod manifest#testPatchMethod
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testPatchMethod() api/CommonContainerTest#testPatchMethod
 */
CommonContainerTest.testPatchMethod = async function (url) {
    // TODO
    throw new Error('not implemented');
};

Object.assign(CommonContainerTest.testPatchMethod, {
    title:       'CommonContainerTest#testPatchMethod',
    description: 'LDP servers are RECOMMENDED to support HTTP PATCH as the preferred method '
                     + 'for updating an LDPC\'s empty-container triples.',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED, C.tag.TODO]
});

/**
 * The representation of a LDPC MAY have an rdf:type of ldp:Container for Linked Data Platform Container.
 * Non-normative note: LDPCs might have additional types, like any LDP-RS.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testRdfTypeLdpContainer manifest#testRdfTypeLdpContainer
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testRdfTypeLdpContainer() api/CommonContainerTest#testRdfTypeLdpContainer
 */
CommonContainerTest.testRdfTypeLdpContainer = async function (url) {
    const response = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

    const data = await util.parseTurtle(response.body);
    expect(data).toContainMatches(
        util.namedNode(response.status.url),
        util.namedNode(C.RDF.type),
        util.namedNode(C.LDP.Container)
    );
};

Object.assign(CommonContainerTest.testRdfTypeLdpContainer, {
    title:       'CommonContainerTest#testRdfTypeLdpContainer',
    description: 'The representation of a LDPC MAY have an rdf:type of ldp:Container for Linked Data Platform Container. '
                     + 'Non-normative note: LDPCs might have additional types, like any LDP-RS.',
    tags:        [C.tag.MAY, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers MAY allow clients to suggest the URI for a resource created through POST,
 * using the HTTP Slug header as defined in [RFC5023]. LDP adds no new requirements to this usage,
 * so its presence functions as a client hint to the server providing a desired string to be incorporated
 * into the server's final choice of resource URI.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testServerHonorsSlug manifest#testServerHonorsSlug
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testServerHonorsSlug() api/CommonContainerTest#testServerHonorsSlug
 */
CommonContainerTest.testServerHonorsSlug = async function (url) {
    const slug = 'test-' + Math.floor(1000 + Math.random() * 9000);

    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.TURTLE,
        [C.header.SLUG]:         slug
    }, await util.readData('test-bug.ttl'));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    try {
        expect(location).toMatch(slug);
    } finally {
        await util.DELETE(location);
    }
};

Object.assign(CommonContainerTest.testServerHonorsSlug, {
    title:       'CommonContainerTest#testServerHonorsSlug',
    description: 'LDP servers MAY allow clients to suggest the URI for a resource created through POST, '
                     + 'using the HTTP Slug header as defined in [RFC5023]. LDP adds no new requirements to this usage, '
                     + 'so its presence functions as a client hint to the server providing a desired string to be incorporated '
                     + 'into the server\'s final choice of resource URI.',
    tags:        [C.tag.MAY, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers SHOULD accept a request entity body with a request header of Content-Type
 * with value of application/ld+json [JSON-LD].
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPostJsonLd manifest#testPostJsonLd
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testPostJsonLd() api/CommonContainerTest#testPostJsonLd
 */
CommonContainerTest.testPostJsonLd = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.JSON_LD
    }, await util.readData('test-bug.json'));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    try {
        const getResponse = await util.GET(location, {
            [C.header.ACCEPT]: C.format.TURTLE
        });
        expect(getResponse.status.code).toBeStatusCode(C.status.Successful);
        expect(getResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);
        expect(getResponse.headers[C.header.LINK]).not.toContainLinkRelation(C.header.LINK_REL_TYPE, C.LDP.NonRDFSource);
    } finally {
        await util.DELETE(location);
    }
};

Object.assign(CommonContainerTest.testPostJsonLd, {
    title:       'CommonContainerTest#testPostJsonLd',
    description: 'LDP servers SHOULD accept a request entity body with a request header of Content-Type '
                     + 'with value of application/ld+json [JSON-LD].',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * Each Linked Data Platform Container MUST also be a conforming Linked Data Platform RDF Source.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testConformsContainerRdfResource manifest#testConformsContainerRdfResource
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonContainerTest.html#testConformsContainerRdfResource() api/CommonContainerTest#testConformsContainerRdfResource
 */
CommonContainerTest.testConformsContainerRdfResource = async function (url) {
    throw new Error('Covered indirectly by the MUST tests defined in RdfSourceTest');
};

Object.assign(CommonContainerTest.testConformsContainerRdfResource, {
    title:       'CommonContainerTest#testConformsContainerRdfResource',
    description: 'Each Linked Data Platform Container MUST also be a conforming Linked Data Platform RDF Source.',
    tags:        [C.tag.MUST, C.tag.INDIRECT, C.tag.WG_APPROVED]
});