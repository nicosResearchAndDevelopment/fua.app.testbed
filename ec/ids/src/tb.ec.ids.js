const
    EventEmitter  = require('events'),
    fetch         = require("node-fetch"),
    {exec}        = require("child_process"),
    //
    util          = require('@nrd/fua.core.util'),
    //
    io_client     = require("socket.io-client"),
    _default_uri_ = "urn:tb:ec:ids:"
;
let
    _uri_         = _default_uri_,
    ec            = undefined,
    socket        = undefined,
    emit          = undefined,
    connected     = false,
    //ec           = {}
    ec_ids        = new EventEmitter(),
    rc            = new Map(),
    ALICE_PROC    = null,
    BOB_PROC      = null
;

//region fn
function randomLeave(pre) {
    return `${pre}${(new Date).valueOf()}_${Math.floor(Math.random() * 100000)}_${Math.floor(Math.random() * 100000)}`;
}

//endregion fn

module.exports = ({
                      'uri':   uri = undefined,
                      'ALICE': ALICE = undefined,
                      'BOB':   BOB = undefined
                  }) => {


    _uri_ = (uri || _default_uri_);

    if (ALICE) {
        ALICE_PROC = exec(
            `node ../ec/ids/src/rc/alice/launch.alice.js config=${Buffer.from(JSON.stringify(ALICE)).toString('base64')}"`,
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                } // error
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
            });
        let url = `${ALICE.schema}://${ALICE.host}:${ALICE.port}/`;
        let options    = {
            reconnect:          true,
            rejectUnauthorized: false,
            auth:               {
                user:     ALICE.user['tb_ec_ids'].name,
                password: ALICE.user['tb_ec_ids'].password
            }
        };

        let alice_socket = io_client.connect(url, options);

        alice_socket.on('connect', () => {
            alice_socket.on('event', (error, data) => {
                ec_ids.emit('event', error, data);
                //debugger;
            });
            rc.set(url, util.promisify(alice_socket.emit).bind(alice_socket));
        }); // socket.on('connect')
        alice_socket.on('error', (args) => {
            //TODO:
            debugger;
        }); // socket.on('error')

    } // if (ALICE)

    if (BOB) {
        BOB_PROC = exec(
            `node ../ec/ids/src/rc/bob/launch.bob.js config=${Buffer.from(JSON.stringify(BOB)).toString('base64')}"`,
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                } // error
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
            });
        let url = `${BOB.schema}://${BOB.host}:${BOB.port}/`;
        let options    = {
            reconnect:          true,
            rejectUnauthorized: false,
            auth:               {
                user:     BOB.user['tb_ec_ids'].name,
                password: BOB.user['tb_ec_ids'].password
            }
        };

        let bob_socket = io_client.connect(url, options);

        bob_socket.on('connect', () => {
            bob_socket.on('event', (error, data) => {
                ec_ids.emit('event', error, data);
                //debugger;
            });
            rc.set(url, util.promisify(bob_socket.emit).bind(bob_socket));
        }); // socket.on('connect')
        bob_socket.on('error', (args) => {
            //TODO:
            debugger;
        }); // socket.on('error')
    } // if (BOB)

    Object.defineProperties(ec_ids, {
        'uri':                             {
            set:          (uri) => {
                if (_uri_ === _default_uri_)
                    _uri_ = uri;
            },
            get:          () => {
                return _uri_
            }
            , enumerable: false
        },
        'ec':                              {
            set:          (ecoSystem) => {
                if (!ec)
                    ec = ecoSystem;
            }
            , enumerable: false
        },
        //'connect':                         {
        //    value:         async (param) => {
        //        let
        //            result  = {
        //                'id':                `${randomLeave(`${_uri_}connect/`)}`,
        //                'thread':            param.thread,
        //                'start':             (new Date).toISOString(),
        //                'operationalResult': false
        //            },
        //            options = {
        //                'reconnect':          true,
        //                'rejectUnauthorized': false
        //            }
        //        ; // let
        //
        //        if (param.auth)
        //            options['auth'] = param.auth;
        //
        //        socket = io_client.connect(param.url, options);
        //
        //        //await new Promise((resolve, reject) => {
        //        await new Promise((resolve, reject) => {
        //            socket.on('connect', (args) => {
        //                socket.on('event', (error, data) => {
        //                    ec_ids.emit('event', error, data);
        //                    //debugger;
        //                });
        //                rc.set(param.url, util.promisify(socket.emit).bind(socket));
        //                resolve();
        //            }); // socket.on('connect')
        //            socket.on('error', (args) => {
        //                reject(args);
        //            }); // socket.on('error')
        //        }); // await new Promise()
        //
        //        result.end               = (new Date).toISOString();
        //        result.operationalResult = {'url': param.url, 'connected': true};
        //        connected                = true;
        //
        //        return result;
        //
        //    }, enumerable: false
        //}, // connect
        'selfTest':                        {
            value:         async (param) => {
                try {
                    if (!connected && socket)
                        throw(new Error(`tb.ec.ids : selfTest : io NOT connected.`));

                    let result;
                    // TODO : selfTest
                    return result;
                } catch (jex) {
                    ec_ids.emit('error', jex);
                    throw(jex);
                } // try
            }, enumerable: false
        }, // getConnectorsSelfDescription
        'requestConnectorSelfDescription': {
            value:         async (param) => {
                try {
                    if (!connected && socket)
                        throw(new Error(`tb.ec.ids : requestConnectorSelfDescription : io NOT connected.`));

                    let result;

                    //let result = await ec.ip.ping({'host': param.host});
                    //
                    //if (!result.operationalResult.alive)
                    //    throw(new Error(`tb.ec.ids : requestConnectorSelfDescription : connector NOT alive`));

                    result = await rc.get(param.rc)('rc_requestConnectorSelfDescription', param);
                    //throw (new Error()); // TEST : only
                    return result;
                } catch (jex) {
                    ec_ids.emit('error', jex);
                    throw(jex);
                } // try
            }, enumerable: false
        }, // getConnectorsSelfDescription
        'waitForSelfDescriptionRequest':   {
            value:         async (param) => {
                try {
                    if (!connected && socket)
                        throw(new Error(`tb.ec.ids : waitForSelfDescriptionRequest : io NOT connected.`));
                    const result = await rc.get(param.rc)('rc_waitForSelfDescriptionRequest', param);
                    return result;
                } catch (jex) {
                    ec_ids.emit('error', jex);
                    throw(jex);
                } // try
            }, enumerable: false
        }, // waitForSelfDescriptionRequest
        'getSelfDescriptionFromRC':        {
            value:         async (param) => {
                try {
                    if (!connected && socket)
                        throw(new Error(`tb.ec.ids : getSelfDescriptionFromRC : io NOT connected.`));
                    const result = await rc.get(param.rc)('rc_getSelfDescriptionFromRC', param);
                    return result;
                } catch (jex) {
                    ec_ids.emit('error', jex);
                    throw(jex);
                } // try
            }, enumerable: false
        } // getSelfDescriptionFromRC

    });
    return ec_ids;
}; // module.exports

