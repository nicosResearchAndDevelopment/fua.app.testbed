const
    path           = require('path'),
    http           = require('http'),
    express        = require('express'),
    socket_io      = require('socket.io'),
    ExpressSession = require('express-session')
;

function BaseConnector() {

    let
        selfDescriptionFetched          = false,
        selfDescription_timeout_default = 1, // REM : seconds
        about_wait_map                  = new Map(),
        connector                       = {};

    Object.defineProperties(connector, {
        'about':                               {
            value:          Object.defineProperties(async () => {
                try {
                    let
                        requester_url         = "",
                        about_waiter_callback = about_wait_map.get(requester_url)
                    ;

                    if (about_waiter_callback) {
                        about_wait_map.delete(requester_url);
                        about_waiter_callback({'requester_url': requester_url, 'SelfDescriptionFetched': true})
                    } // if ()

                    return {'@type': "ids:SelfDescription"};
                } catch (jex) {
                    throw(jex);
                } // try
            }, {
                'on': {
                    value:         (requester_url, callback) => {
                        about_wait_map.set(requester_url, callback);
                    }, enumerable: false
                }
            }), enumerable: false
        }, // about
        '$rc_getConnectorsSelfDescription':    {
            value:         (param, callback) => {
                try {
                    let result               = {
                        'start':             (new Date).toISOString(),
                        'operationalResult': undefined
                    };
                    result.operationalResult = {'mahl': "zeit"};
                    result.end               = (new Date).toISOString();
                    callback(null, result);
                } catch (jex) {
                    callback(jex, undefined);
                } // try
            }, enumerable: false
        }, // $rc_getConnectorsSelfDescription
        '$rc_connectorSelfDescriptionRequest': {
            value:         (param, callback) => {
                try {

                    let
                        result = {
                            'start':             (new Date).toISOString(),
                            'operationalResult': undefined
                        },
                        semaphore
                    ;

                    if (!param.timeout)
                        param.timeout = selfDescription_timeout_default;

                    connector.about['on'](param.requester_url, (data) => {
                        clearTimeout(semaphore);
                        result.operationalResult = data;
                        result.end               = (new Date).toISOString();
                        callback(null, result);
                    });

                    semaphore = setTimeout(() => {
                        about_wait_map.delete(param.requester_url);
                        callback({'message': `tb.ec.ids.rc : $rc_connectorSelfDescriptionRequest : timeout <${param.timeout}sec> reached.`}, undefined);
                    }, (param.timeout * 1000));

                } catch (jex) {
                    callback(jex, undefined);
                } // try
            }, enumerable: false
        } // $rc_connectorSelfDescriptionRequest
    }); // Object.defineProperties(connector)
    Object.freeze(connector);
    return connector;
}

const
    app       = express(),
    server    = http.createServer(app),
    io        = socket_io(server)
    //express_json = express.json(),
    //sessions     = ExpressSession(config.session)
    ,
    connector = new BaseConnector({
        'app': app
    })
;

try {
    server.listen(8099, (that) => {

        io.on('connection', (socket) => {

            socket.on('getConnectorsSelfDescription', (param, callback) => {
                connector.$rc_getConnectorsSelfDescription(param, callback);
            }); // socket.on('getConnectorsSelfDescription')

            socket.on('connectorSelfDescriptionRequest', (param, callback) => {
                connector.$rc_connectorSelfDescriptionRequest(param, callback);
            }); // socket.on('getConnectorsSelfDescription')
        }); // io_test.on('connection')

    }); // server.listen()

    console.log("t.f.h.s. rulez!");
} catch (jex) {
    throw (jex);
} // try

console.log("t.f.h.s. rulez 22222222222222222!");

//(async (/* MAIN */) => {
//    const
//        app       = express(),
//        server    = http.createServer(app),
//        io        = socket_io(server)
//        //express_json = express.json(),
//        //sessions     = ExpressSession(config.session)
//        ,
//        connector = new BaseConnector({
//            'app': app
//        });
//    try {
//        await new Promise((resolve) => {
//
//            io.on('connection', (socket) => {
//
//                debugger;
//            }); // io_test.on('connection')
//
//            server.listen(8099, (that) => {
//                that;
//                debugger;
//            });
//
//        });
//
//        console.log("t.f.h.s. rulez!");
//    } catch (jex) {
//        throw (jex);
//    } // try
//})(/* MAIN */).catch(console.error);
//
//console.log("t.f.h.s. rulez 22222222222222222!");
