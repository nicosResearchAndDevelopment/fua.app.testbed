// SEE: https://w3c.github.io/ldp-testsuite/manifest/#org.w3.ldp.testsuite.test.CommonResourceTest manifest#CommonResourceTest
// SEE: https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html

const
    /** @member exports */
    CommonResourceTest = exports,
    C                  = require('./ldp-const.json'),
    util               = require('./ldp-util.js'),
    expect             = require('./ldp-expect.js');

/**
 * LDP servers MUST support the HTTP GET Method for LDPRs.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testGetResource manifest#testGetResource
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testGetResource() api/CommonResourceTest#testGetResource
 */
CommonResourceTest.testGetResource = async function (url) {
    const response = await util.GET(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
};

Object.assign(CommonResourceTest.testGetResource, {
    title:       'CommonResourceTest#testGetResource',
    description: 'LDP servers MUST support the HTTP GET Method for LDPRs.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers MUST at least be HTTP/1.1 conformant servers [HTTP11].
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testIsHttp11Manual manifest#testIsHttp11Manual
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testIsHttp11Manual() api/CommonResourceTest#testIsHttp11Manual
 */
CommonResourceTest.testIsHttp11Manual = async function (url) {
    throw new Error('not implemented / manual test');
};

Object.assign(CommonResourceTest.testIsHttp11Manual, {
    title:       'CommonResourceTest#testIsHttp11Manual',
    description: 'LDP servers MUST at least be HTTP/1.1 conformant servers [HTTP11].',
    tags:        [C.tag.MUST, C.tag.MANUAL, C.tag.WG_APPROVED]
});

/**
 * LDP server responses MUST use entity tags (either weak or strong ones) as response ETag header values.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testETagHeadersGet manifest#testETagHeadersGet
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testETagHeadersGet() api/CommonResourceTest#testETagHeadersGet
 */
CommonResourceTest.testETagHeadersGet = async function (url) {
    const response = await util.GET(url);
    expect(response.headers[C.header.ETAG]).toBeEntityTag();
};

Object.assign(CommonResourceTest.testETagHeadersGet, {
    title:       'CommonResourceTest#testETagHeadersGet',
    description: 'LDP server responses MUST use entity tags (either weak or strong ones) as response ETag header values.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP server responses MUST use entity tags (either weak or strong ones) as response ETag header values.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testETagHeadersHead manifest#testETagHeadersHead
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testETagHeadersHead() api/CommonResourceTest#testETagHeadersHead
 */
CommonResourceTest.testETagHeadersHead = async function (url) {
    const response = await util.HEAD(url);
    expect(response.headers[C.header.ETAG]).toBeEntityTag();
};

Object.assign(CommonResourceTest.testETagHeadersHead, {
    title:       'CommonResourceTest#testETagHeadersHead',
    description: 'LDP server responses MUST use entity tags (either weak or strong ones) as response ETag header values.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers exposing LDPRs MUST advertise their LDP support by exposing a HTTP Link header
 * with a target URI of http://www.w3.org/ns/ldp#Resource, and a link relation type of type (that is, rel='type')
 * in all responses to requests made to the LDPR's HTTP Request-URI.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testLdpLinkHeader manifest#testLdpLinkHeader
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testLdpLinkHeader() api/CommonResourceTest#testLdpLinkHeader
 */
CommonResourceTest.testLdpLinkHeader = async function (url) {
    const response = await util.GET(url);
    expect(response.headers[C.header.LINK]).toContainLinkRelation(C.header.LINK_REL_TYPE, C.LDP.Resource);
};

Object.assign(CommonResourceTest.testLdpLinkHeader, {
    title:       'CommonResourceTest#testLdpLinkHeader',
    description: 'LDP servers exposing LDPRs MUST advertise their LDP support by exposing a HTTP Link header '
                     + 'with a target URI of http://www.w3.org/ns/ldp#Resource, and a link relation type of type (that is, rel=\'type\') '
                     + 'in all responses to requests made to the LDPR\'s HTTP Request-URI.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers MUST support the HTTP response headers defined in section 4.2.8 HTTP OPTIONS.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testGetResponseHeaders manifest#testGetResponseHeaders
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testGetResponseHeaders() api/CommonResourceTest#testGetResponseHeaders
 */
CommonResourceTest.testGetResponseHeaders = async function (url) {
    const response = await util.GET(url);
    expect(response.headers[C.header.ALLOW]).toBeNotNull();
    if (response.headers[C.header.ALLOW].includes('POST'))
        expect(response.headers[C.header.ACCEPT_POST]).toBeNotNull();
    if (response.headers[C.header.ALLOW].includes('PATCH'))
        expect(response.headers[C.header.ACCEPT_PATCH]).toBeNotNull();
};

Object.assign(CommonResourceTest.testGetResponseHeaders, {
    title:       'CommonResourceTest#testGetResponseHeaders',
    description: 'LDP servers MUST support the HTTP response headers defined in section 4.2.8 HTTP OPTIONS.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP clients SHOULD use the HTTP If-Match header and HTTP ETags to ensure it isn’t modifying a resource
 * that has changed since the client last retrieved its representation. LDP servers SHOULD require
 * the HTTP If-Match header and HTTP ETags to detect collisions.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPutRequiresIfMatch manifest#testPutRequiresIfMatch
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testPutRequiresIfMatch() api/CommonResourceTest#testPutRequiresIfMatch
 */
CommonResourceTest.testPutRequiresIfMatch = async function (url) {
    const response = await util.GET(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.ETAG]).toBeEntityTag();

    const putResponse = await util.PUT(url, {
        [C.header.CONTENT_TYPE]: response.headers[C.header.CONTENT_TYPE]
    }, response.body);
    expect(putResponse.status.code).not.toBeStatusCode(C.status.Successful);
};

Object.assign(CommonResourceTest.testPutRequiresIfMatch, {
    title:       'CommonResourceTest#testPutRequiresIfMatch',
    description: 'LDP clients SHOULD use the HTTP If-Match header and HTTP ETags to ensure it isn’t modifying a resource '
                     + 'that has changed since the client last retrieved its representation. LDP servers SHOULD require '
                     + 'the HTTP If-Match header and HTTP ETags to detect collisions.',
    tags:        [C.tag.SHOULD, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers MUST respond with status code 412 (Condition Failed) if ETags fail to match when there
 * are no other errors with the request [HTTP11]. LDP servers that require conditional requests MUST respond
 * with status code 428 (Precondition Required) when the absence of a precondition is the only reason for rejecting
 * the request [RFC6585].
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testConditionFailedStatusCode manifest#testConditionFailedStatusCode
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testConditionFailedStatusCode() api/CommonResourceTest#testConditionFailedStatusCode
 */
CommonResourceTest.testConditionFailedStatusCode = async function (url) {
    const response = await util.GET(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.ETAG]).toBeEntityTag();

    const putResponse = await util.PUT(url, {
        [C.header.CONTENT_TYPE]: response.headers[C.header.CONTENT_TYPE],
        [C.header.IF_MATCH]:     '"These aren\'t the ETags you\'re looking for."'
    }, response.body);
    expect(putResponse.status.code).toBeStatusCode(C.status.PRECONDITION_FAILED);
};

Object.assign(CommonResourceTest.testConditionFailedStatusCode, {
    title:       'CommonResourceTest#testConditionFailedStatusCode',
    description: 'LDP servers MUST respond with status code 412 (Condition Failed) if ETags fail to match when there '
                     + 'are no other errors with the request [HTTP11]. LDP servers that require conditional requests MUST respond '
                     + 'with status code 428 (Precondition Required) when the absence of a precondition is the only reason for rejecting '
                     + 'the request [RFC6585].',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers MUST respond with status code 412 (Condition Failed) if ETags fail to match when there
 * are no other errors with the request [HTTP11]. LDP servers that require conditional requests MUST respond
 * with status code 428 (Precondition Required) when the absence of a precondition is the only reason for rejecting
 * the request [RFC6585].
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPreconditionRequiredStatusCode manifest#testPreconditionRequiredStatusCode
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testPreconditionRequiredStatusCode() api/CommonResourceTest#testPreconditionRequiredStatusCode
 */
CommonResourceTest.testPreconditionRequiredStatusCode = async function (url) {
    const response = await util.GET(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.ETAG]).toBeEntityTag();

    const putResponse = await util.PUT(url, {
        [C.header.CONTENT_TYPE]: response.headers[C.header.CONTENT_TYPE],
        [C.header.IF_MATCH]:     response.headers[C.header.ETAG]
    }, response.body);
    expect(putResponse.status.code).toBeStatusCode(C.status.Successful);

    const invalidPutResponse = await util.PUT(url, {
        [C.header.CONTENT_TYPE]: response.headers[C.header.CONTENT_TYPE]
    }, response.body);
    expect(invalidPutResponse.status.code).toBeStatusCode(C.status.PRECONDITION_REQUIRED);
};

Object.assign(CommonResourceTest.testPreconditionRequiredStatusCode, {
    title:       'CommonResourceTest#testPreconditionRequiredStatusCode',
    description: 'LDP servers MUST respond with status code 412 (Condition Failed) if ETags fail to match when there '
                     + 'are no other errors with the request [HTTP11]. LDP servers that require conditional requests MUST respond '
                     + 'with status code 428 (Precondition Required) when the absence of a precondition is the only reason for rejecting '
                     + 'the request [RFC6585].',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers MUST respond with status code 412 (Condition Failed) if ETags fail to match when there
 * are no other errors with the request [HTTP11]. LDP servers that require conditional requests MUST respond
 * with status code 428 (Precondition Required) when the absence of a precondition is the only reason for rejecting
 * the request [RFC6585].
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testPutBadETag manifest#testPutBadETag
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testPutBadETag() api/CommonResourceTest#testPutBadETag
 */
CommonResourceTest.testPutBadETag = async function (url) {
    const response = await util.GET(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.ETAG]).toBeEntityTag();

    const putResponse = await util.PUT(url, {
        [C.header.CONTENT_TYPE]: response.headers[C.header.CONTENT_TYPE],
        [C.header.IF_MATCH]:     '"This is not the ETag you\'re looking for"'
    }, response.body);
    expect(putResponse.status.code).toBeStatusCode(C.status.PRECONDITION_FAILED);
};

Object.assign(CommonResourceTest.testPutBadETag, {
    title:       'CommonResourceTest#testPutBadETag',
    description: 'LDP servers MUST respond with status code 412 (Condition Failed) if ETags fail to match when there '
                     + 'are no other errors with the request [HTTP11]. LDP servers that require conditional requests MUST respond '
                     + 'with status code 428 (Precondition Required) when the absence of a precondition is the only reason for rejecting '
                     + 'the request [RFC6585].',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers MUST support the HTTP HEAD method.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testHead manifest#testHead
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testHead() api/CommonResourceTest#testHead
 */
CommonResourceTest.testHead = async function (url) {
    const response = await util.HEAD(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
};

Object.assign(CommonResourceTest.testHead, {
    title:       'CommonResourceTest#testHead',
    description: 'LDP servers MUST support the HTTP HEAD method.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers that support PATCH MUST include an Accept-Patch HTTP response header [RFC5789] on HTTP
 * OPTIONS requests, listing patch document media type(s) supported by the server.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testAcceptPatchHeader manifest#testAcceptPatchHeader
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testAcceptPatchHeader() api/CommonResourceTest#testAcceptPatchHeader
 */
CommonResourceTest.testAcceptPatchHeader = async function (url) {
    const response = await util.OPTIONS(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.ACCEPT_PATCH]).toBeNotNull();
};

Object.assign(CommonResourceTest.testAcceptPatchHeader, {
    title:       'CommonResourceTest#testAcceptPatchHeader',
    description: 'LDP servers that support PATCH MUST include an Accept-Patch HTTP response header [RFC5789] on HTTP '
                     + 'OPTIONS requests, listing patch document media type(s) supported by the server.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers MUST support the HTTP OPTIONS method.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testOptions manifest#testOptions
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testOptions() api/CommonResourceTest#testOptions
 */
CommonResourceTest.testOptions = async function (url) {
    const response = await util.OPTIONS(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
};

Object.assign(CommonResourceTest.testOptions, {
    title:       'CommonResourceTest#testOptions',
    description: 'LDP servers MUST support the HTTP OPTIONS method.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});

/**
 * LDP servers MUST indicate their support for HTTP Methods by responding to a HTTP OPTIONS request on the LDPR’s URL
 * with the HTTP Method tokens in the HTTP response header Allow.
 * @param {string} url
 * @returns {Promise<void>}
 * @see https://w3c.github.io/ldp-testsuite/manifest/#testOptionsAllowHeader manifest#testOptionsAllowHeader
 * @see https://w3c.github.io/ldp-testsuite/api/java/org/w3/ldp/testsuite/test/CommonResourceTest.html#testOptionsAllowHeader() api/CommonResourceTest#testOptionsAllowHeader
 */
CommonResourceTest.testOptionsAllowHeader = async function (url) {
    const response = await util.OPTIONS(url);
    expect(response.status.code).toBeStatusCode(C.status.Successful);
    expect(response.headers[C.header.ALLOW]).toBeNotNull();
};

Object.assign(CommonResourceTest.testOptionsAllowHeader, {
    title:       'CommonResourceTest#testOptionsAllowHeader',
    description: 'LDP servers MUST indicate their support for HTTP Methods by responding to a HTTP OPTIONS request on the LDPR’s URL '
                     + 'with the HTTP Method tokens in the HTTP response header Allow.',
    tags:        [C.tag.MUST, C.tag.AUTOMATED, C.tag.WG_APPROVED]
});