const
    fetch     = require("node-fetch"),
    //
    io_bc_rc  = require("socket.io-client")
;
let
    socket    = undefined,
    connected = false,
    ec        = {}
;

Object.defineProperties(ec, {
    'connect':                         {
        value:      async (param, callback) => {
            param       = {
                'host':  `http://127.0.0.1:8099/`,
                'query': undefined
            };
            let options = {
                'reconnect':          true,
                'rejectUnauthorized': false
            };

            if (param.query)
                options['query'] = param.query;

            try {
                socket = io_bc_rc.connect(param.host, options);
                socket.on('connect', function () {
                    connected = true;
                    callback(null, true);
                });
                socket.on('error', function (error) {
                    debugger;
                });

            } catch (jex) {
                callback(jex, undefined);
            } // try
        },
        enumerable: false
    }, // connect
    'getConnectorsSelfDescription':    {
        value:      async (param, callback) => {
            try {
                if (!connected && socket)
                    callback({'message': `tb.ec.ids : getConnectorsSelfDescription : io NOT connected.`}, undefined);
                socket.emit('getConnectorsSelfDescription', param, callback);
            } catch (jex) {
                callback(jex, undefined);
            } // try
        },
        enumerable: false
    }, // getConnectorsSelfDescription
    'connectorSelfDescriptionRequest': {
        value:      async (param, callback) => {
            try {
                if (!connected && socket)
                    callback({'message': `tb.ec.ids : connectorSelfDescriptionRequest : io NOT connected.`}, undefined);
                socket.emit('connectorSelfDescriptionRequest', param, callback);
            } catch (jex) {
                callback(jex, undefined);
            } // try
        },
        enumerable: false
    } // connectorSelfDescriptionRequest
});

Object.freeze(ec);
exports.ids = ec;

/**

 */