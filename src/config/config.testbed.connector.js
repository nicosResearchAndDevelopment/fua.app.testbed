const
    connector_config = require('../../data/daps/cert/connector/client.js');

exports.uri = 'https://tb.nicos-rd.com/';
exports.id  = connector_config.meta.SKIAKI;
// exports.key        = connector_config.key;
// exports.pub       = connector_config.pub;
exports.publicKey  = connector_config.publicKey;
exports.privateKey = connector_config.privateKey;
