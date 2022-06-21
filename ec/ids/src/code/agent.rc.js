const
    path            = require('path'),
    fetch           = require('node-fetch'),
    util            = require('../../../../src/code/util.testbed.js'),
    ServerAgent     = require('@nrd/fua.agent.server'),
    {BaseConnector} = require(path.join(util.FUA_JS_LIB, 'ids/ids.agent.BaseConnector/src/ids.agent.BaseConnector.js'));

class RCAgent extends ServerAgent {

    #connector = null;

    async initialize(options = {}) {
        util.assert(options.app, 'expected app to be enabled');
        util.assert(options.event, 'expected event to be enabled');
        util.assert(options.scheduler, 'expected scheduler to be enabled');
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

        return this;
    } // RCAgent#initialize

    get connector() {
        return this.#connector;
    }

    touchIdle() {
        // TODO
    }

    async refreshDAT(param) {
        this.touchIdle();

        this.event.emit({
            type:   'tb.rc.refreshDat.called',
            source: this.url
        });

        try {
            const
                daps = param.daps || 'default',
                DAT  = await this.connector.getDAT({'daps': daps});

            this.event.emit({
                type:   'tb.rc.refreshDat.received',
                source: this.url,
                data:   DAT
            });

            return DAT;
        } catch (err) {
            this.event.emit({
                type:   'tb.rc.refreshDat.error',
                source: this.url,
                data:   '' + err
            });
        }
    } // refreshDAT

    async requestApplicantsSelfDescription(param) {
        this.touchIdle();

        this.event.emit({
            type:   'tb.rc.requestApplicantsSelfDescription.called',
            source: this.url
        });

        try {
            const
                target   = `${param.schema}://${param.host}${((!!param.port) ? ":" + param.port : "")}${param.path}`,
                response = await fetch(target),
                payload  = await response.text();

            this.event.emit({
                type:   'tb.rc.requestApplicantsSelfDescription.received',
                source: this.url,
                data:   payload
            });

            return payload;
        } catch (err) {
            this.event.emit({
                type:   'tb.rc.requestApplicantsSelfDescription.error',
                source: this.url,
                data:   '' + err
            });
        }
    } // requestApplicantsSelfDescription

    async waitForApplicantsSelfDescriptionRequest(param) {
        this.touchIdle();

        this.event.emit({
            type:   'tb.rc.waitForApplicantsSelfDescriptionRequest.called',
            source: this.url
        });

        try {
            const
                timeoutPromise = new Promise((resolve, reject) => setTimeout(reject, param.timeout || 1, {
                    'message': `tb.ec.ids.rc : rc_waitForApplicantsSelfDescriptionRequest : timeout <${param.timeout}sec> reached.`
                })),
                resultPromise  = new Promise((resolve, reject) => {
                    this.connector.selfDescription.on(param.requester_url, (err, result) => err ? reject(err) : resolve(result));
                }),
                result         = await Promise.race([resultPromise, timeoutPromise]);

            this.event.emit({
                type:   'tb.rc.waitForApplicantsSelfDescriptionRequest.received',
                source: this.url,
                data:   result
            });

            return result;
        } catch (err) {
            this.event.emit({
                type:   'tb.rc.waitForApplicantsSelfDescriptionRequest.error',
                source: this.url,
                data:   '' + err
            });
        }
    } // waitForApplicantsSelfDescriptionRequest

} // RCAgent

module.exports = RCAgent;
