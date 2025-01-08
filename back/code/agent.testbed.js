const
    util        = require('./util.testbed.js'),
    ServerAgent = require('@fua/agent.server'),
    // {PEP}       = require('@fua/decide.pep'),
    DAPSAgent   = require('@fua/ids.agent.daps'),
    testing     = require('@fua/module.testing');

class TestbedAgent extends ServerAgent {

    static id = 'http://www.nicos-rd.com/fua/testbed#TestbedAgent/';

    // #pep     = null;
    #daps    = null;
    #testing = null;

    constructor(options = {}) {
        super(options);

        this.#testing = new testing.Provider({
            '@id':      this.uri,
            ecosystems: options.ecosystems || []
        });
    } // TestbedAgent#constructor

    async initialize(options = {}) {
        await super.initialize(options);

        // if (options.pep) {
        //     if (options.pep instanceof PEP) {
        //         this.#pep = options.pep;
        //     } else {
        //         const pepOptions = util.isObject(options.pep) && options.pep || {};
        //         if (!pepOptions.id) pepOptions.id = this.uri + 'pep/';
        //         this.#pep = new PEP(pepOptions);
        //     }
        // }

        if (options.daps) {
            if (options.daps instanceof DAPSAgent) {
                this.#daps = options.daps;
            } else {
                const dapsOptions = util.isObject(options.daps) && options.daps || {};
                if (!dapsOptions.id) dapsOptions.id = this.uri + 'daps/';
                if (!dapsOptions.rootUri) dapsOptions.rootUri = this.uri + 'domain/user#';
                if (!dapsOptions.jwt_payload_iss) dapsOptions.jwt_payload_iss = this.url;
                if (!dapsOptions.domain) {
                    util.assert(options.domain, 'expected domain to be enabled');
                    dapsOptions.domain = this.domain;
                }
                this.#daps = new DAPSAgent(dapsOptions);
            }
        }

        return this;
    } // TestbedAgent#initialize

    get id() {
        return this.uri;
    }

    // get PEP() {
    //     return this.#pep;
    // }

    get DAPS() {
        return this.#daps;
    }

    get testing() {
        return this.#testing;
    }

} // TestbedAgent

module.exports = TestbedAgent;
