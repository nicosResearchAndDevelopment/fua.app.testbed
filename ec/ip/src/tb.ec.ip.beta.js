const
    ping = require("ping")
;

let ec = {};

Object.defineProperty(ec, 'rc', {
    value:      Object.defineProperty({},
        'connect', {
            value:         async (param) => {
                try {
                    return true;
                } catch (jex) {
                    throw(jex);
                } // try
            }, enumerable: false
        }, // connect
        'ping', {
            value:         (param, callback) => {
                try {
                    ping.sys.probe(param.endpoint, (isAlive) => {
                        callback(null, isAlive)
                    });
                } catch (jex) {
                    callback(jex, undefined);
                } // try
            }, enumerable: false
        } // ping
    ), // Object.defineProperty({})
    enumerable: true
}); // Object.defineProperty(ec)

Object.freeze(ec);

exports.ip = ec;