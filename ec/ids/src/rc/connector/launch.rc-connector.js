const
    util             = require('../../tb.ec.ids.util.js'),
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

    util.logText('creating rc-connector agent');

    const connectorAgent = await RCConnectorAgent.create({
        schema: config.server.schema,
        host:   config.server.host,
        port:   config.schema.port,
        server: config.server.options,
        app:    true,
        io:     true
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
