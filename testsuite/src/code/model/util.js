const
    util = require('@nrd/fua.core.util'),
    hrt  = require('@nrd/fua.core.hrt'),
    path = require('path'),
    fs   = require('fs/promises');

exports = module.exports = {
    ...util,
    assert: new util.Assert('nrd-testsuite : model')
};

exports.hrt = hrt;
