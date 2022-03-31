const
    path             = require('path'),
    EventEmitter     = require('events'),
    socket_io_client = require('socket.io-client'),
    util             = require('./util.testsuite.js'),
    {Space}          = require('@nrd/fua.module.space'),
    Amec             = require('@nrd/fua.agent.amec'),
    {Domain}         = require('@nrd/fua.agent.domain/beta');

class TestsuiteAgent {

    static id = 'http://www.nicos-rd.com/fua/testbed#TestsuiteAgent';

    static async create(options) {
        const agent = new TestsuiteAgent(options);
        return await agent.initialize();
    } // TestsuiteAgent.create

    #eventEmitter = new EventEmitter();
    #id           = '';
    #prefix       = '';
    #space        = null;
    #amec         = null;
    #tbSocketUrl  = '';
    #tbSocket     = null;
    #tbEmit       = null;

    #initState     = -1;
    #testsuiteNode = null;
    #domainNode    = null;
    #domain        = null;

    #testcases = null;

    constructor({
                    id:      id = '',
                    prefix:  prefix = 'ts',
                    testbed: testbed,
                    space:   space,
                    amec:    amec
                }) {

        util.assert(util.isString(id) && id.length > 0, 'expected id to be a non empty string');
        util.assert(util.isString(prefix) && prefix.length > 0, 'expected prefix to be a non empty string');
        util.assert(util.isObject(testbed), 'expected testbed to be an object');
        util.assert(util.isString(testbed.schema), 'expected testbed.schema to be a string');
        util.assert(util.isString(testbed.host), 'expected testbed.host to be a string');
        util.assert(util.isString(testbed.port) || util.isInteger(testbed.port), 'expected testbed.port to be a string or an integer');
        util.assert(util.isNull(testbed.options) || util.isObject(testbed.options), 'expected testbed.options to be an object or null');
        util.assert(util.isNull(space) || (space instanceof Space), 'expected space to be an instance of Space');
        util.assert(util.isNull(amec) || (amec instanceof Amec), 'expected amec to be an instance of Amec');

        this.#id          = id;
        this.#prefix      = prefix;
        this.#space       = space || null;
        this.#amec        = amec || null;
        this.#tbSocketUrl = `${testbed.schema}://${testbed.host}:${testbed.port}/execute`;
        this.#tbSocket    = socket_io_client(this.#tbSocketUrl, testbed.options);
        this.#tbEmit      = util.promisify(this.#tbSocket.emit).bind(this.#tbSocket);

        this.#tbSocket.on('connect', () => {
            this.#tbEmit('subscribe', {room: 'event'});
            this.#eventEmitter.emit('testbed_socket_connect');
        });

        this.#tbSocket.on('error', (error) => {
            if (util.isString(error)) error = new Error(error);
            else if (!(error instanceof Error) && util.isString(error?.message)) error = new Error(error.message);
            util.logError(error);
            this.#eventEmitter.emit('error', error);
        });

        // TODO the (error, result) pattern should only be used in acknowledge callbacks, not in events
        this.#tbSocket.on('event', (error, data) => {
            if (error) {
                if (util.isString(error)) error = new Error(error);
                else if (util.isString(error?.message)) error = new Error(error.message);
                util.logError(error);
                this.#eventEmitter.emit('error', error);
            } else {
                util.logObject(data);
                this.#eventEmitter.emit('data', data);
            }
        });

    } // TestsuiteAgent#constructor

    get initialized() {
        return this.#initState > 0;
    }

    async initialize() {
        util.assert(this.#initState < 0, 'already initialized');
        this.#initState = 0;

        if (this.#space) {
            this.#testsuiteNode = this.#space.getNode(this.#id);
            await this.#testsuiteNode.load();

            this.#domainNode = this.#testsuiteNode.getNode('ecm:domain');
            await this.#domainNode.load();

            this.#domain = new Domain({
                config: this.#domainNode,
                amec:   this.#amec,
                space:  this.#space
            });
        }

        this.#initState = 1;
        return this;
    } // TestsuiteAgent#initialize

    get id() {
        return this.#id;
    }

    get prefix() {
        return this.#prefix;
    }

    on(event, callback) {
        this.#eventEmitter.on(event, callback);
        return this;
    } // TestsuiteAgent#on

    once(event, callback) {
        this.#eventEmitter.once(event, callback);
        return this;
    } // TestsuiteAgent#once

    off(event, callback) {
        this.#eventEmitter.off(event, callback);
        return this;
    } // TestsuiteAgent#off

    get amec() {
        return this.#amec;
    }

    get domain() {
        return this.#domain;
    }

    get space() {
        return this.#space;
    }

    get testbed_connected() {
        return this.#tbSocket && this.#tbSocket.connected;
    }

    get testcases() {
        return this.#testcases;
    }

    set testcases(testcases) {
        util.assert(!this.#testcases, 'testcases are already defined');
        util.assert(util.isObject(testcases), 'expected testcases to be an object');
        const _testcases = Object.create(null);
        for (let [ecName, ecosystem] of Object.entries(testcases)) {
            for (let [fnName, tcFunction] of Object.entries(ecosystem)) {
                const fnPath = `${ecName}/${fnName}`;
                util.assert(!(fnPath in _testcases), 'expected function path to be unique');
                _testcases[fnPath] = tcFunction;
                if (tcFunction.id && _testcases[tcFunction.id] !== tcFunction) {
                    util.assert(!(tcFunction.id in _testcases), 'expected function id to be unique');
                    _testcases[tcFunction.id] = tcFunction;
                }
                if (tcFunction.urn && _testcases[tcFunction.urn] !== tcFunction) {
                    util.assert(!(tcFunction.urn in _testcases), 'expected function urn to be unique');
                    _testcases[tcFunction.urn] = tcFunction;
                }
            }
        }
        this.#testcases = _testcases;
    }

    async test(token, data) {
        util.assert(this.#initState > 0, 'not yet initialized');
        const
            testToken               = {id: token.id, start: token.start, thread: []},
            [testError, testResult] = await this.#tbEmit('test', testToken, data);

        if (util.isString(testError)) {
            util.assert(testError === token.id, 'expected testError to be the token id');
        } else if (util.isObject(testError)) {
            util.assert(testError.id === token.id, 'expected testError id to be the token id');
            if (util.isArray(testError.thread)) token.thread.concat(testError.thread);
        }

        data.testResult = testResult;
        return {token, data};
    } // TestsuiteAgent#test

    async enforce(token, data) {
        util.assert(this.#initState > 0, 'not yet initialized');
        const tcFunction = this.#testcases[data.testCase];
        util.assert(tcFunction, 'testcase function not found');
        try {
            const result                = await tcFunction(token, data);
            data.validationResult.value = 'PASS';
            return result;
        } catch (err) {
            data.validationResult.value = 'FAIL';
            throw err;
        }
    } // TestsuiteAgent#enforce

    Token({
              id:     id = `${this.#id}token/${util.uuid.v1()}`,
              start:  start = util.dateTime(),
              thread: thread = []
          }) {
        util.assert(this.#initState > 0, 'not yet initialized');
        return {
            id:     id,
            type:   [`${this.#prefix}:Token`],
            start:  start,
            thread: util.toArray(thread)
        };
    } // TestsuiteAgent#Token

} // TestsuiteAgent

module.exports = TestsuiteAgent;
