const
    EventEmitter  = require("events"),
    _default_uri_ = "urn:tb:ec:net:",
    //
    ping          = require(`./fn/ping/ping.js`),
    portscan      = require(`./fn/portscan/portscan.js`),
    sniff         = require(`./fn/sniff/sniff.js`),
    tshark        = require(`./fn/tshark/tshark.js`),
    //
    processes     = new Map()
; // const

let
    _uri_  = _default_uri_,
    ec_net = new EventEmitter()
; // let

Object.defineProperties(ec_net, {
    uri:          {
        set:           (uri) => {
            if (_uri_ === _default_uri_)
                _uri_ = uri;
            _uri_ = uri;
        },
        get:           () => {
            return _uri_
        }, enumerable: false
    },
    ping:         {value: ping, enumerable: false},
    portscan:     {value: portscan, enumerable: false},
    start_tshark: {
        value:      tshark.start,
        enumerable: false
    }, // start_sniffer
    stop_tshark:  {
        value:      tshark.stop,
        enumerable: false
    } // stop_sniffer
});

tshark.listen('event', (err, data) => ec_net.emit('tshark', err, data));

exports.net = ec_net;
