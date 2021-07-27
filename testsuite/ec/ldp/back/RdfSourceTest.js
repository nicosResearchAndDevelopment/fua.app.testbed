// SEE: https://w3c.github.io/ldp-testsuite/manifest/#org.w3.ldp.testsuite.test.RdfSourceTest manifest#RdfSourceTest
// SEE: https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html

const
    /** @member exports */
    RdfSourceTest = exports,
    C             = require('./ldp-const.json'),
    util          = require('./ldp-util.js'),
    expect        = require('./ldp-expect.js');

/**
 * @param {string} url
 * @param {boolean} continueOnError
 * @returns {Promise<InterfaceResponse>}
 */
async function putReplaceResource(url, continueOnError) {
    const getResponse = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(getResponse.status.code).toBeStatusCode(C.status.Successful);
    expect(getResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);
    const etag = getResponse.headers['etag'];
    expect(etag).toBeEntityTag();

    const
        getData = await util.parseTurtle(getResponse.body),
        subject = util.namedNode(getResponse.status.url);
    expect(getData).toContainMatches(subject);
    const
        predicate  = util.namedNode(C.DCT.title),
        title      = util.literal('This resources content has been replaced (' + Date.now() + ')'),
        updateQuad = util.quad(subject, predicate, title);
    getData.removeMatches(subject, predicate);
    getData.addQuad(updateQuad);

    const putResponse = await util.PUT(url, {
        [C.header.CONTENT_TYPE]: C.format.TURTLE,
        [C.header.IF_MATCH]:     etag
    }, await util.serializeTurtle(getData));
    expect(putResponse.status.code).toBeStatusCode(C.status.Successful);
    // REM if continueOnError is true and the status code is not successful,
    // the original method would throws a skip exception, but we will just throw regularly in both cases

    const secondResponse = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(secondResponse.status.code).toBeStatusCode(C.status.Successful);
    expect(secondResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

    const secondData = await util.parseTurtle(secondResponse.body);
    expect(secondData).toContainMatches(subject, predicate, title);
    expect(secondData.countQuads(subject, predicate)).toBe(1);
}

/**
 * @param {string} url
 * @param {string} invalidProp
 * @returns {Promise<InterfaceResponse>}
 */
async function expectPut4xxConstrainedBy(url, invalidProp) {
    // TODO
}

/**
 * @param {string} url
 * @param {string} invalidProp
 * @returns {Promise<InterfaceResponse>}
 */
async function expectPut4xxStatus(url, invalidProp) {
    const getResponse = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(getResponse.status.code).toBeStatusCode(C.status.Successful);
    expect(getResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);
    const etag = getResponse.headers['etag'];
    expect(etag).toBeEntityTag();

    const
        getData   = await util.parseTurtle(getResponse.body),
        subject   = util.namedNode(getResponse.status.url),
        predicate = util.namedNode(invalidProp),
        modified  = util.literal('modified');
    getData.removeMatches(subject, predicate);
    getData.addQuad(util.quad(subject, predicate, modified));

    const putResponse = await util.PUT(url, {
        [C.header.CONTENT_TYPE]: C.format.TURTLE,
        [C.header.IF_MATCH]:     etag
    }, await util.serializeTurtle(getData));
    expect(putResponse.status.code).toBeStatusCode(C.status.ClientError);

    return putResponse;
}

/**
 * @param {string} url
 * @param {string} invalidProp
 * @returns {Promise<InterfaceResponse>}
 */
async function expectPut4xxResponseBody(url, invalidProp) {
    const putResponse = await expectPut4xxStatus.call(this, url, invalidProp);
    expect(putResponse.body).toMatch(util.pattern.nonempty);

    return putResponse;
}

/**
 * LDP servers MUST assign the default base-URI for [RFC3987] relative-URI resolution
 * to be the HTTP Request-URI when the resource already exists, and to the URI of the created resource
 * when the request results in the creation of a new resource.
 * @param {string} url
 * @param {string} [relativeUri=C.default.RELATIVE_URI]
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testRelativeUriResolutionPut manifest#testRelativeUriResolutionPut
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testRelativeUriResolutionPut(java.lang.String) api/RdfSourceTest#testRelativeUriResolutionPut
 */
RdfSourceTest.testRelativeUriResolutionPut = async function (url, relativeUri = C.default.RELATIVE_URI) {
    const getResponse = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(getResponse.status.code).toBeStatusCode(C.status.Successful);
    expect(getResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);
    const etag = getResponse.headers['etag'];
    expect(etag).toBeEntityTag();

    const
        getData             = await util.parseTurtle(getResponse.body),
        relationAbsoluteUri = util.ldpAbsoluteUri(getResponse.status.url, relativeUri),
        subject             = util.namedNode(getResponse.status.url),
        predicate           = util.namedNode(C.DCT.relation);
    getData.addQuad(util.quad(
        subject, predicate,
        util.namedNode(relativeUri)
    ));

    const putResponse = await util.PUT(url, {
        [C.header.CONTENT_TYPE]: C.format.TURTLE,
        [C.header.IF_MATCH]:     etag
    }, await util.serializeTurtle(getData));
    expect(putResponse.status.code).toBeStatusCode(C.status.Successful);

    const secondResponse = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(secondResponse.status.code).toBeStatusCode(C.status.Successful);
    expect(secondResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

    const secondData = await util.parseTurtle(secondResponse.body);
    expect(secondData).toContainMatches(
        subject, predicate,
        util.namedNode(relationAbsoluteUri)
    );
};

Object.assign(RdfSourceTest.testRelativeUriResolutionPut, {
    title:       'RdfSourceTest#testRelativeUriResolutionPut',
    description: 'LDP servers MUST assign the default base-URI for [RFC3987] relative-URI resolution '
                     + 'to be the HTTP Request-URI when the resource already exists, and to the URI of the created resource '
                     + 'when the request results in the creation of a new resource.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * If a HTTP PUT is accepted on an existing resource, LDP servers MUST replace the entire persistent state
 * of the identified resource with the entity representation in the body of the request.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPutReplacesResource manifest#testPutReplacesResource
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testPutReplacesResource() api/RdfSourceTest#testPutReplacesResource
 */
RdfSourceTest.testPutReplacesResource = async function (url) {
    await putReplaceResource.call(this, url, true);
};

Object.assign(RdfSourceTest.testPutReplacesResource, {
    title:       'RdfSourceTest#testPutReplacesResource',
    description: 'If a HTTP PUT is accepted on an existing resource, LDP servers MUST replace the entire persistent state '
                     + 'of the identified resource with the entity representation in the body of the request.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers SHOULD allow clients to update resources without requiring detailed knowledge
 * of server-specific constraints. This is a consequence of the requirement
 * to enable simple creation and modification of LDPRs.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPutSimpleUpdate manifest#testPutSimpleUpdate
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testPutSimpleUpdate() api/RdfSourceTest#testPutSimpleUpdate
 */
RdfSourceTest.testPutSimpleUpdate = async function (url) {
    await putReplaceResource.call(this, url, false);
};

Object.assign(RdfSourceTest.testPutSimpleUpdate, {
    title:       'RdfSourceTest#testPutSimpleUpdate',
    description: 'LDP servers SHOULD allow clients to update resources without requiring detailed knowledge '
                     + 'of server-specific constraints. This is a consequence of the requirement '
                     + 'to enable simple creation and modification of LDPRs.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers MUST provide an RDF representation for LDP-RSs.
 * The HTTP Request-URI of the LDP-RS is typically the subject of most triples in the response.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testGetResource manifest#testGetResource
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testGetResource() api/RdfSourceTest#testGetResource
 */
RdfSourceTest.testGetResource = async function (url) {
    const response = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);
};

Object.assign(RdfSourceTest.testGetResource, {
    title:       'RdfSourceTest#testGetResource',
    description: 'LDP servers MUST provide an RDF representation for LDP-RSs. '
                     + 'The HTTP Request-URI of the LDP-RS is typically the subject of most triples in the response.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP-RSs representations SHOULD have at least one rdf:type set explicitly.
 * This makes the representations much more useful to client applications that don’t support inferencing.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testContainsRdfType manifest#testContainsRdfType
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testContainsRdfType() api/RdfSourceTest#testContainsRdfType
 */
RdfSourceTest.testContainsRdfType = async function (url) {
    const response = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

    const data = await util.parseTurtle(response.body);
    expect(data).toContainMatches(
        util.namedNode(response.status.url),
        util.namedNode(C.RDF.type)
    );
};

Object.assign(RdfSourceTest.testContainsRdfType, {
    title:       'RdfSourceTest#testContainsRdfType',
    description: 'LDP-RSs representations SHOULD have at least one rdf:type set explicitly. '
                     + 'This makes the representations much more useful to client applications that don’t support inferencing.',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * The representation of a LDP-RS MAY have an rdf:type of ldp:RDFSource for Linked Data Platform RDF Source.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testTypeRdfSource manifest#testTypeRdfSource
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testTypeRdfSource() api/RdfSourceTest#testTypeRdfSource
 */
RdfSourceTest.testTypeRdfSource = async function (url) {
    const response = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

    const data = await util.parseTurtle(response.body);
    expect(data).toContainMatches(
        util.namedNode(response.status.url),
        util.namedNode(C.RDF.type),
        util.namedNode(C.LDP.RDFSource)
    );
};

Object.assign(RdfSourceTest.testTypeRdfSource, {
    title:       'RdfSourceTest#testTypeRdfSource',
    description: 'The representation of a LDP-RS MAY have an rdf:type of ldp:RDFSource for Linked Data Platform RDF Source.',
    tags:        [C.tag.MAY, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP-RSs SHOULD reuse existing vocabularies instead of creating their own duplicate vocabulary terms.
 * In addition to this general rule, some specific cases are covered by other conformance rules.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testReUseVocabularies manifest#testReUseVocabularies
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testReUseVocabularies() api/RdfSourceTest#testReUseVocabularies
 */
RdfSourceTest.testReUseVocabularies = async function (url) {
    throw new Error('not implemented / manual test');
};

Object.assign(RdfSourceTest.testReUseVocabularies, {
    title:       'RdfSourceTest#testReUseVocabularies',
    description: 'LDP-RSs SHOULD reuse existing vocabularies instead of creating their own duplicate vocabulary terms. '
                     + 'In addition to this general rule, some specific cases are covered by other conformance rules.',
    tags:        [C.tag.SHOULD, C.tag.MANUAL, C.tag.WG_APPROVED]
});

/**
 * LDP-RSs predicates SHOULD use standard vocabularies such as Dublin Core [DC-TERMS],
 * RDF [rdf11-concepts] and RDF Schema [rdf-schema], whenever possible.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testUseStandardVocabularies manifest#testUseStandardVocabularies
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testUseStandardVocabularies() api/RdfSourceTest#testUseStandardVocabularies
 */
RdfSourceTest.testUseStandardVocabularies = async function (url) {
    throw new Error('not implemented / manual test');
};

Object.assign(RdfSourceTest.testUseStandardVocabularies, {
    title:       'RdfSourceTest#testUseStandardVocabularies',
    description: 'LDP-RSs predicates SHOULD use standard vocabularies such as Dublin Core [DC-TERMS], '
                     + 'RDF [rdf11-concepts] and RDF Schema [rdf-schema], whenever possible.',
    tags:        [C.tag.SHOULD, C.tag.MANUAL, C.tag.WG_APPROVED]
});

/**
 * LDP servers MUST NOT require LDP clients to implement inferencing in order to recognize
 * the subset of content defined by LDP. Other specifications built on top of LDP may require clients
 * to implement inferencing [rdf11-concepts]. The practical implication is that all content
 * defined by LDP must be explicitly represented, unless noted otherwise within this document.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testRestrictClientInference manifest#testRestrictClientInference
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testRestrictClientInference() api/RdfSourceTest#testRestrictClientInference
 */
RdfSourceTest.testRestrictClientInference = async function (url) {
    throw new Error('not implemented / manual test');
};

Object.assign(RdfSourceTest.testRestrictClientInference, {
    title:       'RdfSourceTest#testRestrictClientInference',
    description: 'LDP servers MUST NOT require LDP clients to implement inferencing in order to recognize '
                     + 'the subset of content defined by LDP. Other specifications built on top of LDP may require clients '
                     + 'to implement inferencing [rdf11-concepts]. The practical implication is that all content '
                     + 'defined by LDP must be explicitly represented, unless noted otherwise within this document.',
    tags:        [C.tag.MUST, C.tag.MANUAL, C.tag.WG_APPROVED]
});

/**
 * LDP servers must respond with a Turtle representation of the requested LDP-RS
 * when the request includes an Accept header specifying text/turtle,
 * unless HTTP content negotiation requires a different outcome [turtle].
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testGetResourceAcceptTurtle manifest#testGetResourceAcceptTurtle
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testGetResourceAcceptTurtle() api/RdfSourceTest#testGetResourceAcceptTurtle
 */
RdfSourceTest.testGetResourceAcceptTurtle = async function (url) {
    const response = await util.GET(url, {
        [C.header.ACCEPT]: C.format.TURTLE
    });
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);
    await util.parseTurtle(response.body);

    const secondResponse = await util.GET(url, {
        [C.header.ACCEPT]: 'text/turtle;q=0.9,application/json;q=0.8'
    });
    expect(secondResponse.status.code).toBeStatusCode(C.status.Successful);
    expect(secondResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);
    await util.parseTurtle(secondResponse.body);
};

Object.assign(RdfSourceTest.testGetResourceAcceptTurtle, {
    title:       'RdfSourceTest#testGetResourceAcceptTurtle',
    description: 'LDP servers must respond with a Turtle representation of the requested LDP-RS '
                     + 'when the request includes an Accept header specifying text/turtle, '
                     + 'unless HTTP content negotiation requires a different outcome [turtle].',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers should respond with a text/turtle representation of the requested LDP-RS
 * whenever the Accept request header is absent [turtle].
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testGetResourceAsTurtleNoAccept manifest#testGetResourceAsTurtleNoAccept
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testGetResourceAsTurtleNoAccept() api/RdfSourceTest#testGetResourceAsTurtleNoAccept
 */
RdfSourceTest.testGetResourceAsTurtleNoAccept = async function (url) {
    const response = await util.GET(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);
    await util.parseTurtle(response.body);
};

Object.assign(RdfSourceTest.testGetResourceAsTurtleNoAccept, {
    title:       'RdfSourceTest#testGetResourceAsTurtleNoAccept',
    description: 'LDP servers should respond with a text/turtle representation of the requested LDP-RS '
                     + 'whenever the Accept request header is absent [turtle].',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers must respond with a application/ld+json representation of the requested LDP-RS when the request
 * includes an Accept header, unless content negotiation or Turtle support requires a different outcome [JSON-LD].
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testJsonLdRepresentation manifest#testJsonLdRepresentation
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testJsonLdRepresentation() api/RdfSourceTest#testJsonLdRepresentation
 */
RdfSourceTest.testJsonLdRepresentation = async function (url) {
    const response = await util.GET(url, {
        [C.header.ACCEPT]: 'application/ld+json, application/json;q=0.5'
    });
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.JSON_LD);
    JSON.parse(response.body);
};

Object.assign(RdfSourceTest.testJsonLdRepresentation, {
    title:       'RdfSourceTest#testJsonLdRepresentation',
    description: 'LDP servers must respond with a application/ld+json representation of the requested LDP-RS when the request '
                     + 'includes an Accept header, unless content negotiation or Turtle support requires a different outcome [JSON-LD].',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers MUST publish any constraints on LDP clients’ ability to create or update LDPRs,
 * by adding a Link header with rel='http://www.w3.org/ns/ldp#constrainedBy' [RFC5988] to all responses to requests
 * which fail due to violation of those constraints.
 * @param {string} url
 * @param {string} [readOnlyProp=C.DCT.created]
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPublishConstraintsReadOnlyProp manifest#testPublishConstraintsReadOnlyProp
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testPublishConstraintsReadOnlyProp(java.lang.String) api/RdfSourceTest#testPublishConstraintsReadOnlyProp
 */
RdfSourceTest.testPublishConstraintsReadOnlyProp = async function (url, readOnlyProp = C.DCT.created) {
    // TODO
    throw new Error('not implemented');
};

Object.assign(RdfSourceTest.testPublishConstraintsReadOnlyProp, {
    title:       'RdfSourceTest#testPublishConstraintsReadOnlyProp',
    description: 'LDP servers MUST publish any constraints on LDP clients’ ability to create or update LDPRs, '
                     + 'by adding a Link header with rel=\'http://www.w3.org/ns/ldp#constrainedBy\' [RFC5988] to all responses to requests '
                     + 'which fail due to violation of those constraints.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED, C.tag.TODO]
});

/**
 * LDP servers MUST publish any constraints on LDP clients’ ability to create or update LDPRs,
 * by adding a Link header with rel='http://www.w3.org/ns/ldp#constrainedBy' [RFC5988] to all responses to requests
 * which fail due to violation of those constraints.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPublishConstraintsUnknownProp manifest#testPublishConstraintsUnknownProp
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testPublishConstraintsUnknownProp() api/RdfSourceTest#testPublishConstraintsUnknownProp
 */
RdfSourceTest.testPublishConstraintsUnknownProp = async function (url) {
    // TODO
    throw new Error('not implemented');
};

Object.assign(RdfSourceTest.testPublishConstraintsUnknownProp, {
    title:       'RdfSourceTest#testPublishConstraintsUnknownProp',
    description: 'LDP servers MUST publish any constraints on LDP clients’ ability to create or update LDPRs, '
                     + 'by adding a Link header with rel=\'http://www.w3.org/ns/ldp#constrainedBy\' [RFC5988] to all responses to requests '
                     + 'which fail due to violation of those constraints.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED, C.tag.TODO]
});

/**
 * If an otherwise valid HTTP PUT request is received that attempts to change properties
 * the server does not allow clients to modify, LDP servers MUST respond
 * with a 4xx range status code (typically 409 Conflict).
 * @param {string} url
 * @param {string} [readOnlyProp=C.DCT.created]
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPutReadOnlyProperties4xxStatus manifest#testPutReadOnlyProperties4xxStatus
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testPutReadOnlyProperties4xxStatus(java.lang.String) api/RdfSourceTest#testPutReadOnlyProperties4xxStatus
 */
RdfSourceTest.testPutReadOnlyProperties4xxStatus = async function (url, readOnlyProp = C.DCT.created) {
    await expectPut4xxStatus.call(this, url, readOnlyProp);
};

Object.assign(RdfSourceTest.testPutReadOnlyProperties4xxStatus, {
    title:       'RdfSourceTest#testPutReadOnlyProperties4xxStatus',
    description: 'If an otherwise valid HTTP PUT request is received that attempts to change properties '
                     + 'the server does not allow clients to modify, LDP servers MUST respond '
                     + 'with a 4xx range status code (typically 409 Conflict).',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers SHOULD provide a corresponding response body containing information about
 * which properties could not be persisted. The format of the 4xx response body is not constrained by LDP.
 * @param {string} url
 * @param {string} [readOnlyProp=C.DCT.created]
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#test4xxErrorHasResponseBody manifest#test4xxErrorHasResponseBody
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#test4xxErrorHasResponseBody(java.lang.String) api/RdfSourceTest#test4xxErrorHasResponseBody
 */
RdfSourceTest.test4xxErrorHasResponseBody = async function (url, readOnlyProp = C.DCT.created) {
    await expectPut4xxResponseBody.call(this, url, readOnlyProp);
};

Object.assign(RdfSourceTest.test4xxErrorHasResponseBody, {
    title:       'RdfSourceTest#test4xxErrorHasResponseBody',
    description: 'LDP servers SHOULD provide a corresponding response body containing information about '
                     + 'which properties could not be persisted. The format of the 4xx response body is not constrained by LDP.',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * If an otherwise valid HTTP PUT request is received that contains properties the server chooses not to persist,
 * e.g. unknown content, LDP servers MUST respond with an appropriate 4xx range status code [HTTP11].
 * @param {string} url
 * @param {string} [unknownProp=C.default.UNKNOWN_PROPERTY]
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPutPropertiesNotPersisted manifest#testPutPropertiesNotPersisted
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testPutPropertiesNotPersisted() api/RdfSourceTest#testPutPropertiesNotPersisted
 */
RdfSourceTest.testPutPropertiesNotPersisted = async function (url, unknownProp = C.default.UNKNOWN_PROPERTY) {
    await expectPut4xxStatus(url, unknownProp);
};

Object.assign(RdfSourceTest.testPutPropertiesNotPersisted, {
    title:       'RdfSourceTest#testPutPropertiesNotPersisted',
    description: 'If an otherwise valid HTTP PUT request is received that contains properties the server chooses not to persist, '
                     + 'e.g. unknown content, LDP servers MUST respond with an appropriate 4xx range status code [HTTP11].',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers SHOULD provide a corresponding response body containing information about which properties
 * could not be persisted. The format of the 4xx response body is not constrained by LDP.
 * LDP servers expose these application-specific constraints as described in section 4.2.1 General.
 * @param {string} url
 * @param {string} [unknownProp=C.default.UNKNOWN_PROPERTY]
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testResponsePropertiesNotPersisted manifest#testResponsePropertiesNotPersisted
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testResponsePropertiesNotPersisted() api/RdfSourceTest#testResponsePropertiesNotPersisted
 */
RdfSourceTest.testResponsePropertiesNotPersisted = async function (url, unknownProp = C.default.UNKNOWN_PROPERTY) {
    await expectPut4xxResponseBody(url, unknownProp);
};

Object.assign(RdfSourceTest.testResponsePropertiesNotPersisted, {
    title:       'RdfSourceTest#testResponsePropertiesNotPersisted',
    description: 'LDP servers SHOULD provide a corresponding response body containing information about which properties '
                     + 'could not be persisted. The format of the 4xx response body is not constrained by LDP. '
                     + 'LDP servers expose these application-specific constraints as described in section 4.2.1 General.',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * Each LDP RDF Source MUST also be a conforming LDP Resource as defined in section 4.2 Resource,
 * along with the restrictions in this section.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testConformsRdfSourceLdpResource manifest#testConformsRdfSourceLdpResource
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/RdfSourceTest.html#testConformsRdfSourceLdpResource() api/RdfSourceTest#testConformsRdfSourceLdpResource
 */
RdfSourceTest.testConformsRdfSourceLdpResource = async function (url) {
    throw new Error('Covered indirectly by the MUST tests defined in CommonResourceTest');
};

Object.assign(RdfSourceTest.testConformsRdfSourceLdpResource, {
    title:       'RdfSourceTest#testConformsRdfSourceLdpResource',
    description: 'Each LDP RDF Source MUST also be a conforming LDP Resource as defined in section 4.2 Resource, '
                     + 'along with the restrictions in this section.',
    tags:        [C.tag.MUST, C.tag.INDIRECT, C.tag.WG_APPROVED]
});