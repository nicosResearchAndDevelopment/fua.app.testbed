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
const param        = parseArgv();
config             = JSON.parse(Buffer.from(param.config, 'base64').toString('utf8'));

const {cert}                  = require(config['cert_client']);
config['connectorPrivateKey'] = crypto.createPrivateKey(cert.connector.key.toString());
config['tlsPrivateKey']       = crypto.createPrivateKey(cert['tls-server'].key.toString());

config['cert_client'] = undefined;

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
        alice_agent = new RcConnector({
            id:           config.id,
            SKIAKI:       config.SKIAKI,
            privateKey:   config.connectorPrivateKey,
            idle_timeout: config.idle_timeout,
            DAPS:         config.DAPS,
            http_agent:   config.http_agent
        })
    ; // const

    //region TEST
    //let dapsClient = alice_agent.getClient({daps: "default"});
    //let DAT        = await dapsClient.getDat();
    //debugger;
    //endregion TEST

    alice_agent.amec.registerMechanism(DatAuth.prefLabel, DatAuth({connector: alice_agent}));

    require('../app.rc.js')({
        agent:  alice_agent,
        config: {
            tlsPrivateKey:  config['tlsPrivateKey'],
            name:           "ALICE",
            schema:         config.schema,
            host:           config.host,
            port:           config.port,
            user:           config.user,
            server_options: config.server_options
        }
    });

})({'config': config}).catch(console.error);
