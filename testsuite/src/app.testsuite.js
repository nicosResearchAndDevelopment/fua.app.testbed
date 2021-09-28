const
    path      = require('path'),
    http      = require('http'),
    //
    express   = require('express'),
    socket_io = require('socket.io'),
    //
    util      = require('@nrd/fua.core.util')
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

            //region TEST
            //debugger;
            //endregion TEST

        } catch (err) {
            console.error(err?.stack ?? err);
            debugger;
            process.exit(1);
        } // try
    })(/* MAIN */).catch(console.error);

}; // module.exports

// EOF
