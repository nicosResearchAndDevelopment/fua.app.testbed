const
    util = require('@nrd/fua.core.util'),
    path = require('path'),
    fs   = require('fs/promises');

exports = module.exports = {
    ...util,
    assert: new util.Assert('nrd-testsuite : model')
};
