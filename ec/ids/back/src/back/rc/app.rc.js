const
    fs        = require("fs"),
    path      = require('path'),
    express   = require('express'),
    socket_io = require('socket.io'),
    util      = require('@nrd/fua.core.util')
; // const

module.exports = ({
                      'agent':  agent,
                      'config': config
                  }) => {

    const
        http = require(config.schema)
    ;

    (async (/* MAIN */) => {
        try {

            const
                app               = express(),
                server            = ((config.schema === "http") ? http.createServer(app) : http.createServer(config.server_options, app)),
                io                = socket_io(server)
                ,
                express_json      = express.json()
            ; // const
            let
                socket_controller = null
            ;

            //server.on('secureConnection', (that) => {
            //    //debugger;
            //});

            app.disable('x-powered-by');

            //app.use(sessions);

            //io.use((socket, next) => sessions(socket.request, socket.request.res, next));

            app.use(async (request, response, next) => {
                let
                    error        = null,
                    headers,
                    content_type = "multipart",
                    that
                ;
                //switch(content_type) {
                //    case "multipart":
                //        headers = {};
                //        break;
                //    case "......url_encoded.....":
                //        // REM : WEB_FRONT_END
                //        break;
                //    default: // REM : called REST
                //        headers = request.headers;
                //        break;
                //} // switch()
                //
                //that = await agent.amec.authenticate(headers);
                //
                //if (!that)
                //    error = new Error(``);
                next(error);
            }); // app.use()

            app.post('/inbox', express.json(), (request, response, next) => {
                // TODO
                console.log(request.body);
                next();
            });

            app.get('/', (request, response) => {
                //response.redirect('/browse');
                response.send(`${util.utcDateTime()} : ${config.name} : root:  test`);
            });

            app.get('/about', async (request, response) => {
                //let that = await agent.amec.authenticate(request.headers);
                let about = await agent.selfDescription({'requester_url': "none"});
                response.send(JSON.stringify(about));
            });

            try {
                server.listen(config.port, () => {

                    agent.on('event', (error, data) => {
                        if (socket_controller) {
                            if (error)
                                socket_controller.emit('event', error, undefined);
                            socket_controller.emit('event', null, data);
                        } // if ()
                    }); // agent.on('event')

                    //server.on('connection', (tlsSocket)=> {
                    //    console.log(`ALICE : tlsSocket.address() : ${tlsSocket.address()}`);
                    //    console.log(`ALICE : tlsSocket.authorizationError : ${tlsSocket.address()}`);
                    //
                    //    debugger;
                    //});
                    //server.on('secureConnection', (tlsSocket)=> {
                    //
                    //    debugger;
                    //});
                    io.on('connection', (socket) => {

                        if (!((config.user[socket.handshake.auth.user]) && (socket.handshake.auth.password === config.user[socket.handshake.auth.user].password)))
                            throw new Error(``);

                        socket_controller = socket;

                        socket_controller.on('rc_refreshDAT', async (param, callback) => {
                            try {
                                let result = await agent.rc_refreshDAT(param);
                                callback(null, result);
                            } catch (error) {
                                callback(error, undefined);
                            } // try
                        }); // socket.on('rc_refreshDAT')

                        socket_controller.on('rc_requestApplicantsSelfDescription', async (param, callback) => {
                            try {
                                let result = await agent.rc_requestApplicantsSelfDescription(param);
                                callback(null, result);
                            } catch (error) {
                                callback(error, undefined);
                            } // try
                        }); // socket.on('rc_requestApplicantsSelfDescription')

                        socket_controller.on('rc_waitForApplicantsSelfDescriptionRequest', (param, callback) => {
                            agent.rc_waitForApplicantsSelfDescriptionRequest(param, (error, data) => {
                                callback(error, data);
                            });
                        }); // socket.on('rc_waitForApplicantsSelfDescriptionRequest')

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
