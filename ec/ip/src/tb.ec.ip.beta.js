const
    EventEmitter  = require("events"),
    ping          = require("ping"),
    util          = require("@nrd/fua.core.util"),
    _default_uri_ = "urn:tb:ec:ip:"
;

let
    _uri_ = _default_uri_,
    ec_ip = new EventEmitter()
;

function randomLeave(pre) {
    return `${pre}${(new Date).valueOf()}_${Math.floor(Math.random() * 1000)}_${Math.floor(Math.random() * 1000)}`;
}

Object.defineProperties(ec_ip, {
    'uri':  {
        set:          (uri) => {
            if (_uri_ === _default_uri_)
                _uri_ = uri;
            _uri_ = uri;
        },
        get:          () => {
            return _uri_
        }
        , enumerable: false
    },
    'ping': {
        value:         async (param) => {
            try {
                //let probe  = util.promisify(ping.sys.probe).bind(ping);
                //let result = await probe(param.endpoint);
                let result                  = {
                    'start':             (new Date).toISOString(),
                    'operationalResult': undefined
                };
                result['operationalResult'] = await ping.promise.probe(param.host);
                result.end                  = (new Date).toISOString();
                return result;

                //ping.sys.probe(param.endpoint, (isAlive) => {
                //    callback(null, isAlive)
                //});
            } catch (jex) {
                throw(jex);
            } // try
        }, enumerable: false
    } // ping
});

Object.freeze(ec_ip);
exports.ip = ec_ip;