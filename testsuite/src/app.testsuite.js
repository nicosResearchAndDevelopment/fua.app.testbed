const
    path      = require('path'),
    http      = require('http'),
    //
    express   = require('express'),
    socket_io = require('socket.io'),
    //
    util      = require('@nrd/fua.core.util'),
    uuid      = require('@nrd/fua.core.uuid')
; // const

module.exports = ({
                      //'space':  space = null,
                      'agent':  agent,
                      'config': config
                  }) => {

    (async (/* MAIN */) => {
        try {
            const
                app    = express(),
                server = http.createServer(app),
                io     = socket_io(server)
            ; // const

            app.disable('x-powered-by');

            app.get('/', (request, response) => {
                // TODO
                response.type('txt').send('Hello World!');
            });

            app.post('/inbox', express.json(), (request, response, next) => {
                // TODO
                console.log(request.body);
                next();
            });

            io.on('connection', (socket) => {
                // TODO
            });

            await new Promise((resolve) =>
                server.listen(config.server.port, resolve));

            console.log(`listening at <${config.server.url}>, port <${config.server.port}>`);
            agent.on('event', (event) => {
                //debugger;
                console.log(event);
            }); // agent.on('event')
            agent.on('testbed_socket_connect', async () => {
                //region TEST
                let
                    alice = "http://127.0.0.1:8099/",
                    bob   = {
                        schema: "http",
                        host:   "127.0.0.1",
                        port:   8098
                    },
                    // REM : doesn't work!!!!!!!! (connect NOT present!!!
                    param = {}
                ; // let

                //param = { // REM : connect ALICE
                //    'ec':      "ids",
                //    'command': "getSelfDescriptionFromRC",
                //    'param':   {
                //        'rc': alice
                //    }
                //};
                param = { // REM : ALICE gets BOBs selfDescription
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

                let data;

                data = { // REM :
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
                data = { // REM : ping localhost ALICE
                    'ec':      "ip",
                    'command': "ping",
                    'param':   {
                        'host': "127.0.0.1"
                    }
                };

                let validate = {
                    ec: {
                        ip: {
                            ping: async ({
                                             id:         id,
                                             testResult: testResult
                                         }) => {
                                const
                                    pass = "pass",
                                    fail = "fail"
                                    //notApplicable = "notApplicable"
                                ; // const

                                let result = {
                                    id:   id,
                                    mode: "fail",
                                    fail: {},
                                    pass: {}
                                };
                                if (testResult.isAlive) {
                                    result.mode  = pass;
                                    result[pass] = {};
                                    delete result[fail];
                                } else {
                                    result.mode  = fail;
                                    result[fail] = {};
                                    delete result["pass"];
                                } // if ()
                                return result;
                            }
                        }
                    }
                }; // let

                let test_result;
                try {
                    //let token_test                   = agent.Token({data: data});

                    test_result = /** REM : BPMN.Activity */ await agent.test(agent.Token({data: data}));

                    console.log(JSON.stringify(token_test, "", "\t"));

                    debugger;

                } catch (error) {
                    console.error(error);
                    debugger;
                } // try

                //endregion TEST
            }); // agent.on('testbed_socket_connect')

        } catch (err) {
            console.error(err?.stack ?? err);
            debugger;
            process.exit(1);
        } // try
    })(/* MAIN */).catch(console.error);

}; // module.exports

// EOF
