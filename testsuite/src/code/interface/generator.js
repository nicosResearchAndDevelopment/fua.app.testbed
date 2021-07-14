const
    {assert}   = require('./util.js'),
    /** @type {Object<string, InterfaceGenerator>} */
    generators = Object.create(null);

/**
 * @typedef {function (method: string, param: JSON): Promise<JSON>} TestInterface
 * @typedef {function (options: JSON): TestInterface} InterfaceGenerator
 */

/**
 *
 * @param {string} name
 * @param {InterfaceGenerator} generator
 */
exports.registerGenerator = function ({interface: name, generator}) {
    assert(typeof name === 'string', `registerGenerator : invalid interface name`);
    assert(typeof generator === 'function', `registerGenerator : invalid generator`);
    assert(!(name in generators), `generateInterface : already registered generator '${name}'`);
    generators[name] = generator;
};

/**
 * @param {JSON} arg
 * @param {string} arg.interface
 * @param {...JSON} arg.options
 * @returns {TestInterface}
 */
exports.generateInterface = function ({interface: name, ...options}) {
    assert(typeof name === 'string', `generateInterface : invalid interface name`);
    assert(name in generators, `generateInterface : unknown generator '${name}'`);
    /** @type {InterfaceGenerator} */
    const genInterface    = generators[name];
    /** @type {TestInterface} */
    const interfaceMethod = genInterface(options);
    assert(typeof interfaceMethod === 'function', `generateInterface : invalid interface method`);
    return interfaceMethod;
}; // exports.generateInterface