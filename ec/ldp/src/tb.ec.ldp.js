const
    EventEmitter = require('events'),
    util         = require('../../../src/code/util.testbed.js'),
    _sendRequest = require('./fn/sendRequest/sendRequest.js');

class EcosystemLDP {

    #emitter = new EventEmitter();

    on(eventName, listener) {
        this.#emitter.on(eventName, listener);
        return this;
    } // EcosystemLDP#on

    once(eventName, listener) {
        this.#emitter.once(eventName, listener);
        return this;
    } // EcosystemLDP#once

    off(eventName, listener) {
        this.#emitter.off(eventName, listener);
        return this;
    } // EcosystemLDP#off

    async sendRequest(param) {
        return await _sendRequest(param);
    } // EcosystemLDP#sendRequest

} // EcosystemLDP

module.exports = EcosystemLDP;
