const
    path      = require('path'),
    http      = require('http'),
    https     = require('https'),
    //
    express   = require('express'),
    socket_io = require('socket.io'),
    //
    util      = require('./code/util.testsuite.js'),
    uuid      = require('@nrd/fua.core.uuid')
; // const

module.exports = async function TestsuiteApp(
    {
        //'space':  space = null,
        'agent':  agent,
        'config': config
    }
) {

    const
        host   = (config.server.url.match(/^\w+:\/\/([^/#:]+)(?=[/#:]|$)/) || [null, 'localhost'])[1],
        schema = (config.server.url.match(/^\w+(?=:\/\/)/) || ['http'])[0],
        port   = config.server.port,
        app    = express(),
        server = (schema === 'https')
            ? https.createServer(config.server.options, app)
            : http.createServer(app),
        listen = util.promisify(server.listen).bind(server),
        io     = socket_io(server)
    ; // const

    app.disable('x-powered-by');

    app.get('/', (request, response) => {
        // TODO
        response.type('txt').send('Hello World!');
    });

    app.post('/inbox', express.json(), (request, response, next) => {
        // TODO
        util.logObject(request.body);
        next();
    });

    // io.on('connection', (socket) => {
    //     // TODO
    // });

    agent.on('event', (...args) => {
        util.logObject(args);
        // debugger;
    }); // agent.on('event')

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

    await listen(port);
    util.logText(`testsuite app is listening at <${schema}://${host}:${port}/>`);

}; // module.exports

// EOF
