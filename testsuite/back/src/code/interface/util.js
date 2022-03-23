const util = require('@nrd/fua.core.util');

exports = module.exports = {
    ...util,
    assert: util.Assert('nrd-testsuite/interface')
};

/**
 * @param {Readable<string>} stream
 * @returns {Promise<string>}
 */
exports.streamToString = function (stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(chunks.join('')));
    });
}; // exports.streamToString