const
    fs            = require("fs"),
    path          = require('path'),
    crypto        = require("crypto"),
    http          = require('https'),
    //
    util          = require('@nrd/fua.core.util'),
    {parseArgv}   = require('@nrd/fua.module.subprocess'),
    //
    DatAuth       = require(`@nrd/fua.agent.amec/DatAuth`),

    {RcConnector} = require('../connector.rc.js')
; // const

let
    __privateKey__ = undefined,
    config         = {}
;

const param = parseArgv();
config      = JSON.parse(Buffer.from(param.config, 'base64').toString('utf8'));

const {cert} = require(config['cert_client']);

config['connectorPrivateKey'] = crypto.createPrivateKey(cert.connector.key.toString());
config['tlsPrivateKey']       = crypto.createPrivateKey(cert['tls-server'].key.toString());

const
    tls_certificates = require(path.join(__dirname, './cert/tls-server/server.js'))
;

config['server_options'] = {
    key:                tls_certificates.key,
    cert:               tls_certificates.cert,
    ca:                 tls_certificates.ca,
    requestCert:        false,
    rejectUnauthorized: false
};

config['http_agent'] = new http.Agent({
    key:                config['server_options'].key,
    cert:               config['server_options'].cert,
    ca:                 config['server_options'].ca,
    requestCert:        config['server_options'].requestCert,
    rejectUnauthorized: config['server_options'].rejectUnauthorized
});

(async ({'config': config}) => {

    const
        bob_agent = new RcConnector({
            id:           config.id,
            SKIAKI:       config.SKIAKI,
            privateKey:   config.connectorPrivateKey,
            DAPS:         config.DAPS,
            idle_timeout: config.idle_timeout,
            http_agent:   config.http_agent
        })
    ; // const

    bob_agent.amec.registerMechanism(DatAuth.prefLabel, DatAuth({connector: bob_agent}));

    require('../app.rc.js')({
        //require('./app.bob.js')({
        agent:  bob_agent,
        config: {
            tlsPrivateKey:  config.tlsPrivateKey,
            name:           "BOB",
            schema:         config.schema,
            host:           config.host,
            port:           config.port,
            user:           config.user,
            server_options: config.server_options
        }
    });

})({'config': config}).catch(console.error);
