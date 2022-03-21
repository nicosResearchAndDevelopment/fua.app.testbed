const
    path         = require('path'),
    EventEmitter = require('events'),
    util         = require('./util.testbed.js'),
    {Space}      = require('@nrd/fua.module.space'),
    Amec         = require('@nrd/fua.agent.amec'),
    {Scheduler}  = require(path.join(util.FUA_JS_LIB, 'agent.Scheduler/src/agent.Scheduler.js')),
    {Domain}     = require(path.join(util.FUA_JS_LIB, 'agent.Domain/src/agent.Domain.beta.js')),
    {PEP}        = require('@nrd/fua.decide.pep');

function _addEcNet(ec) {
    const {net} = require('../../ec/net/src/tb.ec.net.js');
    net.on('event', (error, data) => {
        eventEmitter.emit('event', error, data);
        debugger;
    });
    net.on('error', (error) => {
        //eventEmitter.emit('event', error, data);
        debugger;
    });
    ec['net'] = net;
    Object.freeze(ec['net']);
} // _addEcNet

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
    #ecosystems  = Object.create(null);

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

        this.#scheduler.on('error', (...args) => this.#eventEmitter.emit('scheduler_error', ...args));
        this.#scheduler.on('idle', (...args) => this.#eventEmitter.emit('scheduler_idle', ...args));
        this.#scheduler.on('addTask', (...args) => this.#eventEmitter.emit('scheduler_addTask', ...args));
        this.#scheduler.on('removeTask', (...args) => this.#eventEmitter.emit('scheduler_removeTask', ...args));
        this.#scheduler.on('beforeTaskExecution', (...args) => this.#eventEmitter.emit('scheduler_beforeTaskExecution', ...args));
        this.#scheduler.on('afterTaskExecution', (...args) => this.#eventEmitter.emit('scheduler_afterTaskExecution', ...args));
        this.#scheduler.on('taskExecutionError', (...args) => this.#eventEmitter.emit('scheduler_taskExecutionError', ...args));
        this.#scheduler.on('isProper', (...args) => this.#eventEmitter.emit('scheduler_isProper', ...args));

        this
            .on('scheduler_idle', (data) => {
                util.logObject(data);
                //debugger;
            })
            .on('scheduler_error', (error) => {
                util.logError(data);
                //debugger;
            });

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

    async initializeNet() {
        if (this.#ecosystems.net) return this;
        const {net} = require('../../ec/net/src/tb.ec.net.js');
        net.uri     = `${this.#id}ec/net/`;
        net.on('event', (error, data) => {
            if (error) util.logError(error);
            else util.logObject(data);
            // this.#eventEmitter.emit('event', error, data);
            debugger;
        });
        net.on('error', (error) => {
            util.logError(error);
            // this.#eventEmitter.emit('error', error);
            debugger;
        });
        this.#ecosystems.net = Object.freeze(net);
        util.lockProp(this.#ecosystems, 'net');
        return this;
    } // TestbedAgent#initializeNet

    async initializeIDS() {
        if (this.#ecosystems.ids) return this;
        const
            aliceNode = await space.getNode('https://alice.nicos-rd.com/').load(),
            bobNode   = await space.getNode('https://bob.nicos-rd.com/').load(),
            ids       = require('../../ec/ids/src/tb.ec.ids.js')({
                'uri':   `${this.#id}ec/ids/`,
                'ALICE': {
                    'id':     aliceNode.id,
                    'schema': aliceNode.getLiteral('fua:schema').value,
                    'host':   aliceNode.getLiteral('fua:host').value,
                    'port':   parseInt(aliceNode.getLiteral('fua:port').value),
                    'SKIAKI': aliceNode.getLiteral('dapsm:skiaki').value,
                    //
                    'user':         {
                        'tb_ec_ids': {'name': 'tb_ec_ids', 'password': 'marzipan'}
                    },
                    'idle_timeout': parseInt(aliceNode.getLiteral('idsecm:idle_timeout').value),
                    'DAPS':         {
                        'default': aliceNode.getNode('idsecm:daps_default').id
                    },
                    // 'cert_client':  'C:/fua/DEVL/js/app/nrd-testbed/ec/ids/src/rc/alice/cert/index.js'
                    'cert_client': path.join(__dirname, '../../ec/ids/src/rc/alice/cert/index.js')
                }, // ALICE
                'BOB':   {
                    'id':     bobNode.id,
                    'schema': bobNode.getLiteral('fua:schema').value,
                    'host':   bobNode.getLiteral('fua:host').value,
                    'port':   parseInt(bobNode.getLiteral('fua:port').value),
                    'SKIAKI': bobNode.getLiteral('dapsm:skiaki').value,
                    //
                    'user': {
                        'tb_ec_ids': {'name': 'tb_ec_ids', 'password': 'marzipan'}
                    },
                    //
                    'idle_timeout': parseInt(bobNode.getLiteral('idsecm:idle_timeout').value),
                    //'idle_timeout': 1,
                    //
                    'DAPS': {
                        'default': bobNode.getNode('idsecm:daps_default').id
                    },
                    // 'cert_client': 'C:/fua/DEVL/js/app/nrd-testbed/ec/ids/src/rc/bob/cert/index.js'
                    'cert_client': path.join(__dirname, '../../ec/ids/src/rc/bob/cert/index.js')
                }
            });
        ids.uri       = `${this.#id}ec/ids/`;
        ids.ec        = this.#ecosystems;
        ids.on('event', (error, data) => {
            // if (error) util.logError(error);
            // else util.logObject(data);
            this.#eventEmitter.emit('event', error, data);
            //debugger;
        });
        ids.on('error', (error) => {
            // util.logError(error);
            this.#eventEmitter.emit('error', error);
            //debugger;
        });
        this.#ecosystems.net = Object.freeze(net);
        util.lockProp(this.#ecosystems, 'ids');
        return this;
    } // TestbedAgent#initializeIDS

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

    inbox(message) {
        util.assert(this.#initState > 0, 'not yet initialized');
        // FIXME nothing is emitted
        if (this.#inboxSocket) this.#inboxSocket.emit();
        return this;
    } // TestbedAgent#inbox

    async executeTest({ec: ecId, command: cmdId, param}) {
        util.assert(this.#initState > 0, 'not yet initialized');
        const ecosystem = this.#ecosystems[ecId];
        util.assert(util.isObject(ecosystem), 'expected ecosystem to be an object');
        const command = ecosystem[cmdId];
        util.assert(util.isFunction(command), 'expected command to be a function');
        return await command(param);
    } // TestbedAgent#executeTest

} // TestbedAgent

module.exports = TestbedAgent;
