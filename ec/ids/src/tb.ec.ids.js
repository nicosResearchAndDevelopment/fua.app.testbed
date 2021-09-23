const
    EventEmitter  = require('events'),
    fetch         = require("node-fetch"),
    //
    util          = require('@nrd/fua.core.util'),
    //
    io_bc_rc      = require("socket.io-client"),
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
    rc            = new Map()
;

function randomLeave(pre) {
    return `${pre}${(new Date).valueOf()}_${Math.floor(Math.random() * 100000)}_${Math.floor(Math.random() * 100000)}`;
}

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
    'connect':                         {
        value:         async (param) => {
            let
                result  = {
                    'id':                `${randomLeave(`${_uri_}connect/`)}`,
                    'start':             (new Date).toISOString(),
                    'operationalResult': false
                },
                options = {
                    'reconnect':          true,
                    'rejectUnauthorized': false
                }
            ; // let

            //if (param.query)
            //    options['query'] = param.query;

            socket = io_bc_rc.connect(param.url, options);

            await new Promise((resolve, reject) => {
                socket.on('connect', (args) => {
                    rc.set(param.url, util.promisify(socket.emit).bind(socket));
                    resolve();
                }); // socket.on('connect')
                socket.on('error', (args) => {
                    reject(args);
                }); // socket.on('error')
            }); // await new Promise()

            result.end               = (new Date).toISOString();
            result.operationalResult = {'url': param.url, 'connected': true};
            connected                = true;

            return result;

        }, enumerable: false
    }, // connect
    'getConnectorsSelfDescription':    {
        value:         async (param) => {
            try {
                if (!connected && socket)
                    throw(new Error(`tb.ec.ids : getConnectorsSelfDescription : io NOT connected.`));

                let result = await ec.ip.ping({'host': param.host});

                if (!result.operationalResult.alive)
                    throw(new Error(`tb.ec.ids : getConnectorsSelfDescription : connector NOT alive`));

                result = await rc.get(param.rc)('getConnectorsSelfDescription', param);
                return result;
            } catch (jex) {
                throw(jex);
            } // try
        }, enumerable: false
    }, // getConnectorsSelfDescription
    'connectorSelfDescriptionRequest': {
        value:         async (param) => {
            try {
                if (!connected && socket)
                    throw(new Error(`tb.ec.ids : connectorSelfDescriptionRequest : io NOT connected.`));
                const result = await rc.get(param.rc)('connectorSelfDescriptionRequest', param);
                return result;
            } catch (jex) {
                throw(jex);
            } // try
        }, enumerable: false
    }, // connectorSelfDescriptionRequest
    'getSelfDescriptionFromRC':        {
        value:         async (param) => {
            try {
                if (!connected && socket)
                    throw(new Error(`tb.ec.ids : getSelfDescriptionFromRC : io NOT connected.`));
                const result = await rc.get(param.rc)('getSelfDescriptionFromRC', param);
                return result;
            } catch (jex) {
                throw(jex);
            } // try
        }, enumerable: false
    } // getSelfDescriptionFromRC

    //'on_RC_IDLE': {
    //    value:      async (param, callback) => {
    //        try {
    //            if (!connected && socket)
    //                callback({'message': `tb.ec.ids : on_RC_IDLE : io NOT connected.`}, undefined);
    //            socket.emit('on_RC_IDLE', undefined, callback);
    //        } catch (jex) {
    //            callback(jex, undefined);
    //        } // try
    //    },
    //    enumerable: false
    //} // on_RC_IDLE
});

Object.freeze(ec_ids);

exports.ids = ec_ids;

// EOF