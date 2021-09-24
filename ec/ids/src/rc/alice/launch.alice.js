const
    path             = require('path'),
    crypto           = require("crypto"),
    //
    util             = require('@nrd/fua.core.util'),
    //
    {AliceConnector} = require('./connector.alice.js')
; // const

let
    __privateKey__ = undefined,
    config         = {}
;
//region process.argv
process['argv']['forEach']((val, index, array) => {
    let
        _argv_property,
        _argv_value
    ;
    if (val['indexOf']("=") !== -1) {
        _argv_property = val['split']("=")[0];
        _argv_value    = val['split']("=")[1];
    } // if()
    switch (_argv_property) {
        case "config":
            config = JSON.parse(Buffer.from(_argv_value, 'base64').toString('utf8'));
            break;
        default:
            break;
    } // switch(_argv_property)
}); // process['argv']['forEach']()

//endregion process.argv

const {client}        = require(config['cert_client']);
config['privateKey']  = crypto.createPrivateKey(client.private);
config['cert_client'] = undefined;

(async ({'config': config}) => {
    const
        alice_agent = new AliceConnector({
            'id':         config.id,
            'SKIAKI':     config.SKIAKI,
            'privateKey': config.privateKey,
            //
            'idle_timeout': config.idle_timeout,
            //
            'DAPS': config.DAPS
        })
    ; // const

    require('./app.alice.js')({
        'agent':  alice_agent,
        'config': {
            'port': config.port,
            'user': config.user
        }
    });

})({'config': config}).catch(console.error);

