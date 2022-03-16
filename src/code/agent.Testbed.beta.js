const
    path         = require('path'),
    EventEmitter = require('events'),
    //
    util         = require('@nrd/fua.core.util'),
    uuid         = require("@nrd/fua.core.uuid"),
    rdf          = require('@nrd/fua.module.rdf'),
    //{Self}      = require(path.join(util.FUA_JS_LIB, 'agent.Self/src/agent.Self.js')),
    // TODO : beta
    {Time}       = require(path.join(util.FUA_JS_LIB, 'agent.Time/src/agent.Time.js')),
    {Scheduler}  = require(path.join(util.FUA_JS_LIB, 'agent.Scheduler/src/agent.Scheduler.js')),
    {Domain}     = require(path.join(util.FUA_JS_LIB, 'agent.Domain/src/agent.Domain.beta.js')),
    // {PEP}        = require(path.join(util.FUA_JS_LIB, 'module.PEP/src/module.PEP.beta.js')),
    {PEP}        = require(path.join(util.FUA_JS_LIB, 'decide/PEP/src/decide.PEP.js')),

    //{System}    = require(path.join(util.FUA_JS_LIB, 'agent.System/src/agent.System.beta.js')),
    //{Device}    = require(path.join(util.FUA_JS_LIB, 'agent.System/src/agent.System.beta.js')),
    //{Testsuite}  = require('./agent.Testsuite.js'), // REM: as agent

    //amec         = require(path.join(util.FUA_JS_LIB, 'agent.amec/back/src/agent.amec.next.js')),
    task         = {
        'domain':    {},
        'scheduler': {
            'scheduler_error':               "scheduler_error",
            'scheduler_idle':                "scheduler_idle",
            'scheduler_addTask':             "scheduler_addTask",
            'scheduler_removeTask':          "scheduler_removeTask",
            'scheduler_beforeTaskExecution': "scheduler_beforeTaskExecution",
            'scheduler_afterTaskExecution':  "scheduler_afterTaskExecution",
            'scheduler_taskExecutionError':  "scheduler_taskExecutionError",
            'scheduler_isProper':            "scheduler_isProper"
        }
    }
    //
    //{ids}        = require("../../ec/ids/src/tb.ec.ids.js"),
    //{ip}         = require("../../ec/ip/src/tb.ec.ip.beta.js")
;

const {ip} = require("../../ec/ip/src/tb.ec.ip.js"); // const

//region ERROR
const
    ERROR_CODE_ErrorTestbedIdIsMissing            = "fua.agent.TestbedAgent.error.1",
    ERROR_CODE_ErrorTestbedUnkownCommand          = "fua.agent.TestbedAgent.error.2",
    ERROR_CODE_ErrorTestbedUnkownEcoSystem        = "fua.agent.TestbedAgent.error.3",
    ERROR_CODE_ErrorTestbedUnknownOnTopic         = "fua.agent.TestbedAgent.error.4",
    ERROR_CODE_ErrorTestbedCallbackMissingOnTopic = "fua.agent.TestbedAgent.error.5"
; // const

class ErrorTestbedIdIsMissing extends Error {
    constructor({prov: prov}) {
        super(`fua.agent.TestbedAgent : id is missing.`);
        this.id   = `${"urn:fua:agent:TestbedAgent:"}error:${uuid.v1()}`;
        this.code = ERROR_CODE_ErrorTestbedIdIsMissing;
        this.prov = prov;
        Object.freeze(this);
    }
}

class ErrorTestbedUnkownEcoSystem extends Error {
    constructor({prov: prov, ec: ec}) {
        super(`fua.agent.TestbedAgent : unknow EcoSystem <${ec}>.`);
        this.id   = `${"urn:fua:agent:TestbedAgent:"}error:${uuid.v1()}`;
        this.code = ERROR_CODE_ErrorTestbedUnkownEcoSystem;
        this.prov = prov;
        Object.freeze(this);
    }
}

class ErrorTestbedUnkownCommand extends Error {
    constructor({prov: prov, command: command}) {
        super(`fua.agent.TestbedAgent : unknow command <${command}>.`);
        this.id   = `${"urn:fua:agent:TestbedAgent:"}error:${uuid.v1()}`;
        this.code = ERROR_CODE_ErrorTestbedUnkownCommand;
        this.prov = prov;
        Object.freeze(this);
    }
}

