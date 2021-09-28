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
    return `${pre}${(new Date).valueOf()}_${Math.floor(Math.random() * 100000)}_${Math.floor(Math.random() * 100000)}`;
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
    'ping': {value: require(`./fn/ping/ping.js`), enumerable: false}
    // TODO : 'portScan': {value: require(`./fn/ping/ping.js`), enumerable: false}
});

exports.ip = ec_ip;