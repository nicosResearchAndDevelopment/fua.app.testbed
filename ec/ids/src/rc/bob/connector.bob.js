const
    path            = require('path'),
    crypto          = require("crypto"),
    //
    util            = require('@nrd/fua.core.util'),
    //
    {BaseConnector} = require(path.join(util.FUA_JS_LIB, 'ids/ids.agent.BaseConnector/src/ids.agent.BaseConnector.js'))
; // const

//region fn
function timestamp() {
    return (new Date).toISOString();
}

function randomLeave(pre) {
    return `${pre}${(new Date).valueOf()}_${Math.floor(Math.random() * 100000)}_${Math.floor(Math.random() * 100000)}`;
    //return pre + Buffer.from(`${(new Date).valueOf()}_${Math.floor(Math.random() * 100000)}_${Math.floor(Math.random() * 100000)}`).toString('base64');
}

//endregion fn

class BobConnector extends BaseConnector {

    #idle           = (timeout) => {
        let
            semaphore,
            event = {
                'id':     randomLeave(this.id + "event/idle/"),
                'type':   "event",
                'prov':   this.id,
                'method': "idle",
                'step':   "timeout_reached",
                'start':  (new Date).toISOString()
            }
        ;
        event.end = event.start;

        this['emit']('event', null, event);
        semaphore = setTimeout(() => {
            clearTimeout(semaphore);
            semaphore = this.#idle(timeout);
        }, (timeout * 1000));
        return semaphore;
    };
    #idle_semaphore = null;
    #idle_timeout   = 30; // REM : seconds
    #about_wait_map = new Map();

    constructor({
                    'id':         id,
                    'SKIAKI':     SKIAKI,
                    'privateKey': privateKey,
                    'DAPS':       DAPS = {'default': undefined},
                    //
                    'idle_timeout': idle_timeout = 30 // REM : seconds
                }) {

        super({
            'id':         id,
            'SKIAKI':     SKIAKI,
            'privateKey': privateKey,
            'DAPS':       DAPS
        });

        this.#idle_timeout = ((idle_timeout && idle_timeout >= 1) ? idle_timeout : 1);

        Object.defineProperties(this, {
            'idle_timeout':    {
                get() {
                    return this.#idle_timeout;
                }
            },
            'selfDescription': {
                value:          Object.defineProperties(async ({'requester_url': requester_url = undefined}) => {
                    clearTimeout(this.#idle_semaphore);
                    let
                        //event                 = {
                        //    'id':        randomLeave(this.id),
                        //    'prov':      this.id,
                        //    'method':    "selfDescription",
                        //    'step':      "called",
                        //    'start':     timestamp(),
                        //    'requester': requester_url
                        //},
                        about_waiter_callback = this.#about_wait_map.get(requester_url)
                    ;
                    try {
                        let selfDescription_;
                        if
                        (about_waiter_callback) {
                            this.#about_wait_map.delete(requester_url);
                            about_waiter_callback(null, {
                                'requester_url':          requester_url,
                                'SelfDescriptionFetched': true
                            });
                        } // if ()

                        //event.end = timestamp();
                        //this.emit('event', null, event);

                        selfDescription_               = await super.selfDescription();
                        selfDescription_['rdfs:label'] = {
                            '@type':  "xsd:string",
                            '@value': "tb.rc.ids.bc-bob"
                        };

                        // TODO : check catch(jex) : throw(new Error(``));

                        this.#idle_semaphore = this.#idle(this.#idle_timeout);
                        return selfDescription_;

                    } catch (jex) {

                        this.emit('event', jex, undefined);
                        this.#idle_semaphore = this.#idle(this.#idle_timeout);

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
        }); // bject.defineProperties(this)

        if (this.#idle_timeout)
            this.#idle_semaphore = this.#idle(this.#idle_timeout);

        if (this['__proto__']['constructor']['name'] === "RC_Connector") {
            Object.seal(this);
        } // if ()

        return this;
    } // constructor()

    //region rc
    async rc_requestConnectorSelfDescription(param) {
        clearTimeout(this.#idle_semaphore);
        try {
            let result = {
                'id':                randomLeave(this.id),
                'thread':            param.thread,
                'prov':              `${this.id}rc_requestConnectorSelfDescription`,
                'start':             (new Date).toISOString(),
                'operationalResult': undefined
            };
            // TODO : fetch
            let that   = `${param.schema}${param.host}${param.path}`;

            result.operationalResult = {'prov': this.id};
            result.end               = (new Date).toISOString();
            this.#idle_semaphore     = this.#idle(this.#idle_timeout);
            return result;
        } catch (jex) {
            throw(jex);
        } // try
    } // rc_requestConnectorSelfDescription()

    async rc_connectorSelfDescriptionRequest(param, callback) {
        clearTimeout(this.#idle_semaphore);

        try {

            let
                result = {
                    'id':                randomLeave(this.id),
                    'thread':            param.thread,
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

                result.operationalResult = data;
                result.end               = (new Date).toISOString();

                this.#idle_semaphore = this.#idle(this.#idle_timeout);
                callback(null, result);
            }); // connector.about['on'](param.requester_url)

            semaphore = setTimeout(() => {
                this.#about_wait_map.delete(param.requester_url);

                this.#idle_semaphore = this.#idle(this.#idle_timeout);
                callback({'message': `tb.ec.ids.rc : rc_connectorSelfDescriptionRequest : timeout <${param.timeout}sec> reached.`}, undefined);
            }, (param.timeout * 1000));

        } catch (jex) {
            callback(jex, undefined);
        } // try
    } // rc_connectorSelfDescriptionRequest
    //endregion rc

} // BobConnector

exports.BobConnector = BobConnector;