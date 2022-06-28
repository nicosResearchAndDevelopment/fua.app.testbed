const
    EventEmitter     = require('events'),
    io_client        = require('socket.io-client'),
    {RunningProcess} = require('@nrd/fua.module.subprocess'),
    util             = require('../../../src/code/util.testbed.js'),
    NODE             = RunningProcess('node', {verbose: true, cwd: __dirname});

class RemoteComponent {

    #id           = '';
    #url          = '';
    #launchFile   = '';
    #base64Config = '';

    #emitter    = new EventEmitter();
    #process    = null;
    #socket     = null;
    #socketEmit = null;

    constructor(launchFile, launchConfig) {
        util.assert(util.isString(launchFile), 'expected launchFile to be a string');
        util.assert(util.isObject(launchConfig), 'expected launchConfig to be an object');
        // TODO validate launchConfig

        this.#url = `${launchConfig.schema}://${launchConfig.host}:${launchConfig.port}/`;
        // REM use this.#url or use launchConfig.id for this.#id?
        this.#id  = this.#url;

        this.#launchFile   = launchFile;
        this.#base64Config = Buffer.from(JSON.stringify(launchConfig)).toString('base64');
    } // RemoteComponent#constructor

    get id() {
        return this.#id;
    } // RemoteComponent#id

    async start() {
        util.assert(!this.#process, 'already started');

        this.#process = NODE(this.#launchFile, {config: `"${this.#base64Config}"`});

        await new Promise((resolve, reject) => {
            let onSpawn, onError;
            this.#process.once('spawn', onSpawn = () => {
                this.#process.off(onError);
                resolve();
            });
            this.#process.once('error', onError = (err) => {
                this.#process.off(onSpawn);
                reject(err);
            });
        });
    } // RemoteComponent#initialize

    async connect(socketConfig = {}) {
        util.assert(this.#process, 'not started yet');
        util.assert(!this.#socket, 'already connected');

        this.#socket     = io_client(this.#url, socketConfig);
        this.#socketEmit = util.promify(this.#socket.emit).bind(this.#socket);

        this.#socket.on('event', (event) => this.#emitter.emit('event', event));
        this.#socket.on('error', (err) => this.#emitter.emit('error', err));

        await new Promise((resolve, reject) => {
            let onConnect, onError;
            this.#socket.once('connect', onConnect = () => {
                this.#socket.off(onError);
                resolve();
            });
            this.#socket.once('error', onError = (err) => {
                this.#socket.off(onConnect);
                reject(err);
            });
        });
    } // RemoteComponent#initialize

    on(eventName, listener) {
        this.#emitter.on(eventName, listener);
        return this;
    } // RemoteComponent#on

    once(eventName, listener) {
        this.#emitter.once(eventName, listener);
        return this;
    } // RemoteComponent#once

    off(eventName, listener) {
        this.#emitter.off(eventName, listener);
        return this;
    } // RemoteComponent#off

    async callMethod(method, param) {
        util.assert(util.isString(method), 'expected method to be a string');
        util.assert(util.isObject(param), 'expected param to be an object');
        try {
            const result = await this.#socketEmit(method, param);
            this.#emitter.emit('result', result);
            return result;
        } catch (err) {
            this.#emitter.emit('error', err);
            throw err;
        }
    } // RemoteComponent#callMethod

} // RemoteComponent

class EcosystemIDS {

    #emitter          = new EventEmitter();
    #remoteComponents = new Map();

    async createRemoteComponent(launchFile, launchConfig) {
        const remoteComponent = new RemoteComponent(launchFile, launchConfig);
        util.assert(!this.#remoteComponents.has(remoteComponent.id), `the RC ${remoteComponent.id} has already been created`);
        try {
            this.#remoteComponents.set(remoteComponent.id, remoteComponent);

            await remoteComponent.start();
            await remoteComponent.connect({
                reconnect:          true,
                rejectUnauthorized: false,
                // TODO meaningful socket config
                auth: {
                    user:     'tb_ec_ids',
                    password: 'marzipan'
                }
            });

            remoteComponent
                .on('event', (event) => this.#emitter.emit('event', event))
                .on('result', (result) => this.#emitter.emit('result', result))
                .on('error', (err) => this.#emitter.emit('error', err));
        } catch (err) {
            this.#remoteComponents.delete(remoteComponent.id);
            throw err;
        }
    } // EcosystemIDS#startRemoteComponent

    async callRemoteMethod(remoteId, method, param) {
        util.assert(util.isString(remoteId), 'expected remoteId to be a string');
        util.assert(util.isString(method), 'expected method to be a string');
        util.assert(util.isObject(param), 'expected param to be an object');
        const remoteComponent = this.#remoteComponents.get(remoteId);
        util.assert(remoteComponent, 'expected to find a remote for ' + remoteId);
        return await remoteComponent.callMethod(method, param);
    } // EcosystemIDS#callRemoteMethod

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

    async refreshDAT({rc: remoteId, ...param}) {
        return await this.callRemoteMethod(remoteId, 'refreshDAT', param);
    } // EcosystemIDS#refreshDAT

    async requestApplicantsSelfDescription({rc: remoteId, ...param}) {
        return await this.callRemoteMethod(remoteId, 'requestApplicantsSelfDescription', param);
    } // EcosystemIDS#requestApplicantsSelfDescription

    async waitForApplicantsSelfDescriptionRequest({rc: remoteId, ...param}) {
        return await this.callRemoteMethod(remoteId, 'waitForApplicantsSelfDescriptionRequest', param);
    } // EcosystemIDS#waitForApplicantsSelfDescriptionRequest

    async getSelfDescriptionFromRC({rc: remoteId, ...param}) {
        return await this.callRemoteMethod(remoteId, 'getSelfDescriptionFromRC', param);
    } // EcosystemIDS#getSelfDescriptionFromRC

} // EcosystemIDS

module.exports = EcosystemIDS;
