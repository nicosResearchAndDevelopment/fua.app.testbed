const
    path           = require('path'),
    http           = require('http'),
    express        = require('express'),
    socket_io      = require('socket.io'),
    //config         = require('./config/config.testbed.js'),
    rdf         = require('@nrd/fua.module.rdf'),
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
                express_json = express.json(),
                sessions     = ExpressSession(config.session);

            let that = rdf.generateGraph(agent.space.dataStore.dataset);

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

};