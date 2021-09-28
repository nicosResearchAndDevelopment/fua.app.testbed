const
    path      = require('path'),
    http      = require('http'),
    express   = require('express'),
    socket_io = require('socket.io'),
    util      = require('@nrd/fua.core.util')
    //ExpressSession = require('express-session')
; // const

module.exports = ({
                      'agent':  agent,
                      'config': config
                  }) => {

    (async (/* MAIN */) => {
        try {
            const
                app               = express(),
                server            = http.createServer(app),
                io                = socket_io(server)
                ,
                express_json      = express.json()
                //sessions     = ExpressSession(config.session)
            ; // const
            let
                socket_controller = null
            ;
            app.disable('x-powered-by');

            //app.use(sessions);

            //io.use((socket, next) => sessions(socket.request, socket.request.res, next));

            app.post('/inbox', express.json(), (request, response, next) => {
                // TODO
                console.log(request.body);
                next();
            });

            app.get('/', (request, response) => {
                //response.redirect('/browse');
                response.send("ALICE : test");
            });

            //await new Promise((resolve) =>
            //    server.listen(config.server.port, resolve)
            //);

            try {
                server.listen(config.port, () => {

                    agent.on('event', (error, data) => {
                        if (socket_controller) {
                            if (error)
                                socket_controller.emit('event', error, undefined);
                            socket_controller.emit('event', null, data);
                        } // if ()
                    }); // agent.on('event')

                    io.on('connection', (socket) => {

                        if (!((config.user[socket.handshake.auth.user]) && (socket.handshake.auth.password === config.user[socket.handshake.auth.user].password)))
                            throw new Error(``);

                        socket_controller = socket;
                        //debugger;
                        socket_controller.on('rc_requestConnectorSelfDescription', async (param, callback) => {
                            try {
                                let result = await agent.rc_requestConnectorSelfDescription(param);
                                callback(null, result);
                            } catch (error) {
                                callback(error, undefined);
                            } // try
                        }); // socket.on('rc_requestConnectorSelfDescription')

                        socket_controller.on('rc_connectorSelfDescriptionRequest', (param, callback) => {
                            agent.rc_connectorSelfDescriptionRequest(param, callback);
                        }); // socket.on('rc_requestConnectorSelfDescription')

                        socket_controller.on('rc_getSelfDescriptionFromRC', async (param, callback) => {
                            try {
                                let result = await agent.selfDescription({'requester_url': undefined});
                                callback(null, result);
                            } catch (error) {
                                callback(error, undefined);
                            } // try
                        }); // socket.on('rc_getSelfDescriptionFromRC')

                    }); // io.on('connection')

                }); // server.listen()

            } catch (jex) {
                debugger;
                throw (jex);
            } // try

        } catch (err) {
            console.error(err?.stack ?? err);
            debugger;
            process.exit(1);
        } // try

    })(/* MAIN */).catch(console.error);

}; // module.exports

// EOF