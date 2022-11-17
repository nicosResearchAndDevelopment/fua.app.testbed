const
    _util = require('@nrd/fua.core.util'),
    util  = exports = module.exports = {
        ..._util,
        assert: _util.Assert('tb.ec.net')
    };

module.exports = Object.freeze(util);