class ErrorTestbedUnknownOnTopic extends Error {
    constructor({prov: prov, topic: topic}) {
        super(`fua.agent.TestbedAgent : unknow on topic <${topic}>.`);
        this.id   = `${"urn:fua:agent:TestbedAgent:"}error:${uuid.v1()}`;
        this.code = ERROR_CODE_ErrorTestbedUnknownOnTopic;
        this.prov = prov;
        Object.freeze(this);
    }
}

class ErrorTestbedCallbackMissingOnTopic extends Error {
    constructor({prov: prov, topic: topic}) {
        super(`fua.agent.TestbedAgent : on-callback  missing (topic <${topic}>).`);
        this.id   = `${"urn:fua:agent:TestbedAgent:"}error:${uuid.v1()}`;
        this.code = ERROR_CODE_ErrorTestbedCallbackMissingOnTopic;
        this.prov = prov;
        Object.freeze(this);
    }
}

//endregion ERROR

//region fn

//endregion fn

async function TestbedAgent({
                                testbed_id:   id = "asdf",
                                scheduler:    scheduler,
                                space:        space,
                                daps:         daps = null,
                                amec:         amec = null, // !!!
                                encodeSecret: encodeSecret = undefined
                            }) {

    const

        rootUri                = "https://testbed.nicos-rd.com/domain/user#",
        testbed_config         = space.getNode(id),
        testbed_config_data    = await testbed_config.load(),
        id_agent               = `${id}agent/`,
        implemented_task       = {
            // self topics
            'error': "error",
            'event': "event"
        },
        eventEmitter           = new EventEmitter()
    ; // const
    let
        testsuite_inbox_socket = undefined,
        testbedAgent           = {}
    ; // let

    //if (new.target) {
    if (!id)
        throw (new ErrorTestbedIdIsMissing({prov: "fua.agent.TestbedAgent.constructor"}));

    //region system
    //endregion system

    //region domain
    let
        domain_config = testbed_config.getNode('ecm:domain'),
        ec            = {}
    ;
    await domain_config.load();
    const
        pep    = new PEP({'id': `${id}PEP`}),
        domain = new Domain({
            //'id':    `${id}domain/`,
            'config': domain_config,
            'amec':   amec,
            space:    space
        })
    ;
    //endregion domain

    Object.defineProperties(testbedAgent, {
        id:                     {value: id, enumerable: true},
        testsuite_inbox_socket: {
            set(socket) {
                if (!testsuite_inbox_socket)
                    testsuite_inbox_socket = socket;
            }, enumerable: false
        },
        on:                     {
            value:              Object.defineProperties((topic, callback) => {
                    let
                        error  = null,
                        result = false
                    ;
                    try {
                        if (implemented_task[topic]) {
                            if (!!callback) {
                                eventEmitter['on'](topic, callback);
                                result = true;
                            } else {
                                error = (new ErrorTestbedCallbackMissingOnTopic({
                                    prov:  "fua.agent.TestbedAgent.on",
                                    topic: topic
                                }));
                            } // if ()
                        } else {
                            error = (new ErrorTestbedUnknownOnTopic({prov: "fua.agent.TestbedAgent.on", topic: topic}));
                        } // if ()
                    } catch (jex) {
                        throw (jex);
                    } // try
                    if (error)
                        throw (error);
                    return result;
                },
                {
                    'id': {value: `${id}on`, enumerable: true}
                }), enumerable: true
        }, // on
        scheduler:              {
            value: new Scheduler(scheduler), enumerable: true
        },
        amec:                   {
            set(amc) {
                if (amec === null)
                    amec = amc;
            }, enumerable: false
        },
        authenticate:           {
            value: async (headers, mechanism) => {
                return await amec.authenticate(headers, mechanism);
            }
        },
        PEP:                    {
            value: pep, enumerable: false
        },
        domain:                 {
            value: domain, enumerable: true
        },
        space:                  {
            value: space, enumerable: true
        },
        inbox:                  {
            value:         async (message) => {
                if (testsuite_inbox_socket)
                    testsuite_inbox_socket.emit();
                return undefined;
            }, enumerable: true
        }, // inbox
        executeTest:            {
            value:         async (data) => {
                try {
                    let
                        ec = testbedAgent['ec'][data.ec],
                        command
                    ;

                    if (!ec) {
                        throw(new ErrorTestbedUnkownEcoSystem({prov: `${id}executeTest`, ec: ec}));

                    } else {
                        command = ec[data.command];
                        if (!command) {
                            throw(new ErrorTestbedUnkownCommand({prov: `${id}executeTest`, command: command}));
                        } else {
                            let result = await command(data.param);
                            return result;
                        } // if ()
                    } // if ()
                } catch (jex) {
                    throw (jex);
                } // try
            }, enumerable: true
        } // executeTest
    }); // Object.defineProperties(testbedAgent)

    //region ec

    //region ec.net
    // TODO : instance shield
    let {net} = require("../../ec/net/src/tb.ec.net.js");
    net.uri   = `${id}ec/net/`;
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
    //region TEST
    //await net.sniff();
    //debugger;
    //endregion TEST
    //endregion ec.net

    //region ec.ids

    // TODO : instance shield

    const
        alice_id   = "https://alice.nicos-rd.com/",
        node_alice = space.getNode(alice_id),
        bob_id     = "https://bob.nicos-rd.com/",
        node_bob   = space.getNode(bob_id)
    ;
    await node_alice.load();
    await node_bob.load();

    let
        ids = require("../../ec/ids/src/tb.ec.ids.js")({
            'uri':   `${id}ec/ids/`,
            'ALICE': {
                'id':     alice_id,
                'schema': node_alice.getLiteral('fua:schema').value,
                'host':   node_alice.getLiteral('fua:host').value,
                'port':   parseInt(node_alice.getLiteral('fua:port').value),
                'SKIAKI': node_alice.getLiteral('dapsm:skiaki').value,
                //
                'user':         {
                    'tb_ec_ids': {'name': "tb_ec_ids", 'password': "marzipan"}
                },
                'idle_timeout': parseInt(node_alice.getLiteral('idsecm:idle_timeout').value),
                'DAPS':         {
                    'default': node_alice.getNode('idsecm:daps_default').id
                },
                // 'cert_client':  "C:/fua/DEVL/js/app/nrd-testbed/ec/ids/src/rc/alice/cert/index.js"
                'cert_client': path.join(__dirname, '../../ec/ids/src/rc/alice/cert/index.js')
            }, // ALICE
            'BOB':   {
                'id':     bob_id,
                'schema': node_bob.getLiteral('fua:schema').value,
                'host':   node_bob.getLiteral('fua:host').value,
                'port':   parseInt(node_bob.getLiteral('fua:port').value),
                'SKIAKI': node_bob.getLiteral('dapsm:skiaki').value,
                //
                'user': {
                    "tb_ec_ids": {'name': "tb_ec_ids", 'password': "marzipan"}
                },
                //
                'idle_timeout': parseInt(node_bob.getLiteral('idsecm:idle_timeout').value),
                //'idle_timeout': 1,
                //
                'DAPS': {
                    'default': node_bob.getNode('idsecm:daps_default').id
                },
                // 'cert_client': "C:/fua/DEVL/js/app/nrd-testbed/ec/ids/src/rc/bob/cert/index.js"
                'cert_client': path.join(__dirname, '../../ec/ids/src/rc/bob/cert/index.js')
            }
        });
    ids.uri = `${id}ec/ids/`;
    ids.ec  = ec;
    ids.on('event', (error, data) => {
        eventEmitter.emit('event', error, data);
    });
    ids.on('error', (error) => {
        eventEmitter.emit('error', error);
        //debugger;
    });
    ec['ids'] = ids;
    Object.freeze(ec['ids']);

    if (daps) {
        daps.domain = domain;
        Object.defineProperty(testbedAgent, 'DAPS', {
            value: daps, enumerable: false
        }); // Object.defineProperty()
    } // if (DAPS)

    //endregion ec.ids
    //endregion ec

    Object.defineProperties(testbedAgent, {
        'ec': {value: ec, enumerable: true}
    });

    for (const [key, value] of Object.entries(task['scheduler'])) {
        implemented_task[key] = value;
        //let topic             = ((value.contains('_')) ? value.split('_')[1] : value);
        testbedAgent['scheduler']['on'](((value.includes('_')) ? value.split('_')[1] : value), (data) => {
            eventEmitter['emit'](value, data);
        });
    } // for()

    testbedAgent['on'](implemented_task['scheduler_idle'], (data) => {
        //debugger;
        console.log(`'scheduler_idle' : data <${JSON.stringify(data)}>`);
        return undefined;
    });
    testbedAgent['on'](implemented_task['scheduler_error'], (error) => {
        //debugger;
        console.log(`'scheduler_error' : error <${JSON.stringify(error)}>`);
        return undefined;
    });

    Object.freeze(testbedAgent);

    return testbedAgent;
} // TestbedAgent

Object.defineProperties(TestbedAgent, {
    'id': {value: "http://www.nicos-rd.com/fua/testbed#TestbedAgent/"}
});

exports.TestbedAgent = TestbedAgent;
