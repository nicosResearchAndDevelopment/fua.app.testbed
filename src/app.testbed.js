const
    util                 = require('./code/util.testbed.js'),
    path                 = require('path'),
    express              = require('express'),
    Middleware_LDP       = require('@nrd/fua.middleware.ldp'),
    Middleware_WEB       = require('@nrd/fua.middleware.web'),
    Middleware_WEB_login = require('@nrd/fua.middleware.web/login');

module.exports = async function TestbedApp(
    {
        'config': config,
        'agent':  agent
    }
) {

    util.assert(agent.app, 'expected agent to have app defined');
    util.assert(agent.io, 'expected agent to have io defined');

    //region >> WebApp

    agent.app.use('/browse', Middleware_WEB({
        lib: true,
        ext: true,
        res: {pattern: '/nicos-rd/*'}
    }));

    agent.app.use('/browse', express.static(path.join(__dirname, 'code/browse')));

    agent.app.use(['/domain', '/users', '/groups'], Middleware_LDP({
        space:      agent.space,
        rootFolder: path.join(__dirname, '../data/resource'),
        baseIRI:    agent.uri.replace(/[/#]$/, '')
    }));

    agent.io.on('connection', (socket) => {

        // REM uncomment to enable authentication
        //if (!socket.request.session.auth) {
        //    socket.emit('error', 'not authorized');
        //    socket.disconnect(true);
        //    return;
        //}

        socket.on('subscribe', ({room}) => {
            switch (room) {
                case 'terminal':
                    socket.emit('printMessage', {
                        'prov': '[Testbed]',
                        'msg':  'Welcome to NRD-Testbed!'
                    });
                    socket.join('terminal');
                    break;
            }
        });
    }); // io.on('connection')

    agent.event.on('**', (event) => {
        util.logObject(event);
        agent.io.to('terminal').emit('printData', {
            'prov': '[Testbed]',
            'data': event
        });
    });

    agent.on('error', (error) => {
        util.logError(error);
        agent.io.to('terminal').emit('printError', {
            'prov':  '[Testbed]',
            'error': '' + (error?.stack ?? error)
        });
    });

    //endregion >> WebApp
    //region >> LDN

    agent.app.post('/inbox', express.json(), (request, response, next) => {
        // TODO
        util.logObject(request.body)
        next();
    });

    //endregion >> LDN
    //region >> DAPS

    agent.app.post(agent.DAPS.token_path, express.json(), express.urlencoded({extended: false}), async (request, response, next) => {
        try {
            // util.logObject(request.body);
            //debugger;

            const DAT = await agent.DAPS.generateDAT({
                client_assertion:      request.body.client_assertion,
                client_assertion_type: request.body.client_assertion_type,
                grant_type:            request.body.grant_type,
                scope:                 request.body.scope
            });

            response.send(DAT);
        } catch (err) {
            next(err);
        } // try
    });

    agent.app.get(agent.DAPS.jwks_path, async (request, response) => {
        response.send(agent.DAPS.publicKeyStore);
    });

    agent.app.post(agent.DAPS.vc_path, express.json(), async (request, response, next) => {
        // TODO
        debugger;
        const DAT = await agent.DAPS.generateVC({});
        util.logObject(request.body);
        next();
    });

    //endregion >> DAPS
    //region >> Testsuite

    agent.app.post('/testing', express.json(), (request, response, next) => {
        agent.testing.postResponse(request, response).catch(next);
    });

    agent.io.of('/testing').on('connection', (socket) => {
        socket.on('launch', (data, acknowledge) => {
            agent.testing.ioResponse(data, acknowledge).catch(acknowledge);
        });
    });

    //endregion >> Testsuite
    //region >> redirect & listening

    agent.app.get('/', (request, response) => response.redirect('/browse'));

    await agent.listen();
    util.logText(`testbed app is listening at <${agent.url}>`);
    agent.once('closed', () => util.logText('testbed app has closed'));

    //endregion >> redirect & listening

}; // module.exports = TestbedApp
