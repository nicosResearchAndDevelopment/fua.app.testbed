const
    path             = require('path'),
    crypto           = require("crypto"),
    //
    util             = require('@nrd/fua.core.util'),
    {parseArgv}      = require('@nrd/fua.module.subprocess'),
    //
    DatAuth          = require(`@nrd/fua.agent.amec/DatAuth`),
    {AliceConnector} = require('./connector.alice.js')
; // const

let
    __privateKey__  = undefined,
    config          = {}
;
const {param, args} = parseArgv();
config              = JSON.parse(Buffer.from(param.config, 'base64').toString('utf8'));

const {cert}                  = require(config['cert_client']);
config['connectorPrivateKey'] = crypto.createPrivateKey(cert.connector.key.toString());
config['tlsPrivateKey']       = crypto.createPrivateKey(cert['tls-server'].key.toString());

config['cert_client'] = undefined;

(async ({'config': config}) => {
    const
        alice_agent = new AliceConnector({
            'id':           config.id,
            'SKIAKI':       config.SKIAKI,
            'privateKey':   config.connectorPrivateKey,
            'idle_timeout': config.idle_timeout,
            'DAPS':         config.DAPS
        })
    ; // const

    alice_agent.amec.registerMechanism(DatAuth.prefLabel, DatAuth({connector: alice_agent}));

    require('./app.alice.js')({
        'agent':  alice_agent,
        'config': {
            'tlsPrivateKey': config['tlsPrivateKey'],
            'port':          config.port,
            'user':          config.user
        }
    });

})({'config': config}).catch(console.error);

