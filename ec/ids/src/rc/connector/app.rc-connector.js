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

    agent.app.post('/inbox', express.json(), (request, response, next) => {
        try {
            util.logObject(request.body);
            next();
        } catch (err) {
            util.logError(err);
            response.sendStatus(500);
        }
    });

    agent.app.get('/', (request, response, next) => {
        try {
            response.send(`${util.utcDateTime()} : ${config.name} : root : test`);
        } catch (err) {
            util.logError(err);
            response.sendStatus(500);
        }
    });

    agent.app.get('/about', async (request, response, next) => {
        try {
            const about = agent.createSelfDescription();
            response.type('json').send(JSON.stringify(about));
        } catch (err) {
            util.logError(err);
            response.sendStatus(500);
        }
    });

    agent.io.on('connection', (socket) => {

        // TODO
        // IDEA use IPC channel alternatively

    });

    await agent.listen();
    util.logText(`rc-connector app is listening at <${agent.url}>`);
    agent.once('closed', () => util.logText('rc-connector app has closed'));

}; // RCConnectorApp
