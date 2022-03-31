const
    path       = require('path'),
    _util      = require('@nrd/fua.core.util'),
    _hrt       = require('@nrd/fua.core.hrt'),
    _uuid      = require('@nrd/fua.core.uuid'),
    util       = exports = module.exports = {
        ..._util,
        assert: _util.Assert('app.testsuite')
    },
    /** @type {Object<string, InterfaceGenerator>} */
    generators = Object.create(null);

util.hrt  = _hrt;
util.uuid = _uuid;

util.pause = function (seconds) {
    return new Promise((resolve) => {
        if (seconds >= 0) setTimeout(resolve, 1e3 * seconds);
        else setImmediate(resolve);
    });
};

/**
 * @typedef {function (method: string, param: JSON): Promise<JSON>} TestInterface
 * @typedef {function (options: JSON): TestInterface} InterfaceGenerator
 */

/**
 *
 * @param {string} name
 * @param {InterfaceGenerator} generator
 */
util.registerGenerator = function ({interface: name, generator}) {
    util.assert(util.isString(name), `registerGenerator : invalid interface name`);
    util.assert(util.isFunction(generator), `registerGenerator : invalid generator`);
    util.assert(!(name in generators), `registerGenerator : already registered generator '${name}'`);
    generators[name] = generator;
}; // registerGenerator

/**
 * @param {JSON} arg
 * @param {string} arg.interface
 * @param {...JSON} arg.options
 * @returns {TestInterface}
 */
util.generateInterface = function ({interface: name, ...options}) {
    util.assert(util.isString(name), `generateInterface : invalid interface name`);
    util.assert(name in generators, `generateInterface : unknown generator '${name}'`);
    /** @type {InterfaceGenerator} */
    const genInterface    = generators[name];
    /** @type {TestInterface} */
    const interfaceMethod = genInterface(options);
    util.assert(util.isFunction(interfaceMethod), `generateInterface : invalid interface method`);
    return interfaceMethod;
}; // generateInterface

/**
 * @param {Readable<string>} stream
 * @returns {Promise<string>}
 */
util.streamToString = function (stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(chunks.join('')));
    });
}; // streamToString

// util.registerGenerator(require('./interfaces/module.js'));
// util.registerGenerator(require('./interfaces/http.js'));
// util.registerGenerator(require('./interfaces/socket.io.js'));
//
// util.execute = util.generateInterface({
//     interface: 'http',
//     baseUrl:   'http://testbed.nicos-rd.com/'
// });

// util.execute = util.generateInterface({
//     interface: 'module',
//     location:  path.join(__dirname, '../../../src/code/fn-interface.testbed.js')
// });

Object.freeze(util);
module.exports = util;
