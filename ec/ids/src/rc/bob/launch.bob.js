const
    path           = require('path'),
    crypto         = require("crypto"),
    //
    util           = require('@nrd/fua.core.util'),
    {parseArgv} = require('@nrd/fua.module.subprocess'),
    //
    {BobConnector} = require('./connector.bob.js')
; // const

let
    __privateKey__ = undefined,
    config         = {}
;

const {param, args} = parseArgv();
config = JSON.parse(Buffer.from(param.config, 'base64').toString('utf8'));

const {cert}                  = require(config['cert_client']);
config['connectorPrivateKey'] = crypto.createPrivateKey(cert.connector.key.toString());
config['tlsPrivateKey']       = crypto.createPrivateKey(cert['tls-server'].key.toString());

(async ({'config': config}) => {
    const
        bob_agent = new BobConnector({
            'id':     config.id,
            'SKIAKI': config.SKIAKI,
            //
            'privateKey': config.connectorPrivateKey,
            //
            'DAPS': config.DAPS,
            //
            'idle_timeout': config.idle_timeout
        })
    ; // const

    require('./app.bob.js')({
        'agent':  bob_agent,
        'config': {
            'tlsPrivateKey': config.tlsPrivateKey,
            'port':          config.port,
            'user':          config.user
        }
    });

})({'config': config}).catch(console.error);

