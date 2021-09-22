const
    path             = require('path'),
    crypto           = require("crypto"),
    //
    util             = require('@nrd/fua.core.util'),
    //
    {BobConnector} = require('./connector.bob.js')
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
            config = JSON.parse(new Buffer(_argv_value, 'base64').toString('ascii'));
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
        bob_agent = new BobConnector({
            'id':         config.id,
            'DAPS':       config.DAPS,
            'privateKey': config.privateKey
        })
    ; // const

    require('./app.bob.js')({
        'agent':  bob_agent,
        'config': {'port': config.port}
    });

})({'config': config}).catch(console.error);