//
//Object.defineProperties(ec_ids, {
//    'uri':                             {
//        set:          (uri) => {
//            if (_uri_ === _default_uri_)
//                _uri_ = uri;
//        },
//        get:          () => {
//            return _uri_
//        }
//        , enumerable: false
//    },
//    'ec':                              {
//        set:          (ecoSystem) => {
//            if (!ec)
//                ec = ecoSystem;
//        }
//        , enumerable: false
//    },
//    'connect':                         {
//        value:         async (param) => {
//            let
//                result  = {
//                    'id':                `${randomLeave(`${_uri_}connect/`)}`,
//                    'thread':            param.thread,
//                    'start':             (new Date).toISOString(),
//                    'operationalResult': false
//                },
//                options = {
//                    'reconnect':          true,
//                    'rejectUnauthorized': false
//                }
//            ; // let
//
//            if (param.auth)
//                options['auth'] = param.auth;
//
//            socket = io_bc_rc.connect(param.url, options);
//
//            //await new Promise((resolve, reject) => {
//            await new Promise((resolve, reject) => {
//                socket.on('connect', (args) => {
//                    socket.on('event', (error, data) => {
//                        ec_ids.emit('event', error, data);
//                        //debugger;
//                    });
//                    rc.set(param.url, util.promisify(socket.emit).bind(socket));
//                    resolve();
//                }); // socket.on('connect')
//                socket.on('error', (args) => {
//                    reject(args);
//                }); // socket.on('error')
//            }); // await new Promise()
//
//            result.end               = (new Date).toISOString();
//            result.operationalResult = {'url': param.url, 'connected': true};
//            connected                = true;
//
//            return result;
//
//        }, enumerable: false
//    }, // connect
//    'selfTest':                        {
//        value:         async (param) => {
//            try {
//                if (!connected && socket)
//                    throw(new Error(`tb.ec.ids : selfTest : io NOT connected.`));
//
//                let result;
//                // TODO : selfTest
//                return result;
//            } catch (jex) {
//                ec_ids.emit('error', jex);
//                throw(jex);
//            } // try
//        }, enumerable: false
//    }, // getConnectorsSelfDescription
//    'requestConnectorSelfDescription': {
//        value:         async (param) => {
//            try {
//                if (!connected && socket)
//                    throw(new Error(`tb.ec.ids : requestConnectorSelfDescription : io NOT connected.`));
//
//                let result;
//
//                //let result = await ec.ip.ping({'host': param.host});
//                //
//                //if (!result.operationalResult.alive)
//                //    throw(new Error(`tb.ec.ids : requestConnectorSelfDescription : connector NOT alive`));
//
//                result = await rc.get(param.rc)('rc_requestConnectorSelfDescription', param);
//                //throw (new Error()); // TEST : only
//                return result;
//            } catch (jex) {
//                ec_ids.emit('error', jex);
//                throw(jex);
//            } // try
//        }, enumerable: false
//    }, // getConnectorsSelfDescription
//    'waitForSelfDescriptionRequest':   {
//        value:         async (param) => {
//            try {
//                if (!connected && socket)
//                    throw(new Error(`tb.ec.ids : waitForSelfDescriptionRequest : io NOT connected.`));
//                const result = await rc.get(param.rc)('rc_waitForSelfDescriptionRequest', param);
//                return result;
//            } catch (jex) {
//                ec_ids.emit('error', jex);
//                throw(jex);
//            } // try
//        }, enumerable: false
//    }, // waitForSelfDescriptionRequest
//    'getSelfDescriptionFromRC':        {
//        value:         async (param) => {
//            try {
//                if (!connected && socket)
//                    throw(new Error(`tb.ec.ids : getSelfDescriptionFromRC : io NOT connected.`));
//                const result = await rc.get(param.rc)('rc_getSelfDescriptionFromRC', param);
//                return result;
//            } catch (jex) {
//                ec_ids.emit('error', jex);
//                throw(jex);
//            } // try
//        }, enumerable: false
//    } // getSelfDescriptionFromRC
//
//});

//exports.ids = ec_ids;

// EOF