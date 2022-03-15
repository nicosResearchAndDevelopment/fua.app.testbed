const
    path           = require('path'),
    http           = require('http'),
    express        = require('express'),
    socket_io      = require('socket.io'),
    config         = require('./config/config.testbed.js'),
    util           = require('@nrd/fua.core.util'),
    testbed        = require('./code/main.testbed.js'),
    ExpressSession = require('express-session'),
    LDPRouter      = require(path.join(util.FUA_JS_LIB, 'impl/ldp/agent.ldp/next/router.ldp.js')),
    amec           = require(path.join(util.FUA_JS_LIB, 'agent.amec/src/agent.amec.next.js'))

    //

;

//region new style
// TODO: get schemata
// TODO: get agents (testbed) data
const
    testbed_app             = {
        '@context':    [],
        '@id':         "http://testbed.nicos-rd.com/app/",
        '@type':       "http_//www.nicos-rd.com/fua/testbed#TestbedApp",
        'owner':       "http://www.nicos-rd.com",
        'domainOwner': "http://www.nicos-rd.com/DOMAIN/owner/",
        'systemOwner': "http://www.nicos-rd.com/SYSTEM/owner/",
        'agent':       undefined, // REM : will be set later...
        'service':     null
    }, // testbed_app
    testbed_scheduler       = {
        '@id':   "http://testbed.nicos-rd.com/scheduler/",
        '@type': "http://www.nicos-rd.com/fua/agent/scheduler#Scheduler",
        'owner': {
            '@id':   testbed_app.systemOwner,
            '@type': "foaf:Agent"
        },
        // TODO : hier könnte man vielleicht auch duration "PT1.42S" gehen?!?
        'idle_emit_threshold': {'@type': "xsd:decimal", '@value': /** seconds */ 1.0},
        'hasTRS':              "http://dbpedia.org/resource/Unix_time"
    }, // testbed_scheduler
    testbed_system          = {
        '@id':       "http://testbed.nicos-rd.com/system/",
        '@type':     "http://www.nicos-rd.com/fua/agent/System#Device",
        'owner':     {
            '@id':   testbed_app.systemOwner,
            '@type': "foaf:Agent"
        },
        'time':      {
            '@type':  "fua.agent.Time",
            'hasTRS': "http://dbpedia.org/resource/Unix_time"
        },
        'lifecycle': {
            '@type':             "time:Instant",
            'time:hasBeginning': {
                '@type':                   "time:Instant",
                'time:inXSDDateTimeStamp': "2019-12-14T12:35:25.047Z"
            }
        }
    }, // testbed_system
    testbed_domain          = {
        '@id':         "http://testbed.nicos-rd.com/domain/",
        'owner':       {
            '@id':   testbed_app.domainOwner,
            '@type': "foaf:Agent"
        },
        'users':       { // REM: as ldp:BasicContainer
            '@id': "http://testbed.nicos-rd.com/domain/users/"
        },
        'groups':      { // REM: as ldp:BasicContainer
            '@id': "http://testbed.nicos-rd.com/domain/groups/"
        },
        'roles':       { // REM: as ldp:BasicContainer
            '@id': "http://testbed.nicos-rd.com/domain/roles/"
        },
        'memberships': { // REM: as ldp:BasicContainer
            '@id': "http://testbed.nicos-rd.com/domain/memberships/"
        },
        'credentials': { // REM: as ldp:BasicContainer
            '@id': "http://testbed.nicos-rd.com/domain/credentials/"
        }
    }, // testbed_domain
    testbed_agent_testsuite = { // REM: as agent
        '@id': "http://testbed.nicos-rd.com/testsuite/",
        // REM: when testsuite will be stand alone in the future, it will serve its very own domain...
        'domain': "set by testbed (so we'll take 'testbed.domain')"
    }, // testbed_testsuite
    testbed_agent_node      = { // REM: ...is coming from generated graph.
        '@id':       "http://testbed.nicos-rd.com/agent/",
        'owner':     {
            '@id': testbed_app.owner
        },
        'holder':    testbed_app,
        'scheduler': testbed_scheduler,
        'system':    testbed_system,
        'domain':    testbed_domain,
        'testsuite': testbed_agent_testsuite
    }, // agent_node
    {TestbedAgent}          = require('./code/agent.Testbed.beta.js'),// REM: as agent
    // REM: agent (agent-testbed) will be put under all services (like http, gRPC, graphQL)
    testbed_agent_util      = {
        'contextHasPrefix': function ({'context': context, 'prefix': prefix}) {
            // TODO : context is array?
            let result = false;
            for (let i = 0; ((!result) && (i < context.length)); i++) {
                result = ((context[i][prefix]) ? true : false)
            } // for (i)
            return result;
        },
        'idAsBlankNode':    function (namespace = "") {
            //return `_:${(new Date).valueOf()}_${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
            return `_:${namespace}${testbed_agent_util['randomLeaveId']()}`;
        },
        'randomLeaveId':    function () {
            return `${(new Date).valueOf()}_${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
        }
    },
    testbed_agent_context   = [],
    testbed_agent           = new TestbedAgent({
        'id':        testbed_agent_node['@id'],
        'scheduler': testbed_scheduler,
        'system':    testbed_system,
        'domain':    testbed_domain
    }), // new TestbedAgent()
    {Testsuite}             = require('./code/agent.Testsuite.js'), // REM: as agent
    testsuite_agent         = new Testsuite({
        'id':        testbed_agent_testsuite['@id'],
        'system':    testbed_agent.system,
        'scheduler': testbed_agent.scheduler,
        'testbed':   testbed_agent
    }) // new Testsuite()
;
testbed_app['agent']        = testbed_agent;

//region new style :: TEST
(async (/* TEST */) => {
    //let
    //    testbed_agent_presentation = await testbed_app['agent']()
    //;
    testbed_agent;

    let
        scheduler_status   = testbed_agent.scheduler.status,
        scheduler_isProper = testbed_agent.scheduler.isProper
    ;
    debugger;
})(/* TEST */).catch(console.error);
//endregion new style :: TEST
//endregion new style

const
    // TODO build a proper agent amec with a concise api
    tmp_users = new Map([
        ["test@test", "test"],
        ["spetrac@marzipan.com", "password123"],
        ["jlangkau@marzipan.com", "@8mT7Q@SPHvB6sYvy*M3"]
    ]);

amec.authMechanism('login', async function (request) {
    // 1. get identification data
    const
        user     = request.body?.user,
        password = request.body?.password;

    // 2. reject invalid authentication
    if (!user || !password) return null;
    if (!tmp_users.has(user)) return null;
    if (password !== tmp_users.get(user)) return null;

    // 3. return auth on success
    return {user};
});

amec.authMechanism('login-tfa', async function (request) {
    // 1. get identification data
    const
        user     = request.body?.user,
        password = request.body?.password,
        tfa      = request.body?.tfa;

    // 2. reject invalid authentication
    if (!user || !password || !tfa) return null;
    if (!tmp_users.has(user)) return null;
    if (tfa.replace(/\D/g, '') !== request.session.tfa) return null;
    if (password !== tmp_users.get(user)) return null;

    // 3. return auth on success
    return {user};
});

(async (/* MAIN */) => {
    try {
        const
            space        = await testbed.createSpace(config.space),
            app          = express(),
            server       = http.createServer(app),
            io           = socket_io(server),
            express_json = express.json(),
            sessions     = ExpressSession(config.session);

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

        config.ldp.space = space;

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
        for (let [ecName, ec] of Object.entries(testbed.ecosystems)) {
            for (let [fnName, fn] of Object.entries(ec.fn)) {
                testbed.assert(util.isFunction(fn), `expected ${ecName}->${fnName} to be a function`);
                const route = `/${ecName}/${fnName}`;
                app.post(route, express_json, async function (request, response, next) {
                    try {
                        const
                            param   = request.body,
                            args    = [param], // TODO parameter mapping
                            result  = await fn.apply(null, args),
                            payload = JSON.stringify(result); // TODO result mapping
                        response.type('json').send(payload);
                    } catch (err) {
                        next(err);
                    }
                });
            }
        }

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
        });

        app.get('/', (request, response) => {
            response.redirect('/browse');
        });

        await new Promise((resolve) =>
            server.listen(config.server.port, resolve));

        console.log('listening at http://localhost:' + config.server.port);

    } catch (err) {
        console.error(err?.stack ?? err);
        debugger;
        process.exit(1);
    } // try
})(/* MAIN */).catch(console.error);