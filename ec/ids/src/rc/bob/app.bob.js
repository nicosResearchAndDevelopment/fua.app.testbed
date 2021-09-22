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
                app          = express(),
                server       = http.createServer(app),
                io           = socket_io(server)
                ,
                express_json = express.json()
                //sessions     = ExpressSession(config.session)
            ; // const

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
                response.send("test 42");
            });

            app.get('/about', async (request, response) => {
                let about = await agent.selfDescription({'requester_url': "none"});
                response.send(JSON.stringify(about));
            });

            //await new Promise((resolve) =>
            //    server.listen(config.server.port, resolve)
            //);

            try {

                server.listen(config.port, () => {

                    io.on('connection', (socket) => {

                        socket.on('getConnectorsSelfDescription', async (param, callback) => {
                            try {
                                let result = await agent.rc_getConnectorsSelfDescription(param);
                                callback(null, result);
                            } catch (error) {
                                callback(error, undefined);
                            } // try
                        }); // socket.on('getConnectorsSelfDescription')

                        socket.on('connectorSelfDescriptionRequest', (param, callback) => {
                            agent.rc_connectorSelfDescriptionRequest(param, callback);
                        }); // socket.on('getConnectorsSelfDescription')

                        socket.on('getSelfDescriptionFromRC', async (param, callback) => {
                            try {
                                let result = await agent.selfDescription({'requester_url': undefined});
                                callback(null, result);
                            } catch (error) {
                                callback(error, undefined);
                            } // try
                        }); // socket.on('getConnectorsSelfDescription')

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