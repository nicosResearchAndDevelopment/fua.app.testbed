const
    path                       = require('path'),
    http                       = require('http'),
    https                      = require('https'),
    //
    express                    = require('express'),
    ExpressSession             = require('express-session'),
    {CloudEvent, HTTP: ceHTTP} = require('cloudevents'),
    socket_io                  = require('socket.io'),
    //
    Middleware_LDP             = require('@nrd/fua.middleware.ldp'),
    Middleware_WEB             = require('@nrd/fua.middleware.web'),
    Middleware_WEB_login       = require('@nrd/fua.middleware.web/login'),
    util                       = require('./code/util.testsuite.js')
; // const

module.exports = async function TestsuiteApp(
    {
        'config':        config,
        'agent':         agent,
        'serverNode':    serverNode,
        'serverOptions': serverOptions,
        'amec':          amec
    }
) {

    const
        host     = (config.server.url.match(/^\w+:\/\/([^/#:]+)(?=[/#:]|$)/) || [null, 'localhost'])[1],
        schema   = (config.server.url.match(/^\w+(?=:\/\/)/) || ['http'])[0],
        port     = config.server.port,
        app      = express(),
        server   = (schema === 'https')
            ? https.createServer(serverOptions, app)
            : http.createServer(app),
        listen   = util.promisify(server.listen).bind(server),
        io       = socket_io(server),
        sessions = ExpressSession({
            resave:            false,
            saveUninitialized: false,
            secret:            serverNode.id
        })
    ; // const

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

    app.post('/inbox', (request, response, next) => {
        // TODO
        util.logObject(request.body);
        next();
    });

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
                        'prov': '[Testsuite]',
                        'msg':  'Welcome to NRD-Testsuite!'
                    });
                    socket.join('terminal');
                    break;
            }
        });
    }); // io.on('connection')

    amec.on('authentication-error', (error) => {
        util.logError(error);
        io.to('terminal').emit('printError', {
            'prov':  '[Testsuite]',
            'error': '' + (error?.stack ?? error)
        });
    });

    server.on('error', (error) => {
        util.logError(error);
        io.to('terminal').emit('printError', {
            'prov':  '[Testsuite]',
            'error': '' + (error?.stack ?? error)
        });
    });

    agent.on('data', (data) => {
        util.logText('app.testsuite :: agent : data :: >>>');
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
            // 'prov': '[Testsuite]',
            'prov': '[CloudEvent]',
            'data': cloudEvent
        });
        util.logText('app.testsuite :: agent : data :: <<<');
    }); // agent.on('event')

    agent.on('error', (error) => {
        util.logText('app.testbed :: agent : error :: >>>');
        if (error) {
            util.logError(error);
            io.to('terminal').emit('printError', {
                'prov':  '[Testsuite]',
                'error': '' + (error?.stack ?? error)
            });
        }
        util.logText('app.testbed :: agent : error :: <<<');
    }); // agent.on('error')

    agent.on('testbed_socket_connect', async () => {
        //region TEST
        let
            alice = "http://127.0.0.1:8099/",
            bob   = {
                schema: "http",
                host:   "127.0.0.1",
                port:   8098
            }
            // REM : doesn't work!!!!!!!! (connect NOT present!!!
        ; // let

        // const param = { // REM : connect ALICE
        //    'ec':      "ids",
        //    'command': "getSelfDescriptionFromRC",
        //    'param':   {
        //        'rc': alice
        //    }
        // };
        const param = { // REM : ALICE gets BOBs selfDescription
            'ec':      "ids",
            'command': "requestApplicantsSelfDescription",
            'param':   {
                //'operator': "simon petrac",
                'rc': alice,
                // REM : Bob as applicant
                'schema': bob.schema,
                'host':   bob.host,
                'port':   bob.port,
                'path':   "/about"
            }
        };

        // const data = { // REM :
        //    //'ec':      "ids",
        //    //'command': "requestApplicantsSelfDescription",
        //    testCase: "urn:ts:ec:ids:tc:INF_01",
        //    param:   {
        //        //'operator': "simon petrac",
        //        'rc': alice,
        //        // REM : Bob as applicant
        //        'schema': bob.schema,
        //        'host':   bob.host,
        //        'port':   bob.port,
        //        'path':   "/about"
        //    }
        // };
        const data = { // REM : ping localhost ALICE
            testCase: "urn:ts:ec:net:tc:ping",
            param:    {
                'host': "127.0.0.1"
            }
        };
        // const data = { // REM : ping localhost ALICE
        //    testCase: "urn:ts:ec:net:tc:portscan",
        //    param:    {
        //        'host': "127.0.0.1"
        //    }
        // };
        let
            pool_root = `${agent.id}bpef/pool/`,
            test_result
        ;
        try {

            let host      = "applicant.com";
            data.operator = "https://testbed.nicos-rd.com/domain/user#jlangkau";

            //test_result = await agent.test(agent.Token({id: undefined, start: undefined}), data);

            test_result = await agent.enforce(
                agent.Token({
                    id:     undefined,
                    start:  undefined,
                    thread: `${util.timestamp()} : TESTSUITE : app : process : start`
                }),
                data
            );

            util.logObject(test_result);
            debugger;

        } catch (error) {
            util.logError(error);
            debugger;
        } // try

        //endregion TEST
    }); // agent.on('testbed_socket_connect')

    app.get('/', (request, response) => {
        response.redirect('/browse');
    });

    await listen(port);
    util.logText(`testsuite app is listening at <${schema}://${host}:${port}/>`);

}; // module.exports

// EOF
