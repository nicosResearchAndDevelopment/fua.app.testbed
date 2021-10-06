const
    path            = require('path'),
    //
    fetch           = require("node-fetch"),
    //
    util            = require('@nrd/fua.core.util'),
    uuid            = require('@nrd/fua.core.uuid'),
    //
    {BaseConnector} = require(path.join(util.FUA_JS_LIB, 'ids/ids.agent.BaseConnector/src/ids.agent.BaseConnector.js'))
; // const

//region fn

function randomLeave(pre) {
    return `${pre}${uuid.v4()}`;
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
                'start':  util.timestamp()
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

                            this.#idle_semaphore = this.#idle(this.#idle_timeout);
                            return {
                                id:      this.id,
                                '@type': "ids:SelfDescription"
                            };

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
            }
        ); // Object.defineProperties(this)

        if (this.#idle_timeout)
            this.#idle_semaphore = this.#idle(this.#idle_timeout);

        if (this['__proto__']['constructor']['name'] === "RC_Connector") {
            Object.seal(this);
        } // if ()

        return this;
    } // constructor()

    //region rc
    async rc_requestApplicantsSelfDescription(param) {

        clearTimeout(this.#idle_semaphore);

        let
            event = {
                'id':     randomLeave(this.id + "event/"),
                'type':   "event",
                'prov':   this.id,
                'method': "rc_requestApplicantsSelfDescription",
                'step':   "called",
                'start':  util.timestamp()
            }
        ;
        try {

            let
                result = {
                    'id':                randomLeave(`${this.id}rc_requestApplicantsSelfDescription/result/`),
                    'thread':            param.thread,
                    'prov':              `${this.id}rc_requestApplicantsSelfDescription`,
                    'target':            `${param.schema}://${param.host}${param.path}`,
                    'operationalResult': undefined
                }
            ; // let

            result.start = event.start;

            const
                response = await fetch(result.target),
                body     = await response.text()
            ;

            // TODO :
            result.operationalResult = JSON.parse(body);
            result.end               = util.timestamp();

            event.end = result.end;
            this.emit('event', null, event);

            this.#idle_semaphore = this.#idle(this.#idle_timeout);
            return result;
        } catch (jex) {
            event.error = jex;
            event.end   = util.timestamp();
            this.emit('event', event, undefined);
            throw(jex);
        } // try
    } // rc_requestApplicantsSelfDescription()

    async rc_waitForApplicantsSelfDescriptionRequest(param, callback) {

        clearTimeout(this.#idle_semaphore);

        try {

            let
                result = {
                    'id':                randomLeave(this.id),
                    'thread':            param.thread,
                    'prov':              `${this.id}rc_waitForApplicantsSelfDescriptionRequest`,
                    'start':             util.timestamp(),
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
                result.end               = util.timestamp();

                this.#idle_semaphore = this.#idle(this.#idle_timeout);
                callback(null, result);
            }); // connector.about['on'](param.requester_url)

            semaphore = setTimeout(() => {
                this.#about_wait_map.delete(param.requester_url);

                this.#idle_semaphore = this.#idle(this.#idle_timeout);
                callback({'message': `tb.ec.ids.rc : rc_waitForApplicantsSelfDescriptionRequest : timeout <${param.timeout}sec> reached.`}, undefined);
            }, (param.timeout * 1000));

        } catch (jex) {
            callback(jex, undefined);
        } // try
    } // rc_waitForApplicantsSelfDescriptionRequest
    //endregion rc

} // BobConnector

exports.BobConnector = BobConnector;