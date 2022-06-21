const
    path    = require('path'),
    util    = require('../../../../src/code/util.testbed.js'),
    express = require('express');

module.exports = async function RemoteConnectorApp(
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
            const about = await agent.connector.selfDescription();
            response.type('json').send(JSON.stringify(about));
        } catch (err) {
            util.logError(err);
            response.sendStatus(500);
        }
    });

    agent.on('tb.rc.event', (event) => {
        // TODO improve for needed purpose
        io.to('events').emit('tb.rc.event', event);
    }); // agent.on('event')

    io.on('connection', (socket) => {

        socket.join('events');

        socket.on('rc_refreshDAT', async (param, callback) => {
            try {
                const result = await agent.refreshDAT(param);
                callback(null, result);
            } catch (err) {
                callback(err);
            }
        }); // socket.on('rc_refreshDAT')

        socket.on('rc_requestApplicantsSelfDescription', async (param, callback) => {
            try {
                const result = await agent.requestApplicantsSelfDescription(param);
                callback(null, result);
            } catch (err) {
                callback(err);
            }
        }); // socket.on('rc_requestApplicantsSelfDescription')

        socket.on('rc_waitForApplicantsSelfDescriptionRequest', async (param, callback) => {
            try {
                const result = await agent.waitForApplicantsSelfDescriptionRequest(param);
                callback(null, result);
            } catch (err) {
                callback(err);
            }
        }); // socket.on('rc_waitForApplicantsSelfDescriptionRequest')

        socket.on('rc_getSelfDescriptionFromRC', async (param, callback) => {
            try {
                const result = await agent.connector.selfDescription();
                callback(null, result);
            } catch (err) {
                callback(err);
            }
        }); // socket.on('rc_getSelfDescriptionFromRC')

    }); // io.on('connection')

}; // module.exports = RemoteConnectorApp
