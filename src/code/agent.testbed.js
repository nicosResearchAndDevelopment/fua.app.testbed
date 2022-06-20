const
    util        = require('./util.testbed.js'),
    ServerAgent = require('@nrd/fua.agent.server'),
    Scheduler   = require('@nrd/fua.agent.scheduler'),
    {PEP}       = require('@nrd/fua.decide.pep'),
    {DAPS}      = require('@nrd/fua.ids.agent.daps');

class TestbedAgent extends ServerAgent {

    static id = 'http://www.nicos-rd.com/fua/testbed#TestbedAgent/';

    #scheduler = null;
    #pep       = null;
    #daps      = null;

    #inboxSocket = null;
    #ecosystems  = Object.create(null);

    async initialize(options = {}) {
        util.assert(options.app, 'expected app to be enabled');
        util.assert(options.server, 'expected server to be enabled');
        util.assert(options.io, 'expected io to be enabled');
        util.assert(options.sessions, 'expected sessions to be enabled');
        util.assert(options.event, 'expected event to be enabled');
        util.assert(options.domain, 'expected domain to be enabled');
        util.assert(options.amec, 'expected amec to be enabled');

        await super.initialize(options);

        if (options.scheduler) {
            if (options.scheduler instanceof Scheduler) {
                this.#scheduler = options.scheduler;
            } else {
                const schedulerOptions = util.isObject(options.scheduler) && options.scheduler || {};
                this.#scheduler        = new Scheduler(schedulerOptions);
            }
            this.#scheduler.on('error', (...args) => this.emit('scheduler_error', ...args));
            this.#scheduler.on('idle', (...args) => this.emit('scheduler_idle', ...args));
            this.#scheduler.on('addTask', (...args) => this.emit('scheduler_addTask', ...args));
            this.#scheduler.on('removeTask', (...args) => this.emit('scheduler_removeTask', ...args));
            this.#scheduler.on('beforeTaskExecution', (...args) => this.emit('scheduler_beforeTaskExecution', ...args));
            this.#scheduler.on('afterTaskExecution', (...args) => this.emit('scheduler_afterTaskExecution', ...args));
            this.#scheduler.on('taskExecutionError', (...args) => this.emit('scheduler_taskExecutionError', ...args));
            this.#scheduler.on('isProper', (...args) => this.emit('scheduler_isProper', ...args));
        }

        if (options.pep) {
            if (options.pep instanceof PEP) {
                this.#pep = options.pep;
            } else {
                const pepOptions = util.isObject(options.pep) && options.pep || {};
                if (!pepOptions.id) pepOptions.id = this.uri + 'pep/';
                this.#pep = new PEP(pepOptions);
            }
        }

        if (options.daps) {
            if (options.daps instanceof DAPS) {
                this.#daps = options.daps;
            } else {
                const dapsOptions = util.isObject(options.daps) && options.daps || {};
                if (!dapsOptions.id) dapsOptions.id = this.uri + 'daps/';
                if (!dapsOptions.rootUri) dapsOptions.rootUri = this.uri + 'domain/user#';
                if (!dapsOptions.jwt_payload_iss) dapsOptions.jwt_payload_iss = this.url;
                if (!dapsOptions.domain) dapsOptions.domain = this.domain;
                this.#daps = new DAPS(dapsOptions);
            }
        }

        return this;
    } // TestbedAgent#initialize

    get id() {
        return this.uri;
    }

    get ecosystems() {
        return this.#ecosystems;
    }

    get ec() {
        return this.ecosystems;
    }

    get inboxSocket() {
        return this.#inboxSocket;
    }

    set inboxSocket(socket) {
        util.assert(!this.#inboxSocket, 'inboxSocket already declared');
        this.#inboxSocket = socket;
    }

    get testsuite_inbox_socket() {
        return this.inboxSocket;
    }

    set testsuite_inbox_socket(value) {
        this.inboxSocket = value;
    }

    get scheduler() {
        return this.#scheduler;
    }

    get PEP() {
        return this.#pep;
    }

    get DAPS() {
        return this.#daps;
    }

    async authenticate(headers, mechanism) {
        return await this.amec.authenticate(headers, mechanism);
    } // TestbedAgent#authenticate

    inbox(message) {
        util.assert(this.io, 'not yet initialized');
        // FIXME nothing is emitted
        if (this.#inboxSocket) this.#inboxSocket.emit();
        return this;
    } // TestbedAgent#inbox

    async executeTest({ec: ecId, command: cmdId, param}) {
        util.assert(this.io, 'not yet initialized');
        const ecosystem = this.#ecosystems[ecId];
        util.assert(util.isObject(ecosystem), 'expected ecosystem to be an object');
        const command = ecosystem[cmdId];
        util.assert(util.isFunction(command), 'expected command to be a function');
        const result = await command(param);
        return result;
    } // TestbedAgent#executeTest

} // TestbedAgent

module.exports = TestbedAgent;
