const
    path                 = require('path'),
    {CloudEvent}         = require('cloudevents'),
    util                 = require('./code/util.testbed.js'),
    express              = require('express'),
    Middleware_LDP       = require('@nrd/fua.middleware.ldp'),
    Middleware_WEB       = require('@nrd/fua.middleware.web'),
    Middleware_WEB_login = require('@nrd/fua.middleware.web/login')
; // const

module.exports = async function TestbedApp(
    {
        'config': config,
        'agent':  agent
    }
) {

    const
        app          = agent.app,
        server       = agent.server,
        io           = agent.io,
        io_testsuite = agent.io.of('/execute');

    //region >> WebApp
    app.use('/browse', Middleware_WEB({
        lib: true,
        ext: true,
        res: {pattern: '/nicos-rd/*'}
    }));
    app.use('/browse', express.static(path.join(__dirname, 'code/browse')));

    app.use(['/domain', '/users', '/groups'], Middleware_LDP({
        space:      agent.space,
        rootFolder: path.join(__dirname, '../data/resource'),
        baseIRI:    agent.uri.replace(/[/#]$/, '')
    }));

    io.on('connection', (socket) => {

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
    //endregion >> WebApp

    //region >> LDN
    app.post('/inbox', express.json(), (request, response, next) => {
        // TODO
        util.logObject(request.body)
        next();
    });
    //endregion >> LDN

    //region >> DAPS
    app.post(agent.DAPS.token_path, express.json(), express.urlencoded({extended: false}), async (request, response, next) => {
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

    app.get(agent.DAPS.jwks_path, async (request, response) => {
        response.send(agent.DAPS.publicKeyStore);
    });

    app.post(agent.DAPS.vc_path, express.json(), async (request, response, next) => {
        // TODO
        debugger;
        const DAT = await agent.DAPS.generateVC({});
        util.logObject(request.body);
        next();
    });
    //endregion >> DAPS

    //region >> Testsuite
    io_testsuite.on('connection', (socket) => {

        socket.on('test', async (token, test, callback) => {
            token.thread.push(`${util.utcDateTime()} : TESTBED : urn:tb:app:testsuite_socket:on : test : start`);

            let
                ec       = test['ec'],
                command  = test['command'],
                param    = test['param']
            ;
            token        = ((typeof token === 'string') ? {id: token, thread: []} : token);
            token.thread = (token.thread || []);
            try {
                let result = await agent.executeTest({
                    'ec':      ec,
                    'command': command,
                    'param':   param
                });
                token.thread.push(`${util.utcDateTime()} : TESTBED : urn:tb:app:testsuite_socket:on : test : before : callback`);
                callback(null, token, result);
            } catch (jex) {
                // TODO : transform new Errors !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                let error = {
                    message: jex.message
                };
                if (jex.code)
                    error.code = jex.code;
                callback(error, token, undefined);
            } // try

        }); // testsuite_socket.on('test')

        socket.on('config', async (token, test, callback) => {
            //debugger;
            token.thread.push(`${util.utcDateTime()} : TESTBED : urn:tb:app:testsuite_socket:on : config : start`);
        }); // testsuite_socket.on('config')

        socket.on('subscribe', ({room}) => {
            util.logText(`Socket<${socket.id}> tries to subscribe to { room: "${room}" }`);
            // TODO the id must be part of the room and referenced by any tickets/tokens/etc.
            // in order to emit any events back to the relevant subscriber

            // const id = socket.session?.id || socket.id;
            switch (room) {
                case 'event':
                    // socket.join('event-' + id);
                    socket.join('event');
                    break;
            }
        });

    }); // io_testsuite.on('connection')

    // TODO the (error, result) pattern should only be used in acknowledge callbacks, not in events
    agent.on('event', (event) => {
        util.logObject(event);
        io.to('terminal').emit('printData', {
            'prov': '[Testbed]',
            'data': event
        });

        io_testsuite.to('event').emit('event', event);
    }); // agent.on('event')

    agent.on('error', (error) => {
        util.logError(error);
        io.to('terminal').emit('printError', {
            'prov':  '[Testbed]',
            'error': '' + (error?.stack ?? error)
        });

        io_testsuite.to('event').emit('error', error);
    }); // agent.on('error')
    //endregion >> Testsuite

    app.get('/', (request, response) => response.redirect('/browse'));

    await agent.listen();
    util.logText(`testbed app is listening at <${agent.url}>`);
    agent.once('closed', () => util.logText('testbed app has closed'));

}; // module.exports = TestbedApp
