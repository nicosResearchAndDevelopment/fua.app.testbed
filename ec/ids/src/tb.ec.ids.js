const
    fetch     = require("node-fetch")
;
let
    connected = false,
    ec        = {}
;
Object.defineProperty(ec, 'rc', {
    value:              Object.defineProperty({},
        'connect', {
            value:         async (param) => {
                try {
                    return true;
                } catch (jex) {
                    throw(jex);
                } // try
            }, enumerable: false
        }, // connect
        'getConnectorsSelfDescription', {
            value:         async (param, callback) => {
                try {
                    let result = await fetch(param.url);
                    callback(null, {
                        'ok':     result['ok'],
                        'status': result['status']
                    });
                } catch (jex) {
                    callback(jex, undefined);
                } // try
            }, enumerable: false
        }), enumerable: true
});
Object.freeze(ec);
exports.ids = ec;