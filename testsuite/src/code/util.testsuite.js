const
    _util = require('@nrd/fua.core.util'),
    util  = exports = {
        ..._util,
        assert: _util.Assert('app.testsuite')
    };

util.pause = function (seconds) {
    return new Promise((resolve) => {
        if (seconds >= 0) setTimeout(resolve, 1e3 * seconds);
        else setImmediate(resolve);
    });
};

module.exports = Object.freeze(util);
