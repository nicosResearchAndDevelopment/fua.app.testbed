const
    path                       = require('path'),
    http                       = require('http'),
    https                      = require('https'),
    express                    = require('express'),
    ExpressSession             = require('express-session'),
    {CloudEvent, HTTP: ceHTTP} = require('cloudevents'),
    socket_io                  = require('socket.io'),
    rdf                        = require('@nrd/fua.module.rdf'),
    Middleware_LDP             = require('@nrd/fua.middleware.ldp'),
    Middleware_WEB             = require('@nrd/fua.middleware.web'),
    Middleware_WEB_login       = require('@nrd/fua.middleware.web/login'),
    util                       = require('./code/util.testbed.js')
; // const

module.exports = async function TestbedApp(
    {
        'config':        config,
        'agent':         agent,
        'serverNode':    serverNode,
        'serverOptions': serverOptions,
        'amec':          amec
    }
) {

    const
        host         = (serverNode.id.match(/^\w+:\/\/([^/#:]+)(?=[/#:]|$)/) || [null, 'localhost'])[1],
        schema       = serverNode.getLiteral('fua:schema').valueOf(),
        port         = serverNode.getLiteral('fua:port').valueOf(),
        app          = express(),
        server       = (schema === 'https')
            ? https.createServer(serverOptions, app)
            : http.createServer(app),
        listen       = util.promisify(server.listen).bind(server),
        io           = socket_io(server),
        io_testsuite = io.of('/execute'),
        sessions     = ExpressSession({
            resave:            false,
            saveUninitialized: false,
            secret:            serverNode.id
        });

    // let
    //     testsuite_socket = null
    // ;

    app.disable('x-powered-by');

    app.use(sessions);
    app.use(express.urlencoded({extended: false}));
    app.use(express.json());

    app.use('/browse', Middleware_WEB());
    app.use('/browse', express.static(path.join(__dirname, 'code/browse')));

    app.use('/data', Middleware_LDP({
        space:      agent.space,
        rootFolder: path.join(__dirname, '../data/resource'),
        baseIRI:    serverNode.id.replace(/[/#]$/, '')
    }));

    //region LDN
    app.post('/inbox', (request, response, next) => {
        // TODO
        util.logObject(request.body)
        next();
    });
    //endregion LDN

    //region DAPS

    app.post(agent.DAPS.token_path, express.json(), async (request, response, next) => {
        // TODO
        let error = null;
        try {
            // util.logObject(request.body);
            // debugger;

            const DAT = await agent.DAPS.generateDAT({
                client_assertion:      request.body.client_assertion,
                client_assertion_type: request.body.client_assertion_type,
                grant_type:            request.body.grant_type,
                scope:                 request.body.scope
            });

            response.send(DAT);
        } catch (jex) {
            response.status(404); //Send error response here
            error = jex;
        } // try
        next(error);
    });

    app.get(agent.DAPS.jwks_path, express.json(), async (request, response, next) => {
        //response.send({timestamp: `${util.timestamp()}`});
        response.send(agent.DAPS.publicKeyStore);
        next();
    });

    app.post(agent.DAPS.vc_path, express.json(), async (request, response, next) => {
        // TODO
        debugger;
        const DAT = await agent.DAPS.generateVC({});
        util.logObject(request.body);
        next();
    });
    //endregion DAPS

    // REM an alternative would be to use url-parameters
    //for (let [ecName, ec] of Object.entries(testbed.ecosystems)) {
    //    for (let [fnName, fn] of Object.entries(ec.fn)) {
    //        testbed.assert(util.isFunction(fn), `expected ${ecName}->${fnName} to be a function`);
    //        const route = `/${ecName}/${fnName}`;
    //        app.post(route, express_json, async function (request, response, next) {
    //            try {
    //                const
    //                    param   = request.body,
    //                    args    = [param], // TODO parameter mapping
    //                    result  = await fn.apply(null, args),
    //                    payload = JSON.stringify(result); // TODO result mapping
    //                response.type('json').send(payload);
    //            } catch (err) {
    //                next(err);
    //            }
    //        });
    //    }
    //} // for ()

    io.use((socket, next) => {
        sessions(socket.request, socket.request.res, next);
    });

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

    io_testsuite.use((socket, next) => {
        sessions(socket.request, socket.request.res, next);
    });

    // io_testsuite.use(async (socket, next) => {
    //     //debugger;
    //
    //     let result = await agent.authenticate({
    //         Authorization: 'Basic ' + Buffer.from(`${socket.handshake.auth.user}:${socket.handshake.auth.password}`).toString('base64')
    //         // REM : ERROR : Authorization: 'Basic ' + Buffer.from(`${socket.handshake.auth.user}:${socket.handshake.auth.password + 'nix'}`).toString('base64')
    //     }, 'BasicAuth');
    //
    //     if (result) {
    //         next();
    //     } else {
    //         next(new Error(`TODO: not authenticated.`));
    //     } // if ()
    // });

    io_testsuite.on('connection', (socket) => {

        // agent.testsuite_inbox_socket = socket;
        // testsuite_socket             = socket;

        socket.on('test', async (token, test, callback) => {
            token.thread.push(`${util.timestamp()} : TESTBED : urn:tb:app:testsuite_socket:on : test : start`);

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
                token.thread.push(`${util.timestamp()} : TESTBED : urn:tb:app:testsuite_socket:on : test : before : callback`);
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

    amec.on('authentication-error', (error) => {
        util.logError(error);
        io.to('terminal').emit('printError', {
            'prov':  '[Testbed]',
            'error': '' + (error?.stack ?? error)
        });
    });

    server.on('error', (error) => {
        util.logError(error);
        io.to('terminal').emit('printError', {
            'prov':  '[Testbed]',
            'error': '' + (error?.stack ?? error)
        });
    });

    // TODO the (error, result) pattern should only be used in acknowledge callbacks, not in events
    agent.on('event', (error, data) => {
        util.logText('app.testbed :: agent : event :: >>>');

        if (error) {
            util.logError(error);
            io.to('terminal').emit('printError', {
                'prov':  '[Testbed]',
                'error': '' + (error?.stack ?? error)
            });
        }

        if (data) {
            util.logObject(data);
            const cloudEvent = new CloudEvent({
                // '@context':      'https://github.com/cloudevents/spec/blob/v1.0/spec.md',
                // specversion: '1.0',
                type:   [data.type, data.method, data.step].filter(val => val).join('.'),
                id:     data.id,
                source: data.prov || serverNode.id,
                time:   data.end || data.start
                // datacontenttype: 'application/json',
                // data:            data
            });
            io.to('terminal').emit('printData', {
                // 'prov': '[Testbed]',
                'prov': '[CloudEvent]',
                'data': cloudEvent
            });
        }

        // if (testsuite_socket) {
        //     //debugger;
        //     // TODO : streamline
        //     testsuite_socket.emit('event', error, data);
        // } // if ()
        // REM: not like above, better:
        // io.to('testsuite').emit('event', error, data);
        io_testsuite.to('event').emit('event', error, data);

        util.logText('app.testbed :: agent : event :: <<<');
    }); // agent.on('event')

    agent.on('error', (error) => {
        util.logText('app.testbed :: agent : error :: >>>');

        if (error) {
            util.logError(error);
            io.to('terminal').emit('printError', {
                'prov':  '[Testbed]',
                'error': '' + (error?.stack ?? error)
            });
        }

        // if (testsuite_socket) {
        //     //debugger;
        //     // TODO : streamline
        //     testsuite_socket.emit('error', {'error': error});
        // } // if ()
        // REM: not like above, better:
        // io.to('testsuite').emit('error', {
        //     'error': error
        // });
        // TODO the (error, result) pattern should only be used in acknowledge callbacks, not in events
        io_testsuite.to('event').emit('event', error);

        util.logText('app.testbed :: agent : error :: <<<');
    }); // agent.on('error')

    app.get('/', (request, response) => {
        response.redirect('/browse');
    });

    await listen(port);
    util.logText(`testbed app is listening at <${schema}://${host}:${port}/>`);

}; // module.exports

// EOF
