const
    util = require('./util.testsuite.js');

util.registerGenerator(require('./interfaces/module.js'));
util.registerGenerator(require('./interfaces/http.js'));
util.registerGenerator(require('./interfaces/socket.io.js'));

exports.execute = util.generateInterface({
    interface: 'http',
    baseUrl:   'http://testbed.nicos-rd.com/'
});

// exports.execute  = util.generateInterface({
//     interface: 'module',
//     location:  path.join(__dirname, '../../../src/code/fn-interface.testbed.js')
// });
