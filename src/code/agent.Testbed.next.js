const
    path         = require('path'),
    EventEmitter = require('events'),
    util         = require('./util.testbed.js'),
    {Space}      = require('@nrd/fua.module.space'),
    Amec         = require('@nrd/fua.agent.amec'),
    {Scheduler}  = require(path.join(util.FUA_JS_LIB, 'agent.Scheduler/src/agent.Scheduler.js')),
    {Domain}     = require(path.join(util.FUA_JS_LIB, 'agent.Domain/src/agent.Domain.beta.js')),
    {PEP}        = require('@nrd/fua.decide.pep');

class TestbedAgent {

    #eventEmitter = new EventEmitter();
    #id           = '';
    #space        = null;
    #amec         = null;
    #scheduler    = null;

    #initState   = -1;
    #testbedNode = null;
    #domainNode  = null;
    #pep         = null;
    #domain      = null;

    #inboxSocket = null;

    constructor({
                    testbed_id:   id = 'asdf',
                    space:        space,
                    amec:         amec,
                    scheduler:    schedulerOptions,
                    daps:         daps = null,
                    encodeSecret: encodeSecret = undefined
                }) {

        util.assert(util.isString(id) && id.length > 0, 'expected id to be a non empty string');
        util.assert(space instanceof Space, 'expected space to be an instance of Space');
        util.assert(amec instanceof Amec, 'expected amec to be an instance of Amec');
        util.assert(util.isNotNull(schedulerOptions), 'expected scheduler to be not null');

        this.#id        = id;
        this.#space     = space;
        this.#amec      = amec;
        this.#scheduler = new Scheduler(schedulerOptions);

    } // TestbedAgent#constructor

    get initialized() {
        return this.#initState > 0;
    }

    async initialize() {
        util.assert(this.#initState < 0, 'already initialized');
        this.#initState = 0;

        this.#testbedNode = this.#space.getNode(this.#id);
        await this.#testbedNode.load();

        this.#domainNode = this.#testbedNode.getNode('ecm:domain');
        await this.#domainNode.load();

        this.#pep = new PEP({
            id: id + 'PEP'
        });

        this.#domain = new Domain({
            config: this.#domainNode,
            amec:   this.#amec,
            space:  this.#space
        });

        this.#initState = 1;
        return this;
    } // TestbedAgent#initialize

    get id() {
        return this.#id;
    }

    get inboxSocket() {
        return this.#inboxSocket;
    }

    set inboxSocket(socket) {
        util.assert(!this.#inboxSocket, 'inboxSocket already declared');
        this.#inboxSocket = socket;
    }

    on(event, callback) {
        this.#eventEmitter.on(event, callback);
        return this;
    }

    get scheduler() {
        return this.#scheduler;
    }

    get amec() {
        return this.#scheduler;
    }

    get PEP() {
        return this.#pep;
    }

    get domain() {
        return this.#domain;
    }

    get space() {
        return this.#space;
    }

} // TestbedAgent

module.exports = TestbedAgent;
