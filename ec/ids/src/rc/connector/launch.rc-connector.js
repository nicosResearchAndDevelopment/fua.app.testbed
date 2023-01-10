const
    util             = require('../../tb.ec.ids.util.js'),
    {parseArgv}      = require('@nrd/fua.module.subprocess'),
    RCConnectorAgent = require('./agent.rc-connector.js'),
    RCConnectorApp   = require('./app.rc-connector.js'),
    RCConnectorLab   = require('./lab.rc-connector.js');

(async function LaunchRCConnector() {

    const
        param          = parseArgv(),
        config         = JSON.parse(Buffer.from(param.config, 'base64').toString()),
        connectorAgent = await RCConnectorAgent.create({
            // TODO
        })

    // TODO

    await RCConnectorApp({
        'config': config,
        'agent':  connectorAgent
    });

    await RCConnectorLab({
        'config': config,
        'agent':  connectorAgent
    });

})().catch((err) => {

    util.logError(err);
    debugger;
    process.exit(1);

}); // LaunchRCConnector
