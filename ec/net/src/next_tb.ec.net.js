const
    EventEmitter = require('events'),
    util         = require('../../../src/code/util.testbed.js'),
    _ping        = require('./fn/ping/ping.js'),
    _portscan    = require('./fn/portscan/portscan.js'),
    _sniff       = require('./fn/sniff/sniff.js'),
    _tshark      = require('./fn/tshark/tshark.js');

class EcosystemNet {

    #emitter = new EventEmitter();

    constructor() {
        _tshark.listen('event', (err, data) => {
            if (err) this.#emitter.emit('tshark_error', err);
            else this.#emitter.emit('tshark_data', data);
        });
    }

    on(eventName, listener) {
        this.#emitter.on(eventName, listener);
        return this;
    } // EcosystemNet#on

    once(eventName, listener) {
        this.#emitter.once(eventName, listener);
        return this;
    } // EcosystemNet#once

    off(eventName, listener) {
        this.#emitter.off(eventName, listener);
        return this;
    } // EcosystemNet#off

    async ping(param) {
        return await _ping(param);
    } // EcosystemNet#ping

    async portscan(param) {
        return await _portscan(param);
    } // EcosystemNet#portscan

    async start_tshark(param) {
        return await _tshark.start(param);
    } // EcosystemNet#start_tshark

    async stop_tshark(param) {
        return await _tshark.stop(param);
    } // EcosystemNet#stop_tshark

} // EcosystemNet

module.exports = EcosystemNet;
