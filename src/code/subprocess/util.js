const
    util = require("@nrd/fua.core.util");

exports = module.exports = {
    ...util,
    assert: new util.Assert('nrd-testbed/testsuite/subprocess')
};

exports.flattenArgs = function flattenArgs(args) {
    if (util.isArray(args)) {
        return args.map(flattenArgs).flat(1);
    } else if (util.isObject(args)) {
        const res = [];
        for (let [key, value] of Object.entries(args)) {
            if (!key.startsWith('-')) key = (key.length > 1 ? '--' : '-') + key;
            if (util.isArray(value)) {
                for (let entry of value) {
                    res.push(key);
                    res.push(entry);
                }
            } else {
                res.push(key);
                res.push(value);
            }
        }
        return res;
    } else {
        return args;
    }
};
