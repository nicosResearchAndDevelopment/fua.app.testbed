const
    path                = require('path'),
    {Agent: HttpsAgent} = require('https'),
    fetch               = require('node-fetch'),
    util                = require('../../../../src/code/util.testbed.js'),
    ServerAgent         = require('@nrd/fua.agent.server'),
    {BaseConnector}     = require(path.join(util.FUA_JS_LIB, 'ids/ids.agent.BaseConnector/src/ids.agent.BaseConnector.js'));

class RCAgent extends ServerAgent {

    #connector  = null;
    #httpsAgent = null;

    #idle_semaphore = null;
    #idle_timeout   = 30;

    async initialize(options = {}) {
        util.assert(options.app, 'expected app to be enabled');
        util.assert(options.event, 'expected event to be enabled');
        util.assert(options.connector, 'expected connector to be enabled');

        await super.initialize(options);

        if (options.connector) {
            if (options.connector instanceof BaseConnector) {
                this.#connector = options.connector;
            } else {
                const connectorOptions = util.isObject(options.connector) && options.connector || {};
                this.#connector        = new BaseConnector(connectorOptions);
            }
        }

        if (options.httpsAgent) {
            if (options.httpsAgent instanceof HttpsAgent) {
                this.#httpsAgent = options.httpsAgent;
            } else {
                const httpsOptions = util.isObject(options.httpsAgent) && options.httpsAgent || {};
                this.#httpsAgent   = new HttpsAgent(httpsOptions);
            }
        }

        this.event.on('**', (event) => this.emit('event', event));

        this.touchIdle();

        return this;
    } // RCAgent#initialize

    get connector() {
        return this.#connector;
    } // RCAgent#connector

    touchIdle() {
        if (this.#idle_semaphore) clearTimeout(this.#idle_semaphore);
        this.#idle_semaphore = setTimeout(() => {
            this.#idle_semaphore = null;
            this.emitEvent('idle');
            this.touchIdle();
        }, 1000 * this.#idle_timeout);
        return this;
    } // RCAgent#touchIdle

    emitEvent(type = 'default', data = null) {
        const event = {
            type:   type,
            source: this.url
        };
        if (data) Object.assign(event, {
            datacontenttype: 'application/json',
            data:            data
        });
        this.event.emit(event);
        return this;
    } // RCAgent#emitEvent

    async selfDescription(requester) {
        this.touchIdle();

        this.emitEvent('tb.rc.selfDescription.called', {
            requester: requester
        });

        return await this.connector.selfDescription();
    } // RCAgent#selfDescription

    async refreshDAT(param) {
        this.touchIdle();

        this.emitEvent('tb.rc.refreshDat.called', {
            thread: param.thread
        });

        try {
            const DAT = await this.connector.getDAT({'daps': param.daps || 'default'});

            this.touchIdle();

            this.emitEvent('tb.rc.refreshDat.received', {
                thread: param.thread,
                result: DAT
            });

            return DAT;
        } catch (err) {
            this.emitEvent('tb.rc.refreshDat.error', {
                thread:  param.thread,
                message: err?.message || '' + err
            });
        }
    } // RCAgent#refreshDAT

    async requestApplicantsSelfDescription(param) {
        this.touchIdle();

        this.emitEvent('tb.rc.requestApplicantsSelfDescription.called', {
            thread: param.thread
        });

        try {
            const
                target   = param.schema + '://' + param.host + (param.port && ':' + param.port || '') + param.path,
                response = await fetch(target, {agent: this.#httpsAgent || undefined}),
                payload  = await response.text();

            this.touchIdle();

            this.emitEvent('tb.rc.requestApplicantsSelfDescription.received', {
                thread: param.thread,
                result: payload
            });

            return payload;
        } catch (err) {
            this.emitEvent('tb.rc.requestApplicantsSelfDescription.error', {
                thread:  param.thread,
                message: err?.message || '' + err
            });
        }
    } // RCAgent#requestApplicantsSelfDescription

    async waitForApplicantsSelfDescriptionRequest(param) {
        this.touchIdle();

        this.emitEvent('tb.rc.waitForApplicantsSelfDescriptionRequest.called', {
            thread: param.thread
        });

        try {
            await new Promise((resolve, reject) => {
                let waitForApplicant, timeoutSemaphore;
                waitForApplicant = (event) => {
                    if (event.data.requester === param.requester) {
                        clearTimeout(timeoutSemaphore);
                        this.event.off('tb.rc.selfDescription.called', waitForApplicant);
                        resolve();
                    }
                };
                timeoutSemaphore = setTimeout(() => {
                    this.event.off('tb.rc.selfDescription.called', waitForApplicant);
                    const errMessage = `tb.ec.ids.rc : rc_waitForApplicantsSelfDescriptionRequest : timeout <${param.timeout}sec> reached.`;
                    reject({'message': errMessage});
                }, 1000 * (param.timeout || 1));
                this.event.on('tb.rc.selfDescription.called', waitForApplicant);
            });

            this.touchIdle();

            this.emitEvent('tb.rc.waitForApplicantsSelfDescriptionRequest.received', {
                thread: param.thread,
                result: true
            });

            return true;
        } catch (err) {
            this.emitEvent('tb.rc.waitForApplicantsSelfDescriptionRequest.error', {
                thread:  param.thread,
                message: err?.message || '' + err
            });
        }
    } // RCAgent#waitForApplicantsSelfDescriptionRequest

} // RCAgent

module.exports = RCAgent;
