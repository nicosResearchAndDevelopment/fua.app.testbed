const
    _util = require('@nrd/fua.core.util'),
    util  = exports = {
        ..._util,
        assert: _util.Assert('app.testbed')
    };

util.pause = function (seconds) {
    return new Promise((resolve) => {
        if (seconds >= 0) setTimeout(resolve, 1e3 * seconds);
        else setImmediate(resolve);
    });
};

util.contextHasPrefix = function ({context, prefix}) {
    for (let prefixObj of util.toArray(context)) {
        if (prefixObj[prefix]) return true;
    }
    return false;
};

util.randomLeaveId = function () {
    return `${Date.now()}_${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
};

util.idAsBlankNode = function (namespace = '') {
    return `_:${namespace}${util.randomLeaveId()}`;
};

module.exports = Object.freeze(util);
