const
    crypto          = require("crypto"),
    path            = require('path'),
    http            = require('http'),
    //
    express         = require('express'),
    socket_io       = require('socket.io'),
    ExpressSession  = require('express-session'),
    //
    util            = require('@nrd/fua.core.util'),
    {BaseConnector} = require(path.join(util.FUA_JS_LIB, 'ids/ids.agent.BaseConnector/src/ids.agent.BaseConnector.js'))
;

let
    __privateKey__   = undefined,
    __port__         = undefined,
    __idle_timeout__ = 60 // REM : seconds
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
        case "privateKey":
            //const {client} = require("C:/fua/DEVL/js/app/nrd-testbed/ec/ids/resources/cert/index.js");
            const {client} = require(_argv_value);
            __privateKey__ = crypto.createPrivateKey(client.private);
            break;
        case "port":
            __port__ = parseInt(_argv_value);
            break;
        case "idle_timeout":
            __idle_timeout__ = parseInt(_argv_value);
            break;
        default:
            break;
    } // switch()
});

//endregion process.argv

class RC_Connector extends BaseConnector {

    #about_wait_map = new Map();

    constructor({
                    'id':         id,
                    'privateKey': privateKey,
                    'DAPS':       DAPS = {'default': undefined}
                }) {

        super({
            'id':         id,
            'privateKey': privateKey,
            'DAPS':       DAPS
        });

        Object.defineProperties(this, {
                'selfDescription': {
                    value:          Object.defineProperties(async ({'requester_url': requester_url = undefined}) => {
                        let
                            about_waiter_callback = this.#about_wait_map.get(requester_url)
                        ;
                        try {

                            if (about_waiter_callback) {
                                this.#about_wait_map.delete(requester_url);
                                about_waiter_callback(null, {
                                    'requester_url':          requester_url,
                                    'SelfDescriptionFetched': true
                                });
                            } // if ()

                            return {'@type': "ids:SelfDescription"};
                        } catch (jex) {
                            if (about_waiter_callback) {
                                this.#about_wait_map.delete(requester_url);
                                about_waiter_callback(jex, undefined);
                            } // if ()
                        } // try
                    }, {
                        'on': {
                            value:         (requester_url, callback) => {
                                this.#about_wait_map.set(requester_url, callback);
                            }, enumerable: false
                        }
                    }), enumerable: false
                } // provideSelfDescription
            }
        );

        if (this['__proto__']['constructor']['name'] === "RC_Connector") {
            Object.seal(this);
        } // if ()

        return this;
    } // constructor()

    //region rc
    async rc_getConnectorsSelfDescription(param) {
        try {
            let result = {
                'start':             (new Date).toISOString(),
                'operationalResult': undefined
            };
            // TODO : fetch
            let that   = `${param.schema}${param.host}${param.path}`;

            result.operationalResult = {'mahl': "zeit"};
            result.end               = (new Date).toISOString();
            return result;
        } catch (jex) {
            throw(jex);
        } // try
    } // rc_getConnectorsSelfDescription()

    async rc_connectorSelfDescriptionRequest(param, callback) {
        try {

            let
                result = {
                    'start':             (new Date).toISOString(),
                    'operationalResult': undefined
                },
                semaphore
            ;

            if (!param.timeout)
                param.timeout = 1; // selfDescription_timeout_default;

            this.selfDescription['on'](param.requester_url, (error, data) => {

                if (error)
                    callback(error, undefined);

                clearTimeout(semaphore);
                result.operationalResult = data;
                result.end               = (new Date).toISOString();

                callback(null, result);
            }); // connector.about['on'](param.requester_url)

            semaphore = setTimeout(() => {
                this.#about_wait_map.delete(param.requester_url);
                callback({'message': `tb.ec.ids.rc : rc_connectorSelfDescriptionRequest : timeout <${param.timeout}sec> reached.`}, undefined);
            }, (param.timeout * 1000));

        } catch (jex) {
            callback(jex, undefined);
        } // try
    } // rc_connectorSelfDescriptionRequest
    //endregion rc

} // RC_Connector

const
    app       = express(),
    server    = http.createServer(app),
    io        = socket_io(server)
    ,
    connector = new RC_Connector({
        'id':         "https://ids-rc.nicos-rd.com/",
        'privateKey': __privateKey__,
        'DAPS':       {'default': "https://nrd-daps.nicos-rd.com/"}
    })
;

try {
    server.listen(__port__, () => {

        io.on('connection', (socket) => {

            console.error("inside connection .............................................................................");

            socket.on('getConnectorsSelfDescription', async (param, callback) => {
                try {
                    let result = await connector.rc_getConnectorsSelfDescription(param);
                    callback(null, result);
                } catch (error) {
                    callback(error, undefined);
                } // try
            }); // socket.on('getConnectorsSelfDescription')

            socket.on('connectorSelfDescriptionRequest', (param, callback) => {
                connector.rc_connectorSelfDescriptionRequest(param, callback);
            }); // socket.on('getConnectorsSelfDescription')

            socket.on('getSelfDescriptionFromRC', async (param, callback) => {
                try {
                    let result = await connector.selfDescription({'requester_url': undefined});
                    callback(null, result);
                } catch (error) {
                    callback(error, undefined);
                } // try
            }); // socket.on('getConnectorsSelfDescription')

            //socket.on('on_RC_IDLE', (data, callback) => {
            //    connector.on('idle', callback);
            //});
        }); // io_test.on('connection')
        //io.on('error', (error) => {
        //    error;
        //});

    }); // server.listen()

} catch (jex) {
    throw (jex);
} // try
