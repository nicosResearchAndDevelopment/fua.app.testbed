const
    /** @member exports */
    util                         = exports,
    {readFile}                   = require('fs/promises'),
    {join: joinPath, isAbsolute} = require('path'),
    testSuite                    = require('../../../../src/test-suite.js'),
    config                       = require('../config.json'),
    configDir                    = joinPath(__dirname, '..'),
    N3                           = require('n3');

//region >> IMPORTS: methods from the testSuite

util.isNull       = testSuite.isNull;
util.isNotNull    = testSuite.isNotNull;
util.isPrimitive  = testSuite.isPrimitive;
util.isBoolean    = testSuite.isBoolean;
util.isNumber     = testSuite.isNumber;
util.isStatusCode = testSuite.isStatusCode;
util.isString     = testSuite.isString;
util.isFunction   = testSuite.isFunction;
util.isObject     = testSuite.isObject;
util.isArray      = testSuite.isArray;

//endregion >> IMPORTS
//region >> REG-EXPS: patterns to use for RegExp#test and matchers to use for String#replace or String#matchAll

util.pattern = {
    nonempty: /\S/,
    /**
     * @see https://tools.ietf.org/html/rfc3987#section-2.2
     * @see https://stackoverflow.com/questions/1547899/which-characters-make-a-url-invalid/36667242#answer-36667242
     */
    IRI: /^[a-z][a-z+.-]*:[^\s"<>\\^`{|}]*$/i,
    /**
     * @see https://tools.ietf.org/html/rfc7232#section-2.3
     */
    ETag:        new RegExp('^(?:W\\/)?"['
        + String.fromCharCode(0x21)
        + String.fromCharCode(0x23) + '-' + String.fromCharCode(0x7E)
        + String.fromCharCode(0x80) + '-' + String.fromCharCode(0xFF)
        + ']*"$'),
    Allow:       /^(?:(?:GET|HEAD|OPTIONS|POST|PUT|PATCH|DELETE)(?=,|$),?\s*)+$/i,
    AcceptPatch: /^(?:\w+\/[\w\-+]+(?=,|$),?)+$/i,
    AcceptPOST:  /^(?:\w+\/[\w\-+]+(?=,|$),?)+$/i
};

util.matcher = {
    Link:           /<([^\s>]*)>;\s*rel=["']([^\s"']*)["']/g,
    LastURLSegment: /\/[^\/]*$/
};

//endregion >> REG-EXPS
//region >> API-METHODS: access to the file system and to the request api of the interface

util.readData = (file) => readFile(joinPath(__dirname, 'ldp-data', file))
    .then(buffer => buffer.toString());

if (config.generator.interface === 'module' && !isAbsolute(config.generator.location))
    config.generator.location = joinPath(configDir, config.generator.location);
const execute = testSuite.generateInterface(config.generator);

/** @returns {Promise<InterfaceResponse>} */
util.GET = (url, headers, body) => execute('GET', {url, headers, body});
/** @returns {Promise<InterfaceResponse>} */
util.HEAD = (url, headers, body) => execute('HEAD', {url, headers, body});
/** @returns {Promise<InterfaceResponse>} */
util.OPTIONS = (url, headers, body) => execute('OPTIONS', {url, headers, body});
/** @returns {Promise<InterfaceResponse>} */
util.POST = (url, headers, body) => execute('POST', {url, headers, body});
/** @returns {Promise<InterfaceResponse>} */
util.PUT = (url, headers, body) => execute('PUT', {url, headers, body});
/** @returns {Promise<InterfaceResponse>} */
util.PATCH = (url, headers, body) => execute('PATCH', {url, headers, body});
/** @returns {Promise<InterfaceResponse>} */
util.DELETE = (url, headers, body) => execute('DELETE', {url, headers, body});

//endregion >> API-METHODS
//region >> TTL-METHODS: methods for parsing and serializing turtle to and from n3 stores

util.quad      = N3.DataFactory.quad;
util.namedNode = N3.DataFactory.namedNode;
util.literal   = N3.DataFactory.literal;

util.parseTurtle = async function (turtle) {
    const store    = new N3.Store();
    store.prefixes = await new Promise((resolve, reject) => {
        const parser = new N3.Parser();
        parser.parse(turtle, (error, quad, prefixes) => {
            if (error) reject(error);
            else if (quad) store.addQuad(quad);
            else resolve(prefixes);
        });
    });
    return store;
};

util.serializeTurtle = async function (store) {
    const writer = new N3.Writer({prefixes: store.prefixes || undefined});
    //store.getQuads().forEach(quad => writer.addQuad(quad));
    store.getQuads().forEach((quad) => {
        if (quad.subject.termType === 'DefaultGraph') {
            // SEE https://github.com/rdfjs/N3.js/issues/246
            writer.addQuad(N3.DataFactory.quad(
                new N3.NamedNode(''),
                quad.predicate,
                quad.object,
                quad.graph
            ));
        } else {
            writer.addQuad(quad);
        }
    });
    return await new Promise((resolve, reject) => writer.end(
        (err, result) => err ? reject(err) : resolve(result)
    ));
};

//endregion >> TTL-METHODS
//region >> LDP-METHODS: methods for some general ldp related tasks

util.ldpPreference = function (name, ...values) {
    return 'return=representation; ' + name + '="' + values.join(' ') + '"';
};

util.ldpAbsoluteUri = function (baseUri, relativeUri) {
    return baseUri.replace(util.matcher.LastURLSegment, '/' + relativeUri);
};

//endregion >> LDP-METHODS
