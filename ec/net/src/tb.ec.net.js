const
    EventEmitter  = require("events"),
    _default_uri_ = "urn:tb:ec:net:",
    sniff         = require(`./fn/sniff/sniff.js`),
    processes     = new Map()
;
let
    _uri_         = _default_uri_,
    ec_net        = new EventEmitter()
;

Object.defineProperties(ec_net, {
    uri:   {
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
    sniff: {
        value:         async (param) => {
            try {
                let _sniff_  = sniff(param);
                _sniff_.emit = (topic, error, data) => {
                    ec_net.emit(topic, error, data);
                };
                processes.set(_sniff_.id, _sniff_);
                return {process: _sniff_.id};
            } catch (jex) {
                throw (jex); // TODO : own error
            } // try
        }, enumerable: false
    }, // sniff
    kill:  {
        value:         (process) => {
            processes.get(process).kill();
            ec_net.emit('event', null, {
                process: process,
                killed:  true
            });
        }, enumerable: false
    } // kill
});

exports.net = ec_net;