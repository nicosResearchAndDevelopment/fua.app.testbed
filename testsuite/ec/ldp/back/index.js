exports.LdpTest               = require('./LdpTest.js');
exports.CommonResourceTest    = require('./CommonResourceTest.js');
exports.NonRDFSourceTest      = require('./NonRDFSourceTest.js');
exports.RdfSourceTest         = require('./RdfSourceTest.js');
exports.CommonContainerTest   = require('./CommonContainerTest.js');
exports.BasicContainerTest    = require('./BasicContainerTest.js');
exports.DirectContainerTest   = require('./DirectContainerTest.js');
exports.IndirectContainerTest = require('./IndirectContainerTest.js');

Object.defineProperty(exports, 'get', {enumerable: false});
exports.get = function (method) {
    if (typeof method !== 'string') return;
    const [srch1, srch2, ...rest] = method.split('#');
    if (!srch1 || !srch2 || rest.length > 0) return;
    for (let key1 in exports) {
        if (key1 === srch1) {
            const Test = exports[key1];
            for (let key2 in Test) {
                if (key2 === srch2) return Test[key2];
            }
            return;
        }
    }
};

Object.defineProperty(exports, 'call', {enumerable: false});
exports.call = async function (method, ...args) {
    const test = exports.get(method);
    if (typeof test !== 'function')
        throw new Error('test ' + method + ' not found');
    return test(...args);
};

[
    exports, exports.LdpTest, exports.CommonResourceTest,
    exports.NonRDFSourceTest, exports.RdfSourceTest, exports.CommonContainerTest,
    exports.BasicContainerTest, exports.DirectContainerTest, exports.IndirectContainerTest
].forEach(Object.freeze);