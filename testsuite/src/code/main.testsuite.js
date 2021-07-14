const
    testsuite                              = exports,
    config                                 = require('../config/config.testsuite.js'),
    {registerGenerator, generateInterface} = require('./interface/generator.js');

registerGenerator(require('./interface/generators/module.js'));
registerGenerator(require('./interface/generators/http.js'));
registerGenerator(require('./interface/generators/socket.io.js'));

testsuite.execute = generateInterface(config.generator);