const
    path            = require('path'),
    crypto          = require("crypto"),
    //
    fetch           = require("node-fetch"),
    //
    util            = require('@nrd/fua.core.util'),
    //
    {BaseConnector} = require(path.join(util.FUA_JS_LIB, 'ids/ids.agent.BaseConnector/src/ids.agent.BaseConnector.js'))
; // const

function randomLeave(pre) {
    return `${pre}${(new Date).valueOf()}_${Math.floor(Math.random() * 100000)}_${Math.floor(Math.random() * 100000)}`;
    //return pre + Buffer.from(`${(new Date).valueOf()}_${Math.floor(Math.random() * 100000)}_${Math.floor(Math.random() * 100000)}`).toString('base64');
}

class AliceConnector extends BaseConnector {

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
            let result     = {
                'id':                randomLeave(this.id),
                'prov':              `${this.id}rc_getConnectorsSelfDescription`,
                'target': `${param.schema}${param.host}${param.path}`,
                'start':             (new Date).toISOString(),
                'operationalResult': undefined
            };
            const response = await fetch(result.target);
            const body     = await response.text();

            // TODO :
            result.operationalResult = JSON.parse(body);
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
                    'id':                randomLeave(this.id),
                    'prov':              `${this.id}rc_connectorSelfDescriptionRequest`,
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

} // AliceConnector

exports.AliceConnector = AliceConnector;