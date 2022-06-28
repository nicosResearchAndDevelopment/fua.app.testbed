const
    EventEmitter     = require('events'),
    io_client        = require('socket.io-client'),
    {RunningProcess} = require('@nrd/fua.module.subprocess'),
    util             = require('../../../src/code/util.testbed.js'),
    TestbedAgent     = require('../../../src/code/agent.testbed.js'),
    NODE             = RunningProcess('node', {verbose: true, cwd: __dirname});

class EcosystemIDS {

    static ecName = 'ids';

    #agent     = null;
    #emitter   = new EventEmitter();
    #processes = Object.create(null);
    #sockets   = Object.create(null);

    constructor(agent) {
        util.assert(agent instanceof TestbedAgent, 'expected agent to be a TestbedAgent');
        this.#agent = agent;
    } // EcosystemIDS#constructor

    get uri() {
        return this.#agent.uri + 'ec/ids/';
    } // EcosystemIDS#uri

    on(eventName, listener) {
        this.#emitter.on(eventName, listener);
        return this;
    } // EcosystemIDS#on

    once(eventName, listener) {
        this.#emitter.once(eventName, listener);
        return this;
    } // EcosystemIDS#once

    off(eventName, listener) {
        this.#emitter.off(eventName, listener);
        return this;
    } // EcosystemIDS#off

    async startRC(rcLauncher, rcConfig) {
        util.assert(util.isString(rcLauncher), 'expected rcLauncher to be a string');
        util.assert(util.isObject(rcConfig), 'expected rcConfig to be an object');
        // TODO validate config

        const
            base64Config = Buffer.from(JSON.stringify(rcConfig)).toString('base64'),
            rcUrl        = `${rcConfig.schema}://${rcConfig.host}:${rcConfig.port}/`;

        // REM use the rcUrl or use the rcConfig.id?
        util.assert(!this.#processes[rcUrl], `the url ${rcUrl} has already a running process`);

        const
            rcProcess = NODE(rcLauncher, {config: `"${base64Config}"`}),
            rcSocket  = io_client(rcUrl, {
                reconnect:          true,
                rejectUnauthorized: false,
                // TODO meaningful socket config
                auth: {
                    user:     'tb_ec_ids',
                    password: 'marzipan'
                }
            });

        rcSocket.on('event', (event) => this.#emitter.emit('event', event));
        rcSocket.on('error', (err) => this.#emitter.emit('error', err));

        this.#processes[rcUrl] = rcProcess;
        this.#sockets[rcUrl]   = rcSocket;

        await new Promise((resolve, reject) => {
            let onConnect, onError;
            onConnect = () => {
                rcSocket.off(onError);
                resolve();
            };
            onError   = (err) => {
                rcSocket.off(onConnect);
                reject(err);
            };
            rcSocket.once('connect', onConnect);
            rcSocket.once('error', onError);
        });
    } // EcosystemIDS#callMethod

    async callRC(rcId, method, param) {
        util.assert(util.isString(rcId), 'expected rcId to be a string');
        util.assert(util.isString(method), 'expected method to be a string');
        util.assert(util.isObject(param), 'expected param to be an object');
        try {
            const socket = this.#sockets[rcId];
            util.assert(socket, 'expected to find a socket for ' + param.rc);
            const result = await util.promisify(socket.emit.bind(socket), method, param);
            return result;
        } catch (err) {
            this.#emitter.emit('error', err);
            throw err;
        }
    } // EcosystemIDS#callRC

    async refreshDAT({rc: rcId, ...param}) {
        return await this.callRC(rcId, 'refreshDAT', param);
    } // EcosystemIDS#refreshDAT

    async requestApplicantsSelfDescription({rc: rcId, ...param}) {
        return await this.callRC(rcId, 'requestApplicantsSelfDescription', param);
    } // EcosystemIDS#requestApplicantsSelfDescription

    async waitForApplicantsSelfDescriptionRequest({rc: rcId, ...param}) {
        return await this.callRC(rcId, 'waitForApplicantsSelfDescriptionRequest', param);
    } // EcosystemIDS#waitForApplicantsSelfDescriptionRequest

    async getSelfDescriptionFromRC({rc: rcId, ...param}) {
        return await this.callRC(rcId, 'getSelfDescriptionFromRC', param);
    } // EcosystemIDS#getSelfDescriptionFromRC

} // EcosystemIDS
