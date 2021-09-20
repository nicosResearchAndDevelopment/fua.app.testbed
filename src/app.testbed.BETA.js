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
;

module.exports = ({'agent': agent, 'config': config}) => {

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

            app.post('/inbox', express.json(), (request, response, next) => {
                // TODO
                console.log(request.body);
                next();
            });

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
                    //agent.executeTest().then((result) => {
                    //    callback(null, result);
                    //}).catch((err) => {
                    //    callback(err, undefined);
                    //});
                    try {
                        const result = await agent.executeTest({
                            'ec':        ec,
                            'command':   command,
                            'parameter': parameter
                        });
                        callback(null, result);
                    } catch (jex) {
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

            let user = await agent.domain.authenticate("amxhbmdrYXU6bWFyemlwYW4=", 'BasicAuthentication_Leave');

            let group = await agent.domain.groups.get("https://testbed.nicos-rd.com/domain/group#admin");
            let is_in = await agent.domain.group.hasMember(group, user);
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
            const {exec} = require('child_process');
            exec('node ../ec/ids/src/tb.ec.ids.bc-rc.js', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
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

            agent.executeTest({
                'ec':      "ids",
                'command': "connect",
                'param':   {
                    'host': "https://127.0.0.1:8099/"
                }
            }, (error, result) => {
                if (error)
                    throw (error);
                // TODO : route it to testsuite
                //agent.executeTest({
                //    'ec':      "ids",
                //    'command': "getConnectorsSelfDescription",
                //    'param':   {
                //        //'url': "https://127.0.0.1:8099/about"
                //        'url': "https://127.0.0.1:8099"
                //    }
                //}, (error, result) => {
                // debugger;
                //    if (error)
                //        throw (error);
                //    debugger;
                // TODO : route it to testsuite
                //});
                agent.executeTest({
                    'ec':      "ids",
                    'command': "connectorSelfDescriptionRequest",
                    'param':   {
                        'requester_url': "https://127.0.0.1:8099/about"
                    }
                }, (error, result) => {
                    debugger;
                    if (error)
                        throw (error);
                    // TODO : route it to testsuite
                });

            });
            //endregion TEST :: executeTest

            //debugger; // TEST

            //endregion TEST

            console.log('listening at http://localhost:' + config.server.port);

        } catch (err) {
            console.error(err?.stack ?? err);
            debugger;
            process.exit(1);
        } // try

    })(/* MAIN */).catch(console.error);

};