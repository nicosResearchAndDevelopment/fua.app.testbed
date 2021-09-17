const
    ping = require("ping")
;

let ec = {};

Object.defineProperties(ec, {
    'ping':                         {
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
});

Object.freeze(ec);
exports.ip = ec;