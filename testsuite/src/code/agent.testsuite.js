const
    path             = require('path'),
    util             = require('./util.testsuite.js'),
    ServerAgent      = require('@nrd/fua.agent.server'),
    socket_io_client = require('socket.io-client');

class TestsuiteAgent extends ServerAgent {

    static id = 'http://www.nicos-rd.com/fua/testbed#TestsuiteAgent';

    #prefix          = '';
    #tbSocketUrl     = '';
    #tbSocketOptions = null;
    #tbSocket        = null;
    #tbEmit          = null;
    #testcases       = null;

    constructor(options = {}) {
        util.assert(util.isString(options.prefix) && options.prefix.length > 0, 'expected prefix to be a non empty string');
        util.assert(util.isObject(options.testbed), 'expected testbed to be an object');
        util.assert(util.isString(options.testbed.schema), 'expected testbed.schema to be a string');
        util.assert(util.isString(options.testbed.host), 'expected testbed.host to be a string');
        util.assert(util.isString(options.testbed.port) || util.isInteger(options.testbed.port), 'expected testbed.port to be a string or an integer');
        util.assert(util.isNull(options.testbed.options) || util.isObject(options.testbed.options), 'expected testbed.options to be an object or null');

        super(options);

        this.#prefix          = options.prefix;
        this.#tbSocketUrl     = `${options.testbed.schema}://${options.testbed.host}:${options.testbed.port}/execute`;
        this.#tbSocketOptions = options.testbed.options || {};
    } // TestsuiteAgent#constructor

    async initialize(options = {}) {
        await super.initialize(options);

        this.#tbSocket = socket_io_client(this.#tbSocketUrl, this.#tbSocketOptions);
        this.#tbEmit   = util.promisify(this.#tbSocket.emit).bind(this.#tbSocket);

        this.#tbSocket.on('connect', () => {
            this.#tbEmit('subscribe', {room: 'event'});
            this.emit('testbed_socket_connect');
        });

        this.#tbSocket.on('error', (error) => {
            if (util.isString(error)) error = new Error(error);
            else if (!(error instanceof Error) && util.isString(error?.message)) error = new Error(error.message);
            // util.logError(error);
            this.emit('error', error);
        });

        this.#tbSocket.on('event', (event) => {
            // util.logObject(event);
            this.emit('event', event);
        });

        // TODO evaluate if it is actually better to not wait for the connect event
        await new Promise((resolve, reject) => {
            let onError, onConnect;
            this.#tbSocket.once('connect', onConnect = () => {
                this.#tbSocket.off(onError);
                resolve();
            });
            this.#tbSocket.once('error', onError = (err) => {
                this.#tbSocket.off(onConnect);
                reject(err);
            });
        });

        return this;
    } // TestsuiteAgent#initialize

    get id() {
        return this.uri;
    }

    get prefix() {
        return this.#prefix;
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
        util.assert(this.#tbSocket, 'expected testbed socket to be defined');
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
        util.assert(this.#tbSocket, 'expected testbed socket to be defined');
        util.assert(this.#testcases, 'expected testcases to be defined');
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
              id:     id = `${this.uri}token/${util.uuid.v1()}`,
              start:  start = util.dateTime(),
              thread: thread = []
          }) {
        return {
            id:     id,
            type:   [`${this.#prefix}:Token`],
            start:  start,
            thread: util.toArray(thread)
        };
    } // TestsuiteAgent#Token

} // TestsuiteAgent

module.exports = TestsuiteAgent;
