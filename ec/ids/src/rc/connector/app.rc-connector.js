const
    util    = require('../../tb.ec.ids.util.js'),
    express = require('express');

module.exports = async function RCConnectorApp(
    {
        'config': config,
        'agent':  agent
    }
) {

    util.assert(agent.app, 'expected agent to have app defined');
    util.assert(agent.io, 'expected agent to have io defined');

    // TODO

    await agent.listen();
    util.logText(`rc-connector app is listening at <${agent.url}>`);
    agent.once('closed', () => util.logText('rc-connector app has closed'));

}; // RCConnectorApp
