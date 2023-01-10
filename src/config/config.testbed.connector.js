const
    connector_config = require('../../cert/daps/connector/client.js');

exports.uri = 'https://testbed.nicos-rd.com.com/';
exports.id  = connector_config.meta.SKIAKI;
// exports.key        = connector_config.key;
// exports.cert       = connector_config.cert;
exports.publicKey  = connector_config.publicKey;
exports.privateKey = connector_config.privateKey;
