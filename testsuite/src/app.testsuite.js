const
    path      = require('path'),
    http      = require('http'),
    express   = require('express'),
    socket_io = require('socket.io'),
    config    = require('./config/config.testsuite.js'),
    util      = require('@nrd/fua.core.util'),
    assert    = new util.Assert('nrd-testsuite');

(async (/* MAIN */) => {
    try {
        const
            app    = express(),
            server = http.createServer(app),
            io     = socket_io(server);

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

        console.log('listening at http://localhost:' + config.server.port);

    } catch (err) {
        console.error(err?.stack ?? err);
        debugger;
        process.exit(1);
    } // try
})(/* MAIN */).catch(console.error);