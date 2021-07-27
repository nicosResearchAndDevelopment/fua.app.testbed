// SEE: https://w3c.github.io/ldp-testsuite/manifest/#org.w3.ldp.testsuite.test.NonRDFSourceTest manifest#NonRDFSourceTest
// SEE: https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/NonRDFSourceTest.html

const
    /** @member exports */
    NonRDFSourceTest = exports,
    C                = require('./ldp-const.json'),
    util             = require('./ldp-util.js'),
    expect           = require('./ldp-expect.js');

/**
 * LDP servers may accept an HTTP POST of non-RDF representations (LDP-NRs) for creation
 * of any kind of resource, for example binary resources.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPostNonRDFSource manifest#testPostNonRDFSource
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/NonRDFSourceTest.html#testPostNonRDFSource() api/NonRDFSourceTest#testPostNonRDFSource
 */
NonRDFSourceTest.testPostNonRDFSource = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.PNG,
        [C.header.SLUG]:         'test'
    }, await util.readData('test-image.png'));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    await util.DELETE(location);
};

Object.assign(NonRDFSourceTest.testPostNonRDFSource, {
    title:       'NonRDFSourceTest#testPostNonRDFSource',
    description: 'LDP servers may accept an HTTP POST of non-RDF representations (LDP-NRs) for creation '
                     + 'of any kind of resource, for example binary resources.',
    tags:        [C.tag.MAY, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers may accept an HTTP POST of non-RDF representations (LDP-NRs) for creation
 * of any kind of resource, for example binary resources.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPostResourceAndGetFromContainer manifest#testPostResourceAndGetFromContainer
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/NonRDFSourceTest.html#testPostResourceAndGetFromContainer() api/NonRDFSourceTest#testPostResourceAndGetFromContainer
 */
NonRDFSourceTest.testPostResourceAndGetFromContainer = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.PNG,
        [C.header.SLUG]:         'test'
    }, await util.readData('test-image.png'));
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

Object.assign(NonRDFSourceTest.testPostResourceAndGetFromContainer, {
    title:       'NonRDFSourceTest#testPostResourceAndGetFromContainer',
    description: 'LDP servers may accept an HTTP POST of non-RDF representations (LDP-NRs) for creation '
                     + 'of any kind of resource, for example binary resources.',
    tags:        [C.tag.MAY, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers may host a mixture of LDP-RSs and LDP-NRs. For example, it is common for LDP servers
 * to need to host binary or text resources that do not have useful RDF representations.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPostResourceGetBinary manifest#testPostResourceGetBinary
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/NonRDFSourceTest.html#testPostResourceGetBinary() api/NonRDFSourceTest#testPostResourceGetBinary
 */
NonRDFSourceTest.testPostResourceGetBinary = async function (url) {
    const imageData = await util.readData('test-image.png');

    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.PNG,
        [C.header.SLUG]:         'test'
    }, imageData);
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    try {
        const getResponse = await util.GET(location, {
            [C.header.ACCEPT]: C.format.PNG
        });
        expect(getResponse.status.code).toBeStatusCode(C.status.Successful);
        expect(getResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.PNG);
        expect(getResponse.headers[C.header.ETAG]).toBeEntityTag();
        expect(getResponse.body).toBe(imageData);
    } finally {
        await util.DELETE(location);
    }
};

Object.assign(NonRDFSourceTest.testPostResourceGetBinary, {
    title:       'NonRDFSourceTest#testPostResourceGetBinary',
    description: 'LDP servers may host a mixture of LDP-RSs and LDP-NRs. For example, it is common for LDP servers '
                     + 'to need to host binary or text resources that do not have useful RDF representations.',
    tags:        [C.tag.MAY, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * Each LDP Non-RDF Source must also be a conforming LDP Resource. LDP Non-RDF Sources
 * may not be able to fully express their state using RDF.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPostResourceGetMetadataAndBinary manifest#testPostResourceGetMetadataAndBinary
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/NonRDFSourceTest.html#testPostResourceGetMetadataAndBinary() api/NonRDFSourceTest#testPostResourceGetMetadataAndBinary
 */
NonRDFSourceTest.testPostResourceGetMetadataAndBinary = async function (url) {
    const imageData = await util.readData('test-image.png');

    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.PNG,
        [C.header.SLUG]:         'test'
    }, imageData);
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    try {
        expect(postResponse.headers[C.header.LINK]).toBeNotNull();
        const [describedby] = Array.from(
            postResponse.headers[C.header.LINK].matchAll(util.matcher.Link)
        ).filter(match => match[2] === C.header.LINK_REL_DESCRIBEDBY).map(match => match[1]);
        expect(describedby).toBeNotNull();

        const metaResponse = await util.GET(describedby, {
            [C.header.ACCEPT]: C.format.TURTLE
        });
        expect(metaResponse.status.code).toBeStatusCode(C.status.Successful);
        expect(metaResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);
        expect(metaResponse.headers[C.header.ETAG]).toBeEntityTag();

        const metaData = await util.parseTurtle(metaResponse.body);
        expect(metaData).toContainMatches(
            util.namedNode(describedby)
        );

        const getResponse = await util.GET(location, {
            [C.header.ACCEPT]: C.format.PNG
        });
        expect(getResponse.status.code).toBeStatusCode(C.status.Successful);
        expect(getResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.PNG);
        expect(getResponse.headers[C.header.ETAG]).toBeEntityTag();
        expect(getResponse.body).toBe(imageData);
    } finally {
        await util.DELETE(location);
    }
};

Object.assign(NonRDFSourceTest.testPostResourceGetMetadataAndBinary, {
    title:       'NonRDFSourceTest#testPostResourceGetMetadataAndBinary',
    description: 'Each LDP Non-RDF Source must also be a conforming LDP Resource. LDP Non-RDF Sources '
                     + 'may not be able to fully express their state using RDF.',
    tags:        [C.tag.MAY, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers exposing an LDP Non-RDF Source may advertise this by exposing a HTTP Link header
 * with a target URI of http://www.w3.org/ns/ldp#NonRDFSource, and a link relation type of type (that is, rel='type')
 * in responses to requests made to the LDP-NR's HTTP Request-URI.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPostResourceAndCheckLink manifest#testPostResourceAndCheckLink
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/NonRDFSourceTest.html#testPostResourceAndCheckLink() api/NonRDFSourceTest#testPostResourceAndCheckLink
 */
NonRDFSourceTest.testPostResourceAndCheckLink = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.PNG,
        [C.header.SLUG]:         'test'
    }, await util.readData('test-image.png'));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    try {
        const getResponse = await util.GET(location, {
            [C.header.ACCEPT]: C.format.PNG
        });
        expect(getResponse.status.code).toBeStatusCode(C.status.Successful);
        expect(getResponse.headers[C.header.ETAG]).toBeEntityTag();
        expect(getResponse.headers[C.header.LINK]).toContainLinkRelation(C.header.LINK_REL_TYPE, C.LDP.NonRDFSource);
    } finally {
        await util.DELETE(location);
    }
};

Object.assign(NonRDFSourceTest.testPostResourceAndCheckLink, {
    title:       'NonRDFSourceTest#testPostResourceAndCheckLink',
    description: 'LDP servers exposing an LDP Non-RDF Source may advertise this by exposing a HTTP Link header '
                     + 'with a target URI of http://www.w3.org/ns/ldp#NonRDFSource, and a link relation type of type (that is, rel=\'type\') '
                     + 'in responses to requests made to the LDP-NR\'s HTTP Request-URI.',
    tags:        [C.tag.MAY, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * Upon successful creation of an LDP-NR (HTTP status code of 201-Created and URI indicated
 * by Location response header), LDP servers may create an associated LDP-RS to contain data
 * about the newly created LDP-NR. If a LDP server creates this associated LDP-RS it must indicate
 * its location on the HTTP response using the HTTP Link response header with link relation describedby
 * and href to be the URI of the associated LDP-RS resource.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPostResourceAndCheckAssociatedResource manifest#testPostResourceAndCheckAssociatedResource
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/NonRDFSourceTest.html#testPostResourceAndCheckAssociatedResource() api/NonRDFSourceTest#testPostResourceAndCheckAssociatedResource
 */
NonRDFSourceTest.testPostResourceAndCheckAssociatedResource = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.PNG,
        [C.header.SLUG]:         'test'
    }, await util.readData('test-image.png'));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    try {
        expect(postResponse.headers[C.header.LINK]).toBeNotNull();
        const [describedby] = Array.from(
            postResponse.headers[C.header.LINK].matchAll(util.matcher.Link)
        ).filter(match => match[2] === C.header.LINK_REL_DESCRIBEDBY).map(match => match[1]);
        expect(describedby).toBeNotNull();

        const getResponse = await util.GET(location, {
            [C.header.ACCEPT]: C.format.PNG
        });
        expect(getResponse.status.code).toBeStatusCode(C.status.Successful);
        expect(getResponse.headers[C.header.ETAG]).toBeEntityTag();
        expect(getResponse.headers[C.header.LINK]).toContainLinkRelation(C.header.LINK_REL_DESCRIBEDBY, describedby);

        const metaResponse = await util.GET(describedby, {
            [C.header.ACCEPT]: C.format.TURTLE
        });
        expect(metaResponse.status.code).toBeStatusCode(C.status.Successful);
        expect(metaResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);
        expect(metaResponse.headers[C.header.ETAG]).toBeEntityTag();
    } finally {
        await util.DELETE(location);
    }
};

Object.assign(NonRDFSourceTest.testPostResourceAndCheckAssociatedResource, {
    title:       'NonRDFSourceTest#testPostResourceAndCheckAssociatedResource',
    description: 'Upon successful creation of an LDP-NR (HTTP status code of 201-Created and URI indicated '
                     + 'by Location response header), LDP servers may create an associated LDP-RS to contain data '
                     + 'about the newly created LDP-NR. If a LDP server creates this associated LDP-RS it must indicate '
                     + 'its location on the HTTP response using the HTTP Link response header with link relation describedby '
                     + 'and href to be the URI of the associated LDP-RS resource.',
    tags:        [C.tag.MAY, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * When a contained LDPR is deleted, and the LDPC server created anassociated LDP-RS (see the LDPC POST section),
 * the LDPC server must also delete the associated LDP-RS it created.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testDeleteNonRDFSourceDeletesAssociatedResource manifest#testDeleteNonRDFSourceDeletesAssociatedResource
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/NonRDFSourceTest.html#testDeleteNonRDFSourceDeletesAssociatedResource() api/NonRDFSourceTest#testDeleteNonRDFSourceDeletesAssociatedResource
 */
NonRDFSourceTest.testDeleteNonRDFSourceDeletesAssociatedResource = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.PNG,
        [C.header.SLUG]:         'test'
    }, await util.readData('test-image.png'));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    let deleted = false;
    try {
        expect(postResponse.headers[C.header.LINK]).toBeNotNull();
        const [describedby] = Array.from(
            postResponse.headers[C.header.LINK].matchAll(util.matcher.Link)
        ).filter(match => match[2] === C.header.LINK_REL_DESCRIBEDBY).map(match => match[1]);
        expect(describedby).toBeNotNull();

        const metaResponse = await util.GET(describedby, {
            [C.header.ACCEPT]: C.format.TURTLE
        });
        expect(metaResponse.status.code).toBeStatusCode(C.status.Successful);
        expect(metaResponse.headers[C.header.CONTENT_TYPE]).toBeContentType(C.format.TURTLE);

        deleted              = true;
        const deleteResponse = await util.DELETE(location);
        expect(deleteResponse.status.code).toBeStatusCode(C.status.Successful);

        const secondResponse = await util.GET(describedby, {
            [C.header.ACCEPT]: C.format.TURTLE
        });
        expect(secondResponse.status.code).not.toBeStatusCode(C.status.Successful);
        expect([C.status.NOT_FOUND, C.status.GONE]).toContain(secondResponse.status.code);
    } finally {
        if (!deleted) await util.DELETE(location);
    }
};

Object.assign(NonRDFSourceTest.testDeleteNonRDFSourceDeletesAssociatedResource, {
    title:       'NonRDFSourceTest#testDeleteNonRDFSourceDeletesAssociatedResource',
    description: 'When a contained LDPR is deleted, and the LDPC server created anassociated LDP-RS (see the LDPC POST section), '
                     + 'the LDPC server must alsodelete the associated LDP-RS it created.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * When responding to requests whose request-URI is a LDP-NR with an associated LDP-RS,
 * a LDPC server must provide the same HTTP Link response header as is required in the create response.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testOptionsHasSameLinkHeader manifest#testOptionsHasSameLinkHeader
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/NonRDFSourceTest.html#testOptionsHasSameLinkHeader() api/NonRDFSourceTest#testOptionsHasSameLinkHeader
 */
NonRDFSourceTest.testOptionsHasSameLinkHeader = async function (url) {
    const postResponse = await util.POST(url, {
        [C.header.CONTENT_TYPE]: C.format.PNG,
        [C.header.SLUG]:         'test'
    }, await util.readData('test-image.png'));
    expect(postResponse.status.code).toBeStatusCode(C.status.CREATED);
    const location = postResponse.headers[C.header.LOCATION];
    expect(location).toBeNotNull();

    try {
        expect(postResponse.headers[C.header.LINK]).toBeNotNull();
        const [describedby] = Array.from(
            postResponse.headers[C.header.LINK].matchAll(util.matcher.Link)
        ).filter(match => match[2] === C.header.LINK_REL_DESCRIBEDBY).map(match => match[1]);
        expect(describedby).toBeNotNull();

        const optionsResponse = await util.OPTIONS(location, {
            [C.header.ACCEPT]: C.format.PNG
        });
        expect(optionsResponse.status.code).toBeStatusCode(C.status.Successful);
        expect(optionsResponse.headers[C.header.ETAG]).toBeEntityTag();
        expect(optionsResponse.headers[C.header.LINK]).toContainLinkRelation(C.header.LINK_REL_DESCRIBEDBY, describedby);
    } finally {
        await util.DELETE(location);
    }
};

Object.assign(NonRDFSourceTest.testOptionsHasSameLinkHeader, {
    title:       'NonRDFSourceTest#testOptionsHasSameLinkHeader',
    description: 'When responding to requests whose request-URI is a LDP-NR with an associated LDP-RS, '
                     + 'a LDPC server must provide the same HTTP Link response header as is required in the create response.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});