const
    path                    = require('path'),
    server_tls_certificates = require('../../cert/tls-server/server.js');

exports.server = {
    id:      'https://testsuite.nicos-rd.com/',
    url:     'https://testsuite.nicos-rd.com/',
    port:    8081,
    options: {
        key:                server_tls_certificates.key,
        cert:               server_tls_certificates.cert,
        ca:                 server_tls_certificates.ca,
        requestCert:        false,
        rejectUnauthorized: false
    }
};

exports.testbed = {
    schema: 'https',
    host:   'testbed.nicos-rd.com',
    port:   8080,
    auth:   {
        user:     'testsuite',
        password: 'marzipan'
    }
};
