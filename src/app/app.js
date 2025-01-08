const
    assert               = require('@fua/core.assert'),
    is                   = require('@fua/core.is'),
    tty                  = require('@fua/core.tty'),
    path                 = require('path'),
    express              = require('express'),
    Middleware_LDP       = require('@fua/service.ldp'),
    Middleware_WEB       = require('@fua/service.ui'),
    Middleware_WEB_login = require('@fua/service.ui/login');

module.exports = async function ({server: {app, io}, space: {space}, tb, amec, events, ...config}) {

    app.use(function (request, response, next) {
        tty.log.request(request);
        next();
    });

    app.get('/about', (request, response) => {
        response.type('json').send(JSON.stringify(config.about));
    });

    app.get('/', (request, response) => response.redirect('/browse'));

    app.get('/browse', function (request, response, next) {
        if (request.session.auth) next();
        else response.redirect('/login');
    });

    app.use('/login', Middleware_WEB({
        lib: false,
        ext: false,
        res: {pattern: '/nicos-rd/*'}
    }));

    app.use('/login', Middleware_WEB_login({
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

    app.post('/login', express.urlencoded({extended: false}), async function (request, response, next) {
        try {
            const
                {user, password} = request.body,
                basicAuthString  = Buffer.from(user + ':' + password).toString('base64'),
                auth             = await amec.authenticate({authorization: 'Basic ' + basicAuthString});
            if (auth) {
                request.session.auth = auth;
                response.redirect('/browse');
            } else {
                response.sendStatus(401);
            }
        } catch (err) {
            tty.error(err);
            response.sendStatus(400);
        }
    });

    app.get('/logout', function (request, response) {
        delete request.session.auth;
        response.redirect('/login');
    });

    app.use(async function (request, response, next) {
        if (request.session.auth) {
            response.locals.auth = request.session.auth;
            next();
        } else {
            const auth = await amec.authenticate(request.headers);
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
    io.use(async function (socket, next) {
        if (!socket.data) Object.defineProperties(socket, {data: {value: {}}});
        socket.data.auth = socket.request.session?.auth || socket.request.res.locals?.auth;
        if (socket.data.auth) next();
        else next({code: 401, message: 'Unauthorized'});
    });

    app.use('/browse', Middleware_WEB({
        lib: true,
        ext: true,
        res: {pattern: '/nicos-rd/*'}
    }));

    app.use('/browse', express.static(path.join(__dirname, '../browse')));

    app.use('/data', Middleware_LDP({
        space:      space,
        rootFolder: path.join(__dirname, '../../data/resource'),
        baseIRI:    config.ldp.uri.replace(/[/#]$/, '')
    }));

    io.on('connection', (socket) => {

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

    events.on('**', (event) => {
        tty.log(event);
        io.to('terminal').emit('printData', {
            'prov': '[Testbed]',
            'data': event
        });
    });

    tb.on('error', (error) => {
        tty.error(error);
        io.to('terminal').emit('printError', {
            'prov':  '[Testbed]',
            'error': '' + (error?.stack ?? error)
        });
    });

    app.post('/inbox', express.json(), (request, response, next) => {
        // TODO
        tty.log(request.body)
        next();
    });

    app.post('/testing', express.json(), (request, response, next) => {
        tb.testing.postResponse(request, response).catch(next);
    });

    io.of('/testing').on('connection', (socket) => {
        socket.on('launch', (data, acknowledge) => {
            tb.testing.ioResponse(data, acknowledge).catch(acknowledge);
        });
    });

    app.get('/', (request, response) => response.redirect('/browse'));

};
