const
    path                       = require('path'),
    http                       = require('http'),
    https                      = require('https'),
    express                    = require('express'),
    {CloudEvent, HTTP: ceHTTP} = require('cloudevents'),
    socket_io                  = require('socket.io'),
    rdf                        = require('@nrd/fua.module.rdf'),
    util                       = require('@nrd/fua.core.util'),
    ExpressSession             = require('express-session'),
    Middleware_LDP             = require('@nrd/fua.middleware.ldp'),
    WebLogin                   = require(path.join(util.FUA_JS_LIB, 'web.login/src/web.login.js')),
    WebLib                     = require(path.join(util.FUA_JS_LIB, 'web.lib/src/web.lib.js'))
; // const

module.exports = async function TestbedApp(
    {
        'space':  space = null,
        'agent':  agent,
        'config': config,
        'amec':   amec
    }
) {

    const
        app          = express(),
        server       = (config.server.schema === 'https')
            ? https.createServer(config.server.options, app)
            : http.createServer(app),
        io           = socket_io(server),
        io_testsuite = io.of('/execute'),
        express_json = express.json(),
        sessions     = ExpressSession(config.session);

    // let
    //     testsuite_socket = null
    // ;

    // server.on('connection', (tlsSocket) => {
    //     //debugger;
    // });
    // server.on('secureConnection', (tlsSocket) => {
    //     console.log(JSON.stringify(tlsSocket.getCipher(), "", '\t'));
    //     //console.log(JSON.stringify(tlsSocket.getPeerCertificate(true).raw.toString('base64'), "", '\t'));
    //     //debugger;
    // });
    // server.on('error', (error) => {
    //     debugger;
    // });
    // server.on('keylog', (line, tlsSocket) => {
    //    debugger;
    //    if (tlsSocket.remoteAddress !== '...')
    //        return; // Only log keys for a particular IP
    //    //logFile.write(line);
    // });

    app.disable('x-powered-by');

    app.use(sessions);
    // parse application/x-www-form-urlencoded
    app.use(express.urlencoded({extended: false}));
    // parse application/json
    app.use(express.json());

    app.use('/browse/lib', WebLib());
    app.use('/browse', express.static(path.join(__dirname, 'code/browse')));

    app.use('/data', Middleware_LDP({
        space:      agent.space,
        rootFolder: path.join(__dirname, '../data/resource'),
        baseIRI:    'https://testbed.nicos-rd.com'
    }));

    //region LDN
    app.post('/inbox', express.json(), (request, response, next) => {
        // TODO
        console.log(request.body);
        next();
    });
    //endregion LDN

    //region DAPS

    app.post(agent.DAPS.token_path, express.json(), async (request, response, next) => {
        // TODO
        let error = null;
        try {
            //debugger;
            //console.log(request.body);

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
        console.log(request.body);
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
        //debugger;
        return sessions(socket.request, socket.request.res, next)
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

    amec.on('authentication-error', (error) => {
        const errStr = '' + (error?.stack ?? error);
        console.error(errStr);
        io.to('terminal').emit('printError', {
            'prov':  '[Testbed]',
            'error': errStr
        });
    });

    io_testsuite.use(async (socket, next) => {
        //debugger;

        let result = await agent.authenticate({
            Authorization: 'Basic ' + Buffer.from(`${socket.handshake.auth.user}:${socket.handshake.auth.password}`).toString('base64')
            // REM : ERROR : Authorization: 'Basic ' + Buffer.from(`${socket.handshake.auth.user}:${socket.handshake.auth.password + 'nix'}`).toString('base64')
        }, 'BasicAuth');

        if (result) {
            next();
        } else {
            next(new Error(`TODO: not authenticated.`));
        } // if ()
    });

    io_testsuite.on('connection', (socket) => {

        agent.testsuite_inbox_socket = socket;

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

    }); // io_testsuite.on('connection')

    //io_testsuite.on('error', (error) => {
    //    debugger;
    //});

    server.on('error', (error) => {
        console.error(error);
        io.to('terminal').emit('printError', {
            'prov':  '[Testbed]',
            'error': '' + (error?.stack ?? error)
        });
    });

    agent.on('event', (error, data) => {
        console.log('app.testbed :: agent : event :: >>>');
        if (error) {
            console.error(error);
            io.to('terminal').emit('printError', {
                'prov':  '[Testbed]',
                'error': '' + (error?.stack ?? error)
            });
        }
        if (data) {
            console.log(data);
            const cloudEvent = new CloudEvent({
                // '@context':      'https://github.com/cloudevents/spec/blob/v1.0/spec.md',
                // specversion: '1.0',
                type:   [data.type, data.method, data.step].filter(val => val).join(':'),
                id:     data.id,
                source: data.prov || 'https://testbed.nicos-rd.com',
                time:   data.end || data.start || new Date().toISOString()
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
        console.log('app.testbed :: agent : event :: <<<');
    }); // agent.on('event')

    agent.on('error', (error) => {
        console.log('app.testbed :: agent : error :: >>>');
        if (error) {
            console.error(error);
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
        console.log('app.testbed :: agent : error :: <<<');
    }); // agent.on('error')

    app.get('/', (request, response) => {
        response.redirect('/browse');
    });

    await new Promise((resolve) =>
        server.listen(config.server.port, resolve)
    );

    console.log(`testbed app is listening at <${config.server.schema}://${config.server.host}:${config.server.port}>`);

}; // module.exports

// EOF
