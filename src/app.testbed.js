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

    agent.app.get('/about', (request, response) => {
        const about = {
            issuer: `${config.server.schema}://${config.server.hostname}:${config.server.port}/`
        };
        response.type('json').send(JSON.stringify(about));
    });

    //region >> Login

    agent.app.get('/', (request, response) => response.redirect('/browse'));

    agent.app.get('/browse', function (request, response, next) {
        if (request.session.auth) next();
        else response.redirect('/login');
    });

    agent.app.use('/login', Middleware_WEB({
        lib: false,
        ext: false,
        res: {pattern: '/nicos-rd/*'}
    }));

    agent.app.use('/login', Middleware_WEB_login({
        page:    {
            title:   'NRD Testbed Login',
            _info:   'This is the login page for the Testbed.',
            lang:    'en',
            favicon: '/login/res/nicos-rd/favicon.ico',
            logo:    '/login/res/nicos-rd/signet.png'
        },
        login:   {
            method: 'POST',
            target: '/login',
            button: 'Submit',
            user:   {
                name:        'user',
                type:        'email',
                label:       'Username',
                maxlength:   64,
                placeholder: 'max@mustermann.de'
            },
            pass:   {
                name:        'password',
                label:       'Password',
                maxlength:   64,
                placeholder: 'secure password'
            },
            _tfa:   {
                name:        'tfa',
                type:        'text',
                label:       'Two-Factor-Authentication',
                maxlength:   64,
                button:      'Acquire Second Factor',
                method:      'POST',
                target:      '/login/tfa',
                placeholder: '1234-5678',
                pattern:     '^\\d{4}-?\\d{4}$'
            }
        },
        _report: {
            method:      'POST',
            target:      '/login/report',
            browser:     true,
            geolocation: true
        }
    }));

    agent.app.post('/login', express.urlencoded({extended: false}), async function (request, response, next) {
        try {
            const
                {user, password} = request.body,
                basicAuthString  = Buffer.from(user + ':' + password).toString('base64'),
                auth             = await agent.amec.authenticate({authorization: 'Basic ' + basicAuthString});
            if (auth) {
                request.session.auth = auth;
                response.redirect('/browse');
            } else {
                response.sendStatus(401);
            }
        } catch (err) {
            util.logError(err);
            response.sendStatus(400);
        }
    });

    agent.app.get('/logout', function (request, response) {
        delete request.session.auth;
        response.redirect('/login');
    });

    agent.app.use(async function (request, response, next) {
        if (request.session.auth) {
            response.locals.auth = request.session.auth;
            next();
        } else {
            const auth = await agent.amec.authenticate(request.headers);
            if (auth) {
                response.locals.auth = auth;
                next();
            } else {
                response.sendStatus(401);
            }
        }
    });

    // TODO evaluate if the following method for authenticating sockets works
    // -> session auth works
    // -> other auth methods?
    agent.io.use(async function (socket, next) {
        if (!socket.data) Object.defineProperties(socket, {data: {value: {}}});
        socket.data.auth = socket.request.session?.auth || socket.request.res.locals?.auth;
        if (socket.data.auth) next();
        else next({code: 401, message: 'Unauthorized'});
    });

    //endregion >> Login
    //region >> WebApp

    agent.app.use('/browse', Middleware_WEB({
        lib: true,
        ext: true,
        res: {pattern: '/nicos-rd/*'}
    }));

    agent.app.use('/browse', express.static(path.join(__dirname, 'code/browse')));

    agent.app.use(['/domain', '/users', '/groups', '/data'], Middleware_LDP({
        space:      agent.space,
        rootFolder: path.join(__dirname, '../data/resource'),
        baseIRI:    agent.uri.replace(/[/#]$/, '')
    }));

    agent.io.on('connection', (socket) => {

        // if (!socket.request.session.auth) {
        //     socket.emit('error', 'not authorized');
        //     socket.disconnect(true);
        //     return;
        // }

        // TODO authorize authenticated sockets depending on their auth object

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

    // agent.app.post(agent.DAPS.token_path, express.json(), express.urlencoded({extended: false}), async (request, response, next) => {
    //     try {
    //         // util.logObject(request.body);
    //         //debugger;
    //
    //         const DAT = await agent.DAPS.generateDAT({
    //             client_assertion:      request.body.client_assertion,
    //             client_assertion_type: request.body.client_assertion_type,
    //             grant_type:            request.body.grant_type,
    //             scope:                 request.body.scope
    //         });
    //
    //         response.send(DAT);
    //     } catch (err) {
    //         next(err);
    //     } // try
    // });
    //
    // agent.app.get(agent.DAPS.jwks_path, async (request, response) => {
    //     response.send(agent.DAPS.publicKeyStore);
    // });
    //
    // agent.app.post(agent.DAPS.vc_path, express.json(), async (request, response, next) => {
    //     // TODO
    //     debugger;
    //     const DAT = await agent.DAPS.generateVC({});
    //     util.logObject(request.body);
    //     next();
    // });

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
