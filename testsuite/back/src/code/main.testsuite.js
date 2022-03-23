const
    testsuite                              = exports,
    {registerGenerator, generateInterface} = require('./interface/generator.js'),
    config                                 = require('../config/config.testsuite.js'),
    util                                   = require('@nrd/fua.core.util');

testsuite.assert = new util.Assert('nrd-testsuite');

registerGenerator(require('./interface/generators/module.js'));
registerGenerator(require('./interface/generators/http.js'));
registerGenerator(require('./interface/generators/socket.io.js'));

testsuite.execute = generateInterface(config.generator);