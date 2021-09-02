const
    util = require("@nrd/fua.core.util");

exports = module.exports = {
    ...util,
    assert: new util.Assert('nrd-testbed/ec/ids')
};

exports.joinPath  = require('path').join;
exports.awaitMain = (fn, ...args) => fn.apply(null, args).then(() => process.exit(0)).catch((err) => console.error(err?.stack ?? err) || process.exit(1));
exports.ignoreErr = (promise) => new Promise((resolve, reject) => promise.then(resolve).catch((err) => resolve()));
