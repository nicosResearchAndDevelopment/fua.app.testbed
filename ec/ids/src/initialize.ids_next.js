const
    path             = require('path'),
    fs               = require('fs'),
    EventEmitter     = require('events'),
    io_client        = require('socket.io-client'),
    {RunningProcess} = require('@nrd/fua.module.subprocess'),
    util             = require('../../../src/code/util.testbed.js'),
    TestbedAgent     = require('../../../src/code/agent.testbed.js'),
    EC_NAME          = 'ids';

module.exports = async function initializeIDS(
    {
        'agent': agent
    } = {}
) {
    util.assert(agent instanceof TestbedAgent, 'expected agent to be a TestbedAgent');
    util.assert(!agent.ecosystems[EC_NAME], 'expected ecosystem ' + EC_NAME + ' not to be initialized already');

    agent.ecosystems[EC_NAME] = 'initializing';

    const
        aliceNode = await agent.space.getNode('https://alice.nicos-rd.com/').load(),
        bobNode   = await agent.space.getNode('https://bob.nicos-rd.com/').load(),
        NODE      = RunningProcess('node', {verbose: true, cwd: __dirname}),
        ec_ids    = {
            uri:       `${agent.uri}ec/ids/`,
            emitter:   new EventEmitter(),
            processes: new Map(),
            sockets:   new Map()
        };

    if (aliceNode.type) {
        const
            aliceConfig       = {
                id:           aliceNode.id,
                schema:       aliceNode.getLiteral('fua:schema').value,
                host:         aliceNode.getLiteral('fua:host').value,
                port:         parseInt(aliceNode.getLiteral('fua:port').value),
                SKIAKI:       aliceNode.getLiteral('dapsm:skiaki').value,
                idle_timeout: parseInt(aliceNode.getLiteral('idsecm:idle_timeout').value),
                DAPS:         {
                    default: aliceNode.getNode('idsecm:daps_default').id
                }
            },
            aliceBase64Config = Buffer.from(JSON.stringify(aliceConfig)).toString('base64'),
            aliceProc         = NODE(`./rc_next/launch.rc.alice.js`, {config: `"${aliceBase64Config}"`}),
            aliceUrl          = `${aliceConfig.schema}://${aliceConfig.host}:${aliceConfig.port}/`,
            aliceSocket       = io_client(aliceUrl, {
                reconnect:          true,
                rejectUnauthorized: false,
                auth:               {
                    user:     'tb_ec_ids',
                    password: 'marzipan'
                }
            });

        aliceSocket.on('connect', () => {
            aliceSocket.on('event', (event) => ec_ids.emitter.emit('event', event));
            aliceSocket.on('error', (error) => ec_ids.emitter.emit('error', error));
        });

        ec_ids.processes.set(aliceUrl, aliceProc);
        ec_ids.sockets.set(aliceUrl, aliceSocket);
    } // if (aliceNode.type)

    if (bobNode.type) {
        const
            bobConfig       = {
                id:           bobNode.id,
                schema:       bobNode.getLiteral('fua:schema').value,
                host:         bobNode.getLiteral('fua:host').value,
                port:         parseInt(bobNode.getLiteral('fua:port').value),
                SKIAKI:       bobNode.getLiteral('dapsm:skiaki').value,
                idle_timeout: parseInt(bobNode.getLiteral('idsecm:idle_timeout').value),
                DAPS:         {
                    default: bobNode.getNode('idsecm:daps_default').id
                }
            },
            bobBase64Config = Buffer.from(JSON.stringify(bobConfig)).toString('base64'),
            bobProc         = NODE(`./rc_next/launch.rc.bob.js`, {config: `"${bobBase64Config}"`}),
            bobUrl          = `${bobConfig.schema}://${bobConfig.host}:${bobConfig.port}/`,
            bobSocket       = io_client(bobUrl, {
                reconnect:          true,
                rejectUnauthorized: false,
                auth:               {
                    user:     'tb_ec_ids',
                    password: 'marzipan'
                }
            });

        bobSocket.on('connect', () => {
            bobSocket.on('event', (event) => ec_ids.emitter.emit('event', event));
            bobSocket.on('error', (error) => ec_ids.emitter.emit('error', error));
        });

        ec_ids.processes.set(bobUrl, bobProc);
        ec_ids.sockets.set(bobUrl, bobSocket);
    } // if (bobNode.type)

    ec_ids.emitter.on('event', (event) => {
        agent.events.emit(event);
    });
    ec_ids.emitter.on('error', (err) => {
        util.logError(err);
        debugger;
    });

    ec_ids.refreshDAT = async function (param) {
        try {
            const socket = ec_ids.sockets.get(param.rc);
            util.assert(socket, 'expected to find a socket for ' + param.rc);
            const result = await util.promisify(socket.emit.bind(socket), 'refreshDAT', param);
            return result;
        } catch (err) {
            ec_ids.emitter.emit('error', err);
            throw err;
        }
    }; // ec_ids.refreshDAT

    // TODO other methods

    agent.ecosystems[EC_NAME] = Object.freeze(ec_ids);
    util.lockProp(agent.ecosystems, EC_NAME);

    return ec_ids;
}; // module.exports = async function initializeIDS
