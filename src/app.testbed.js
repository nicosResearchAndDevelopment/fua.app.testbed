const
    path      = require('path'),
    http      = require('http'),
    express   = require('express'),
    socket_io = require('socket.io'),
    config    = require('./config/config.testbed.js'),
    util      = require('@nrd/fua.core.util'),
    testbed   = require('./code/main.testbed.js');

(async (/* MAIN */) => {
    try {
        const
            app          = express(),
            server       = http.createServer(app),
            io           = socket_io(server),
            express_json = express.json();

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
            // TODO
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