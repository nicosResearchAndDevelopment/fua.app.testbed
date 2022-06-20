const
    EventEmitter = require('events'),
    //
    sendRequest  = require(`./fn/sendRequest/sendRequest.js`),
    //
    ec_ldp       = new EventEmitter();

Object.defineProperties(ec_ldp, {
    sendRequest: {value: sendRequest, enumerable: false}
});

exports.ldp = ec_ldp;
