const
    path           = require('path'),
    http           = require('http'),
    express        = require('express'),
    socket_io      = require('socket.io'),
    //config         = require('./config/config.testbed.js'),
    rdf            = require('@nrd/fua.module.rdf'),
    util           = require('@nrd/fua.core.util'),
    testbed        = require('./code/main.testbed.js'),
    ExpressSession = require('express-session'),
    LDPRouter      = require(path.join(util.FUA_JS_LIB, 'impl/ldp/agent.ldp/next/router.ldp.js'))
;const {exec}      = require("child_process");

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
                    io_test      = io.of('/test'),
                    io_rc        = io.of('/rc'),
                    express_json = express.json(),
                    sessions     = ExpressSession(config.session);

                let that = rdf.generateGraph(
                    agent.space.dataStore.dataset,
                    'minimal'
                    //{'compact': true, 'meshed': true, 'blanks': false}
                );

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

                io_test.on('connection', (socket) => {

                    socket.on("execute", async (request, callback) => {
                        let
                            ec        = request['ec'],
                            command   = request['command'],
                            parameter = request['parameter']
                        ;
                        try {
                            const result = await agent.executeTest({
                                'ec':        ec,
                                'command':   command,
                                'parameter': parameter
                            });
                            callback(null, result);
                        } catch (jex) {
                            // TODO : transform new Errors !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                            callback(jex, undefined);
                        } // try
                    }); // socket.on("execute")

                }); // io_test.on('connection')

                app.get('/', (request, response) => {
                    response.redirect('/browse');
                });

                await new Promise((resolve) =>
                    server.listen(config.server.port, resolve)
                );

                //region TEST

                //region TEST :: space

                let
                    users = await agent.domain.users()
                ;

                //let jlangkau = Buffer.from("jlangkau:marzipan").toString('base64');
                //jlangkau     = "amxhbmdrYXU6bWFyemlwYW4=";

                let
                    user  = await agent.domain.authenticate("amxhbmdrYXU6bWFyemlwYW4=", 'BasicAuthentication_Leave'),
                    group = await agent.domain.groups.get("https://testbed.nicos-rd.com/domain/group#admin"),
                    is_in = await agent.domain.group.hasMember(group, user)
                ;
                is_in     = await agent.domain.group.hasMember(group, "http//:unknown_user/");
                is_in     = await agent.domain.user.memberOf(user, group);

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
                const
                    {exec}     = require('child_process'),
                    node_alice = space.getNode("https://alice.nicos-rd.com/"),
                    node_bob   = space.getNode("https://bob.nicos-rd.com/")
                ;

                await node_alice.read();
                await node_bob.read();

                let

                    exec_cmd,
                    exec_cmd_Alice = {
                        'id':     "https://alice.nicos-rd.com/",
                        'schema': "http",
                        'host':   "127.0.0.1",
                        //'port':   8099,
                        'port': parseInt(node_alice['fua:port'][0]['@value']),
                        // TODO: SKIAKI
                        'SKIAKI': "11:B9:DE:C7:63:7C:00:B6:A9:32:57:5A:23:01:3F:44:0E:39:02:82:keyid:3B:9B:8E:72:A4:54:05:5A:10:48:E7:C0:33:0B:87:02:BC:57:7C:A4",
                        //
                        'user': {
                            'tb_ec_ids': {'name': "tb_ec_ids", 'password': "marzipan"}
                        },
                        //
                        'idle_timeout': 5,
                        //
                        'DAPS':        {
                            'default':                           "https://nrd-dps.nicos-rd.com:8082/",
                            'https://nrd-dps.nicos-rd.com:8082': "https://nrd-dps.nicos-rd.com:8082/"
                        },
                        'cert_client': "C:/fua/DEVL/js/app/nrd-testbed/ec/ids/resources/cert/index.js"
                    },
                    exec_cmd_Bob   = {
                        'id': "https://bob.nicos-rd.com/",
                        //
                        'schema': "http",
                        'host':   "127.0.0.1",
                        'port':   parseInt(node_bob['fua:port'][0]['@value']),
                        // TODO: SKIAKI
                        'SKIAKI': "11:B9:DE:C7:63:7C:00:B6:A9:32:57:5A:23:01:3F:44:0E:39:02:82:keyid:3B:9B:8E:72:A4:54:05:5A:10:48:E7:C0:33:0B:87:02:BC:57:7C:A4",
                        //
                        'user': {
                            "tb_ec_ids": {'name': "tb_ec_ids", 'password': "marzipan"}
                        },
                        //
                        'idle_timeout': 5,
                        //
                        'DAPS':        {
                            'default':                           "https://nrd-dps.nicos-rd.com:8082/",
                            'https://nrd-dps.nicos-rd.com:8082': "https://nrd-dps.nicos-rd.com:8082/"
                        },
                        'cert_client': "C:/fua/DEVL/js/app/nrd-testbed/ec/ids/resources/cert/index.js"
                    }
                ;
                //exec_cmd           = `node ../ec/ids/src/tb.ec.ids.bc-rc.js idle_timeout=${exec_cmd_Alice.idle_timeout} port=${exec_cmd_Alice.port} daps_default="${exec_cmd_Alice.daps_default}" privateKey="${exec_cmd_Alice.privateKey}"`
                //exec_cmd           =
                //exec_cmd           = `node ../ec/ids/src/rc/alice/launch.alice.js config=${Buffer.from(JSON.stringify({'ge':"nau"})).toString('base64')}"`

                const ALICE_PROC = exec(
                    `node ../ec/ids/src/rc/alice/launch.alice.js config=${Buffer.from(JSON.stringify(exec_cmd_Alice)).toString('base64')}"`,
                    (error, stdout, stderr) => {
                        if (error) {
                            console.error(`exec error: ${error}`);
                            return;
                        } // error
                        console.log(`stdout: ${stdout}`);
                        console.error(`stderr: ${stderr}`);
                    });
                //ALICE_PROC.stderr.on('data', (data) => {
                //    console.warn(`ALICE_PROC : ${data}`);
                //});

                //exec_cmd       =
                const BOB_PROC = exec(
                    `node ../ec/ids/src/rc/bob/launch.bob.js config=${Buffer.from(JSON.stringify(exec_cmd_Bob)).toString('base64')}"`,
                    (error, stdout, stderr) => {
                        if (error) {
                            console.error(`exec error: ${error}`);
                            return;
                        } // error
                        console.log(`stdout: ${stdout}`);
                        console.error(`stderr: ${stderr}`);
                    });
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

                function data_consumer(data) {
                    console.log(data);
                    //debugger;
                }

                agent.executeTest({
                    'ec':      "ids",
                    'command': "connect",
                    'param':   {
                        'url':   `${exec_cmd_Alice.schema}://${exec_cmd_Alice.host}:${exec_cmd_Alice.port}`,
                        'query': {
                            'user':     exec_cmd_Alice.user.tb_ec_ids.name,
                            'password': exec_cmd_Alice.user.tb_ec_ids.password
                        }
                    }
                }).then((result) => {

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

                    agent.executeTest({ // REM : getConnectorsSelfDescription
                        'comment': "ec.ids : Alice will get Bobs selfDecription",
                        'ec':      "ids",
                        'command': "getConnectorsSelfDescription",
                        'param':   {
                            'operator': "simon petrac",
                            'rc':       `${exec_cmd_Alice.schema}://${exec_cmd_Alice.host}:${exec_cmd_Alice.port}`,
                            // REM : Bob as applicant
                            'schema': `${exec_cmd_Bob.schema}://`,
                            'host':   exec_cmd_Bob.host,
                            'path':   `:${exec_cmd_Bob.port}/about`
                        }
                    }).then((result) => {
                        console.log(result);
                        debugger;
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
                    debugger;
                    error;
                    //io :: callback(error, undefined);
                });

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
    )
    (/* MAIN */).catch(console.error);

};