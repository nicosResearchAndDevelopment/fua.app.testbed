const
    testbed = exports,
    config  = require('../config/config.testbed.js'),
    util    = require('@nrd/fua.core.util');

testbed.assert = new util.Assert('nrd-testbed');

testbed.ecosystems = Object.fromEntries([
    require('../../ec/ids/src/tb.ids.js'),
    require('../../ec/net/src/tb.net.js')
].map((ec) => [ec.ec, ec]));