const
    path    = require('path'),
    util    = require('../../../../src/code/util.testbed.js'),
    express = require('express');

module.exports = async function RCApp(
    {
        'config': config,
        'agent':  agent
    }
) {

    const
        app    = agent.app,
        server = agent.server,
        io     = agent.io;

    app.post('/inbox', express.json(), (request, response, next) => {
        try {
            util.logObject(request.body);
            next();
        } catch (err) {
            util.logError(err);
            response.sendStatus(500);
        }
    });

    app.get('/', (request, response, next) => {
        try {
            response.send(`${util.utcDateTime()} : ${config.name} : root : test`);
        } catch (err) {
            util.logError(err);
            response.sendStatus(500);
        }
    });

    app.get('/about', async (request, response, next) => {
        try {
            const about = await agent.selfDescription(request.ip);
            response.type('json').send(JSON.stringify(about));
        } catch (err) {
            util.logError(err);
            response.sendStatus(500);
        }
    });

    agent.on('event', (event) => {
        io.emit('event', event);
    }); // agent.on('event')

    io.on('connection', (socket) => {

        socket.on('refreshDAT', async (param, callback) => {
            try {
                const result = await agent.refreshDAT(param);
                callback(null, result);
            } catch (err) {
                callback(err);
            }
        }); // socket.on('refreshDAT')

        socket.on('requestApplicantsSelfDescription', async (param, callback) => {
            try {
                const result = await agent.requestApplicantsSelfDescription(param);
                callback(null, result);
            } catch (err) {
                callback(err);
            }
        }); // socket.on('requestApplicantsSelfDescription')

        socket.on('waitForApplicantsSelfDescriptionRequest', async (param, callback) => {
            try {
                const result = await agent.waitForApplicantsSelfDescriptionRequest(param);
                callback(null, result);
            } catch (err) {
                callback(err);
            }
        }); // socket.on('waitForApplicantsSelfDescriptionRequest')

        socket.on('getSelfDescriptionFromRC', async (param, callback) => {
            try {
                const result = await agent.selfDescription('tb');
                callback(null, result);
            } catch (err) {
                callback(err);
            }
        }); // socket.on('getSelfDescriptionFromRC')

    }); // io.on('connection')

    await agent.listen();
    util.logText(`rc app is listening at <${agent.url}>`);
    agent.once('closed', () => util.logText('rc app has closed'));

}; // module.exports = RCApp
