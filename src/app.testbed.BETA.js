const
    path           = require('path'),
    http           = require('http'),
    express        = require('express'),
    //{exec}      = require("child_process"),
    socket_io      = require('socket.io'),
    //config         = require('./config/config.testbed.js'),
    rdf            = require('@nrd/fua.module.rdf'),
    util           = require('@nrd/fua.core.util'),
    testbed        = require('./code/main.testbed.js'),
    ExpressSession = require('express-session'),
    LDPRouter      = require(path.join(util.FUA_JS_LIB, 'impl/ldp/agent.ldp/next/router.ldp.js'))
; // const

module.exports = ({
                      'space':  space = null,
                      'agent':  agent,
                      'config': config
                  }) => {

    (async (/* MAIN */) => {
            try {
                const
                    app          = express(),
                    server       = http.createServer(app),
                    io           = socket_io(server),
                    io_testsuite = io.of('/execute'),

                    express_json = express.json(),
                    sessions     = ExpressSession(config.session);

                let
                    testsuite_socket = null
                    //,
                    //that             = rdf.generateGraph(
                    //    agent.space.dataStore.dataset,
                    //    'minimal'
                    //    //{'compact': true, 'meshed': true, 'blanks': false}
                    //)
                ;

                //const graph = new Map((compactDoc['@graph'] || [compactDoc]).map((node) => [node['@id'], node]));
                //that.get("https://testbed.nicos-rd.com/");

                //let executeTestResult = await agent.executeTest({}).catch((err) => {
                //    err;
                //    //debugger;
                //});

                app.disable('x-powered-by');

                app.use(sessions);

                io.use((socket, next) => sessions(socket.request, socket.request.res, next));

                // REM: uncomment to enable authentication
                //app.use('/login', testbed.createLogin(config.login, amec));
                //app.use('/', (request, response, next) => {
                //    if (request.session.auth) next();
                //    else response.redirect('/login');
                //});

                app.use('/browse', testbed.createBrowser(config.browser));

                config.ldp.space = agent.space;

                app.use([
                    //'/model',
                    '/data'
                ], LDPRouter(config.ldp));

                //region LDN
                app.post('/inbox', express.json(), (request, response, next) => {
                    // TODO
                    console.log(request.body);
                    next();
                });
                //endregion LDN

                //region DAPS
                app.post('/keystore.json', express.json(), (request, response, next) => {
                    // TODO
                    console.log(request.body);
                    next();
                });
                app.post('/token', express.json(), (request, response, next) => {
                    // TODO
                    //agent.DAPS();
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

                io.on('connection', (socket) => {

                    // REM uncomment to enable authentication
                    //if (!socket.request.session.auth) {
                    //    socket.emit('error', 'not authorized');
                    //    socket.disconnect(true);
                    //    return;
                    //}

                    socket.emit('printMessage', {
                        'prov': '[Testbed]',
                        'msg':  'Welcome to NRD-Testbed!'
                    });
                }); // io.on('connection')

                io_testsuite.use(async (socket, next) => {
                    //debugger;

                    let result = await agent.authenticate({
                        Authorization: "Basic " + Buffer.from(`${socket.handshake.auth.user}:${socket.handshake.auth.password}`).toString('base64')
                        // REM : ERROR : Authorization: "Basic " + Buffer.from(`${socket.handshake.auth.user}:${socket.handshake.auth.password + "nix"}`).toString('base64')
                    }, "BasicAuth");

                    if (result) {
                        next();
                    } else {
                        next(new Error(`TODO: not authenticated.`));
                    } // if ()
                });

                io_testsuite.on('connection', (socket) => {

                    agent.testsuite_inbox_socket = socket;

                    socket.on("test", async (token, test, callback) => {
                        token.thread.push(`${util.timestamp()} : TESTBED : urn:tb:app:testsuite_socket:on : test : start`);

                        let
                            ec       = test['ec'],
                            command  = test['command'],
                            param    = test['param']
                        ;
                        token        = ((typeof token === "string") ? {id: token, thread: []} : token);
                        token.thread = (token.thread || []);
                        try {
                            let result = await agent.executeTest({
                                'ec':      ec,
                                'command': command,
                                'param':   param
                            });
                            //token.thread.push(`${util.timestamp()} : TESTBED : app : <tb.app.testsuite_socket.on> : test : before : callback`);
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

                    }); // testsuite_socket.on("test")

                }); // io_testsuite.on('connection')

                agent.on('event', (error, data) => {
                    console.log("app.testbed :: agent : event :: >>>");
                    if (error)
                        console.error(error);
                    console.log(data);
                    console.log("app.testbed :: agent : event :: <<<");
                    if (testsuite_socket) {
                        //debugger;
                        // TODO : streamline
                        testsuite_socket.emit('event', error, data);
                    } // if ()
                }); // agent.on('event')
                agent.on('error', (error) => {
                    console.log("app.testbed :: agent : error :: >>>");
                    console.error(error);
                    console.log("app.testbed :: agent : error :: <<<");
                    if (testsuite_socket) {
                        //debugger;
                        // TODO : streamline
                        testsuite_socket.emit('error', {'error': error});
                    } // if ()
                }); // agent.on('error')
                app.get('/', (request, response) => {
                    response.redirect('/browse');
                });

                await new Promise((resolve) =>
                    server.listen(config.server.port, resolve)
                );

                //region TEST

                //region TEST :: space

                //let
                //    users = await agent.domain.users()
                //;

                //let jlangkau = Buffer.from("jlangkau:marzipan").toString('base64');
                //jlangkau     = "amxhbmdrYXU6bWFyemlwYW4=";

                //let
                //    user  = await agent.domain.authenticate("amxhbmdrYXU6bWFyemlwYW4=", 'BasicAuthentication_Leave'),
                //    group = await agent.domain.groups.get("https://testbed.nicos-rd.com/domain/group#admin"),
                //    is_in = await agent.domain.group.hasMember(group, user)
                //;
                //is_in     = await agent.domain.group.hasMember(group, "http//:unknown_user/");
                //is_in     = await agent.domain.user.memberOf(user, group);

                //endregion TEST :: space

                //region TEST :: IDS

                //region TEST :: IDS :: DAPS
                //
                //// nrd_gbx03
                //user = await agent.domain.users.get("https://testbed.nicos-rd.com/domain/user#11_B9_DE_C7_63_7C_00_B6_A9_32_57_5A_23_01_3F_44_0E_39_02_82_keyid_3B_9B_8E_72_A4_54_05_5A_10_48_E7_C0_33_0B_87_02_BC_57_7C_A4");
                //
                ////const requestToken = DAPS.client.generateReqeustToken();
                //
                //const
                //    {ClientDaps}    = require(path.join(util.FUA_JS_LIB, 'ids/ids.client.daps/src/ids.client.DAPS.beta.js')),
                //    crypto          = require("crypto"),
                //    {client}        = require("C:/fua/DEVL/js/app/nrd-testbed/ec/ids/resources/cert/index.js"),
                //    clientDaps      = new ClientDaps({
                //        'id':          "http://nrd-ids-bc.nicos-rd.com/",
                //        'daps_host':   "http://nrd-daps.nicos-rd.com/",
                //        'private_key': crypto.createPrivateKey(client.private),
                //        'skiaki':      "11_B9_DE_C7_63_7C_00_B6_A9_32_57_5A_23_01_3F_44_0E_39_02_82_keyid_3B_9B_8E_72_A4_54_05_5A_10_48_E7_C0_33_0B_87_02_BC_57_7C_A4".replace(/_/g, ':')
                //    })
                //;
                //let
                //    DATrequestToken = await clientDaps.produceDatRequestToken({
                //        'scope':  "this.is.not.a.scope",
                //        'format': "json"
                //    }),
                //    DAT             = await agent.DAPS.generateDAT(DATrequestToken)
                //;
                //endregion TEST :: IDS :: DAPS

                //region TEST :: IDS :: bc-rc

                //endregion TEST :: IDS :: bc-rc

                //endregion TEST :: IDS
                //region TEST :: executeTest
                // REM : so, coming from testsuite by socket.io
                let test = {
                    'ec':      "ip",
                    'command': "ping",
                    'param':   {
                        'endpoint': "127.0.0.1"
                    }
                };

                //function data_consumer(data) {
                //    console.log(data);
                //    //debugger;
                //}
                if (/** shield */ false) {
                    agent.executeTest({ // REM : connect ALICE
                        'ec':      "ids",
                        'command': "connect",
                        'param':   {
                            'url':  `${exec_cmd_Alice.schema}://${exec_cmd_Alice.host}:${exec_cmd_Alice.port}`,
                            'auth': {
                                'user':     exec_cmd_Alice.user.tb_ec_ids.name,
                                'password': exec_cmd_Alice.user.tb_ec_ids.password
                            }
                        }
                    }).then((result) => {

                        console.log("TEST : app.testbed :: agent.executeTest(connect ALICE).then :: >>>");
                        console.log(result);
                        console.log("TEST : app.testbed :: agent.executeTest(connect ALICE).then :: <<<");

                        //let BPMN_token = {
                        //    id:   "asdf", // REM : this is the thread
                        //    type: ["bpmn:Token"],
                        //    data: { // REM : connect BOB
                        //        'ec':      "ids",
                        //        'command': "connect",
                        //        'param':   {
                        //            'url':   `${exec_cmd_Bob.schema}://${exec_cmd_Bob.host}:${exec_cmd_Bob.port}`,
                        //            'query': {
                        //                'user':     exec_cmd_Bob.user.tb_ec_ids.name,
                        //                'password': exec_cmd_Bob.user.tb_ec_ids.password
                        //            }
                        //        }
                        //    }
                        //};

                        agent.executeTest({ // REM : connect BOB
                            'ec':      "ids",
                            'command': "connect",
                            'param':   {
                                'url':  `${exec_cmd_Bob.schema}://${exec_cmd_Bob.host}:${exec_cmd_Bob.port}`,
                                'auth': {
                                    'user':     exec_cmd_Bob.user.tb_ec_ids.name,
                                    'password': exec_cmd_Bob.user.tb_ec_ids.password
                                }
                            }
                        }).then((result) => {

                            console.log("TEST : app.testbed :: agent.executeTest(connect BOB).then :: >>>");
                            console.log(result);
                            console.log("TEST : app.testbed :: agent.executeTest(connect BOB).then :: <<<");

                            //debugger;
                            //region ec :: ip
                            //agent.executeTest({ // REM : ping
                            //    'ec':      "ip",
                            //    'command': "ping",
                            //    'param':   {
                            //        'endpoint': "127.0.0.1"
                            //    }
                            //}).then((result) => {
                            //    result;
                            //    debugger;
                            //}).catch((error) => {
                            //    error;
                            //    debugger;
                            //});
                            //endregion ec :: ip

                            //region ec :: ids

                            agent.executeTest({ // REM : requestConnectorSelfDescription
                                'comment': "ec.ids : Alice will get Bobs selfDescription",
                                'ec':      "ids",
                                'command': "requestConnectorSelfDescription",
                                'param':   {
                                    //'operator': "simon petrac",
                                    'rc': `${exec_cmd_Alice.schema}://${exec_cmd_Alice.host}:${exec_cmd_Alice.port}`,
                                    // REM : Bob as applicant
                                    'schema': `${exec_cmd_Bob.schema}`,
                                    'host':   exec_cmd_Bob.host,
                                    'path':   `:${exec_cmd_Bob.port}/about`
                                }
                            }).then((result) => {
                                console.log("TEST : app.testbed :: agent.executeTest(requestConnectorSelfDescription).then :: >>>");
                                console.log(result);
                                console.log("TEST : app.testbed :: agent.executeTest(requestConnectorSelfDescription).then :: <<<");
                            }).catch((error) => {
                                console.error(error);
                                debugger;
                            });

                            //agent.executeTest({ // REM : connectorSelfDescriptionRequest
                            //    'ec':      "ids",
                            //    'command': "connectorSelfDescriptionRequest",
                            //    'param':   {
                            //        'requester_url': "https://127.0.0.1:8099/about",
                            //        'timeout':       3 // REM : seconds
                            //    }
                            //}).then((result) => {
                            //    result;
                            //    debugger;
                            //}).catch((error) => {
                            //    error;
                            //    debugger;
                            //});

                            //agent.executeTest({ // REM : getSelfDescriptionFromRC
                            //    'ec':      "ids",
                            //    'command': "getSelfDescriptionFromRC",
                            //    'param':   undefined
                            //}).then((result) => {
                            //    result;
                            //    debugger;
                            //}).catch((error) => {
                            //    error;
                            //    debugger;
                            //});

                            //endregion ec :: ids

                            //    //agent.executeTest({ // REM : on_RC_IDLE
                            //    //    'ec':      "ids",
                            //    //    'command': "on_RC_IDLE",
                            //    //    'param':   undefined
                            //    //}, data_consumer );

                        }).catch((error) => {
                            error;
                            debugger;
                        });

                    }).catch((error) => {
                        debugger;
                        error;
                        //io :: callback(error, undefined);
                    });
                } // if (shield)
                //endregion TEST :: executeTest

                //debugger; // TEST

                //endregion TEST

                console.log('listening at http://localhost:' + config.server.port);

            } catch
                (err) {
                console.error(err?.stack ?? err);
                debugger;
                process.exit(1);
            } // try

        }
    )(/* MAIN */).catch(console.error);

}; // module.exports

// EOF