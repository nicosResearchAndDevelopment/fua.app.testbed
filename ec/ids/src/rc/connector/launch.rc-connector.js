const
    util             = require('../../tb.ec.ids.util.js'),
    crypto           = require('crypto'),
    http             = require('http'),
    https            = require('https'),
    {parseArgv}      = require('@nrd/fua.module.subprocess'),
    RCConnectorAgent = require('./agent.rc-connector.js'),
    RCConnectorApp   = require('./app.rc-connector.js'),
    RCConnectorLab   = require('./lab.rc-connector.js');

(async function LaunchRCConnector() {

    /* 1. Parse the config for the agent: */

    util.logText('parsing config');

    const
        param  = parseArgv(),
        config = JSON.parse(Buffer.from(param.config, 'base64').toString());

    /* 2. Construct a server agent for your setup: */

    util.logText('creating rc-connector agent for ' + config.name);

    const connectorAgent = await RCConnectorAgent.create({
        schema:    config.server.schema,
        host:      config.server.host,
        port:      config.schema.port,
        server:    config.server.options,
        app:       true,
        io:        true,
        scheduler: true,
        connector: {
            id:         config.connector.uri,
            privateKey: crypto.createPrivateKey(config.connector.key),
            SKIAKI:     config.connector.id,
            DAPS:       {
                //default: 'http://omejdn-daps.nicos-rd.com:4567'
                default: {
                    dapsUrl:       'https://omejdn-daps.nicos-rd.com:8082/auth',
                    dapsTokenPath: `/token`,
                    dapsJwksPath:  `/jwks.json`
                },
                tb_daps: {
                    dapsUrl: 'https://testbed.nicos-rd.com:8080'
                }
                //default: 'https://nrd-daps.nicos-rd.com:8082/' // REM: proxy in testbed
                //default: 'https://localhost:8082/', // REM: proxy in testbed
                //default: 'https://testbed.nicos-rd.com:8080/'
            },
            http_agent: config.server.schema === 'https'
                            ? new https.Agent(config.server.options)
                            : new http.Agent()
        }
    });

    /* 3. Use additional methods to configure the setup: */

    // TODO

    /* 4. Launch the main app: */

    util.logText('starting application');

    await RCConnectorApp({
        'config': config,
        'agent':  connectorAgent
    });

    /* 5. Launch the testing lab: */

    await RCConnectorLab({
        'config': config,
        'agent':  connectorAgent
    });

})().catch((err) => {

    util.logError(err);
    debugger;
    process.exit(1);

}); // LaunchRCConnector
