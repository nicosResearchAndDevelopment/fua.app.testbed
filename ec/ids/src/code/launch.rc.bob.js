const
    http        = require('http'),
    https       = require('https'),
    util        = require('../../../../src/code/util.testbed.js'),
    {parseArgv} = require('@nrd/fua.module.subprocess'),
    DatAuth     = require(`@nrd/fua.agent.amec/DatAuth`),
    certs       = require('../cert/bob/index.js'),
    RCAgent     = require('./agent.rc.js'),
    RCApp       = require('./app.rc.js'),
    RCLab       = require('./lab.rc.js');

(async function LaunchBob() {

    const
        {param} = parseArgv(),
        config  = JSON.parse(Buffer.from(param.config, 'base64').toString()),
        rcAgent = await RCAgent.create({
            schema:     config.schema,
            hostname:   config.host,
            port:       config.port,
            server:     {
                key:                certs.server.key,
                cert:               certs.server.cert,
                ca:                 certs.server.ca,
                requestCert:        false,
                rejectUnauthorized: false
            },
            httpsAgent: {
                key:                certs.server.key,
                cert:               certs.server.cert,
                ca:                 certs.server.ca,
                requestCert:        false,
                rejectUnauthorized: false
            },
            connector:  {
                id:         config.schema + '://' + config.host + '/',
                privateKey: certs.connector.privateKey,
                SKIAKI:     certs.connector.meta.SKIAKI,
                DAPS:       {
                    default: 'http://omejdn-daps.nicos-rd.com:4567'
                },
                http_agent: config.schema === 'https' ? new https.Agent({
                    key:  certs.server.key,
                    cert: certs.server.cert,
                    ca:   certs.server.ca
                }) : new http.Agent()
            },
            amec:       true,
            app:        true,
            io:         true
        });

    rcAgent.amec.registerMechanism(DatAuth.prefLabel, DatAuth({connector: rcAgent.connector}));

    config.name = 'BOB';

    await RCApp({
        'config': config,
        'agent':  rcAgent
    });

    await RCLab({
        'config': config,
        'agent':  rcAgent
    });

})().catch((err) => {

    util.logError(err);
    debugger;
    process.exit(1);

}); // LaunchBob
