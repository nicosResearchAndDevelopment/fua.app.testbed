const
    fs        = require("fs"),
    path      = require('path'),
    //http      = require('https'),
    http      = require('http'),
    express   = require('express'),
    socket_io = require('socket.io'),
    util      = require('@nrd/fua.core.util')
    //ExpressSession = require('express-session')
;

module.exports = ({
                      'agent':  agent,
                      'config': config
                  }) => {

    (async (/* MAIN */) => {
        try {
            const
                ca_cert           = fs.readFileSync(path.join(__dirname, './cert/ca/ca.cert'), 'utf-8'),
                tls_certificates  = require(path.join(__dirname, './cert/tls-server/server.js')),
                options           = {
                    key:  tls_certificates.key,
                    cert: tls_certificates.cert,
                    ca:   ca_cert
                    //,requestCert:        true
                    //,rejectUnauthorized: true
                },
                app               = express(),
                //server            = http.createServer(options, app),
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

            app.use(async (request, response, next) => {
                let
                    error = null,
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

            app.get('/', async (request, response) => {
                //response.redirect('/browse');

                response.send(`${util.timestamp()} : BOB : root:  test`);
            });

            app.get('/about', async (request, response) => {
                //let that = await agent.amec.authenticate(request.headers);
                let about = await agent.selfDescription({'requester_url': "none"});
                response.send(JSON.stringify(about));
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
                    });

                    //server.on('connection', (tlsSocket)=> {
                    //    //console.log(`BOB : tlsSocket.address : ${tlsSocket.address()}`);
                    //
                    //    //debugger;
                    //});
                    //server.on('secureConnect', (tlsSocket)=> {
                    //
                    //    debugger;
                    //});
                    io.on('connection', (socket) => {

                        if (!((config.user[socket.handshake.auth.user]) && (socket.handshake.auth.password === config.user[socket.handshake.auth.user].password)))
                            throw new Error(``);

                        socket_controller = socket;
                        //debugger;
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

                        //socket.on('on_RC_IDLE', (data, callback) => {
                        //    agent.on('idle', callback);
                        //});
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