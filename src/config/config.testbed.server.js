const
    tls_config = require('../../cert/tls-server/server.js');

exports.schema   = 'https';
exports.hostname = process.env.SERVER_HOST || 'testbed.nicos-rd.com';
exports.port     = Number(process.env.SERVER_PORT || 8080);

exports.options = {
    key:                tls_config.key,
    cert:               tls_config.cert,
    ca:                 tls_config.ca,
    requestCert:        false,
    rejectUnauthorized: false
};
