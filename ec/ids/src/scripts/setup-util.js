const
    util = require('@nrd/fua.core.util'),
    path = require('path');

exports = module.exports = {
    ...util,
    assert:   new util.Assert('nrd-testbed/ec/ids'),
    joinPath: path.join
};

exports.awaitMain = function (fn, ...args) {
    fn.apply(null, args)
        .then(() => process.exit(0))
        .catch((err) => console.error(err?.stack ?? err) || process.exit(1))
};

exports.ignoreErr = function (promise) {
    return new Promise(
        (resolve, reject) => promise
            .then(resolve)
            .catch((err) => resolve())
    );
};
