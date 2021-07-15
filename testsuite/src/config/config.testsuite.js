const
    path = require('path');

exports.server = {
    port: 8081
};

//exports.generator = {
//    interface:   'http',
//    baseUrl:     'http://localhost:8080/'
//};

exports.generator = {
    interface: 'module',
    location:  path.join(__dirname, '../../../src/code/fn-interface.testbed.js')
    //location: '../../../src/code/fn-interface.testbed.js'
};