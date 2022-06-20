const
    path             = require("path"),
    fs               = require("fs"),
    EventEmitter     = require('events'),
    fetch            = require("node-fetch"),
    {exec}           = require("child_process"),
    //
    util             = require('@nrd/fua.core.util'),
    {RunningProcess} = require('@nrd/fua.module.subprocess'),
    //
    io_client        = require("socket.io-client"),
    _default_uri_    = "urn:tb:ec:ids:"
;

let
    _uri_      = _default_uri_,
    ec         = undefined,
    socket     = undefined,
    emit       = undefined,
    connected  = false,
    //ec           = {}
    ec_ids     = new EventEmitter(),
    rc         = new Map(),
    ALICE_PROC = null,
    BOB_PROC   = null
; // let

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

    const
        ca_cert        = fs.readFileSync(path.join(__dirname, './cert/io/ca/ca.cert'), 'utf-8'),
        io_client_cert = require(path.join(__dirname, './cert/io/client.js')),
        NODE           = RunningProcess('node', {verbose: true, cwd: __dirname})
    ;

    if (ALICE) {

        ALICE_PROC = NODE(`./rc/alice/launch.alice.js`, {config: `"${Buffer.from(JSON.stringify(ALICE)).toString('base64')}"`});

        let
            url          = `${ALICE.schema}://${ALICE.host}:${ALICE.port}/`,
            options      = {
                reconnect:          true,
                rejectUnauthorized: false,
                auth:               {
                    user:     ALICE.user['tb_ec_ids'].name,
                    password: ALICE.user['tb_ec_ids'].password
                }
                //,secure:             true,
                //    ca:                 ca_cert,
                //    cert:               io_client_cert.cert,
                //    key:                io_client_cert.key
            },
            alice_socket = io_client.connect(url, options)
        ; // let

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

        BOB_PROC = NODE(`./rc/bob/launch.bob.js`, {config: `"${Buffer.from(JSON.stringify(BOB)).toString('base64')}"`});

        let url     = `${BOB.schema}://${BOB.host}:${BOB.port}/`;
        let options = {
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
        'uri':                                     {
            set:           (uri) => {
                if (_uri_ === _default_uri_)
                    _uri_ = uri;
            },
            get:           () => {
                return _uri_
            }, enumerable: false
        },
        'ec':                                      {
            set:           (ecoSystem) => {
                if (!ec)
                    ec = ecoSystem;
            }, enumerable: false
        },
        'selfTest':                                {
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
        }, // selfTest
        'rc_refreshDAT':                           {
            value:         async (param) => {
                try {
                    if (!connected && socket)
                        throw(new Error(`tb.ec.ids : rc_refreshDAT : io NOT connected.`));
                    let result = await rc.get(param.rc)('rc_refreshDAT', param);
                    //throw (new Error()); // TEST : only
                    return result;
                } catch (jex) {
                    ec_ids.emit('error', jex);
                    throw(jex);
                } // try
            }, enumerable: false
        }, // refreshRcDAT
        'requestApplicantsSelfDescription':        {
            value:         async (param) => {
                try {
                    if (!connected && socket)
                        throw(new Error(`tb.ec.ids : requestConnectorSelfDescription : io NOT connected.`));

                    let result;

                    //let result = await ec.ip.ping({'host': param.host});
                    //
                    //if (!result.operationalResult.alive)
                    //    throw(new Error(`tb.ec.ids : requestConnectorSelfDescription : connector NOT alive`));

                    result = await rc.get(param.rc)('rc_requestApplicantsSelfDescription', param);
                    //throw (new Error()); // TEST : only
                    return result;
                } catch (jex) {
                    ec_ids.emit('error', jex);
                    throw(jex);
                } // try
            }, enumerable: false
        }, // requestApplicantsSelfDescription
        'waitForApplicantsSelfDescriptionRequest': {
            value:         async (param) => {
                try {
                    if (!connected && socket)
                        throw(new Error(`tb.ec.ids : waitForApplicantsSelfDescriptionRequest : io NOT connected.`));
                    const result = await rc.get(param.rc)('rc_waitForApplicantsSelfDescriptionRequest', param);
                    return result;
                } catch (jex) {
                    ec_ids.emit('error', jex);
                    throw(jex);
                } // try
            }, enumerable: false
        }, // waitForApplicantsSelfDescriptionRequest
        'getSelfDescriptionFromRC':                {
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

    }); // Object.defineProperties()

    return ec_ids;
}; // module.exports

// EOF
