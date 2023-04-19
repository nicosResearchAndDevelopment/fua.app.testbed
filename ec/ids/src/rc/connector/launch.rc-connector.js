const
    util           = require('@nrd/fua.core.util'),
    {parseArgv}    = require('@nrd/fua.module.subprocess'),
    ConnectorAgent = require('@nrd/fua.ids.agent.connector'),
    RCConnectorApp = require('./app.rc-connector.js'),
    RCConnectorLab = require('./lab.rc-connector.js');

(async function LaunchRCConnector() {

    /* 1. Parse the config for the agent: */

    util.logText('parsing config');

    const
        param  = parseArgv(),
        config = JSON.parse(Buffer.from(param.config, 'base64url').toString());

    /* 2. Construct a server agent for your setup: */

    util.logText('creating rc-connector agent');

    const connectorAgent = await ConnectorAgent.create({
        schema:    config.server.schema,
        hostname:  config.server.hostname,
        port:      config.server.port,
        server:    config.server.options,
        app:       true,
        io:        true,
        scheduler: true,
        connector: {
            keyId: config.connector.id,
            key:   config.connector.key,
            pub:   config.connector.pub
        },
        daps:      {
            //default: 'http://omejdn-daps.nicos-rd.com:4567'
            default:  {
                dapsUrl:       'https://omejdn-daps.nicos-rd.com:8082/auth',
                dapsTokenPath: `/token`,
                dapsJwksPath:  `/jwks.json`
            },
            tb_daps:  {
                dapsUrl: 'https://testbed.nicos-rd.com:8080'
            },
            nrd_daps: {
                dapsUrl: 'https://nrd-daps.nicos-rd.com:8083/'
            }
            //default: 'https://nrd-daps.nicos-rd.com:8082/' // REM: proxy in testbed
            //default: 'https://localhost:8082/', // REM: proxy in testbed
            //default: 'https://testbed.nicos-rd.com:8080/'
        }
    });

    /* 3. Use additional methods to configure the setup: */

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
