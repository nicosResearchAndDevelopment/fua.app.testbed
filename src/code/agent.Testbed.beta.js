const
    path         = require('path'),
    //
    util         = require('@nrd/fua.core.util'),
    uuid         = require("@nrd/fua.core.uuid"),
    rdf          = require('@nrd/fua.module.rdf'),

    EventEmitter = require('events'),
    //{Self}      = require(path.join(util.FUA_JS_LIB, 'agent.Self/src/agent.Self.js')),
    // TODO : beta
    {Time}       = require(path.join(util.FUA_JS_LIB, 'agent.Time/src/agent.Time.js')),
    {Scheduler}  = require(path.join(util.FUA_JS_LIB, 'agent.Scheduler/src/agent.Scheduler.js')),
    {Domain}     = require(path.join(util.FUA_JS_LIB, 'agent.Domain/src/agent.Domain.beta.js')),
    {PEP}        = require(path.join(util.FUA_JS_LIB, 'module.PEP/src/module.PEP.beta.js')),

    //{System}    = require(path.join(util.FUA_JS_LIB, 'agent.System/src/agent.System.beta.js')),
    //{Device}    = require(path.join(util.FUA_JS_LIB, 'agent.System/src/agent.System.beta.js')),
    //{Testsuite}  = require('./agent.Testsuite.js'), // REM: as agent

    amec         = require(path.join(util.FUA_JS_LIB, 'agent.amec/src/agent.amec.next.js')),
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
    ,
    //{DAPS}       = require(path.join(util.FUA_JS_LIB, 'impl/ids/ids.agent.daps/src/agent.DAPS.beta.js'))
    //{ids}        = require("../../ec/ids/src/tb.ec.ids.js"),
    //{ip}         = require("../../ec/ip/src/tb.ec.ip.beta.js")
    DAPS         = false
;const {ip}      = require("../../ec/ip/src/tb.ec.ip.js"); // const

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
        this.id   = `${"urn:fua:agent:TestbedAgent:"}error:${uuid.v4()}`;
        this.code = ERROR_CODE_ErrorTestbedIdIsMissing;
        this.prov = prov;
        Object.freeze(this);
    }
}

class ErrorTestbedUnkownEcoSystem extends Error {
    constructor({prov: prov, ec: ec}) {
        super(`fua.agent.TestbedAgent : unknow EcoSystem <${ec}>.`);
        this.id   = `${"urn:fua:agent:TestbedAgent:"}error:${uuid.v4()}`;
        this.code = ERROR_CODE_ErrorTestbedUnkownEcoSystem;
        this.prov = prov;
        Object.freeze(this);
    }
}

class ErrorTestbedUnkownCommand extends Error {
    constructor({prov: prov, command: command}) {
        super(`fua.agent.TestbedAgent : unknow command <${command}>.`);
        this.id   = `${"urn:fua:agent:TestbedAgent:"}error:${uuid.v4()}`;
        this.code = ERROR_CODE_ErrorTestbedUnkownCommand;
        this.prov = prov;
        Object.freeze(this);
    }
}

class ErrorTestbedUnknownOnTopic extends Error {
    constructor({prov: prov, topic: topic}) {
        super(`fua.agent.TestbedAgent : unknow on topic <${topic}>.`);
        this.id   = `${"urn:fua:agent:TestbedAgent:"}error:${uuid.v4()}`;
        this.code = ERROR_CODE_ErrorTestbedUnknownOnTopic;
        this.prov = prov;
        Object.freeze(this);
    }
}

class ErrorTestbedCallbackMissingOnTopic extends Error {
    constructor({prov: prov, topic: topic}) {
        super(`fua.agent.TestbedAgent : on-callback  missing (topic <${topic}>).`);
        this.id   = `${"urn:fua:agent:TestbedAgent:"}error:${uuid.v4()}`;
        this.code = ERROR_CODE_ErrorTestbedCallbackMissingOnTopic;
        this.prov = prov;
        Object.freeze(this);
    }
}

//endregion ERROR

//region fn

function randomLeave(pre) {
    return `${pre}${uuid.v4()}`;
}

//endregion fn

async function TestbedAgent({
                                'testbed_id':   id = "asdf",
                                'scheduler':    scheduler,
                                'space':        space,
                                'encodeSecret': encodeSecret = undefined
                            }) {

    const
        that                   = rdf.generateGraph(space.dataStore.dataset, undefined, {
            'compact': true,
            'meshed':  true,
            'blanks':  true
        }),
        rootUri                = "https://testbed.nicos-rd.com/domain/user#",
        testbed_config         = space.getNode(id),
        testbed_config_data    = await testbed_config.read(),
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

    //region amec

    function BasicAuthentication_Leave_Factory({
                                                   'id':           id,
                                                   'rootUri':      rootUri,
                                                   'encodeSecret': encodeSecret = undefined
                                               }) {

        let fn = async (credentials, users) => {
            let
                //id      = undefined,
                //secret  = undefined,
                user    = undefined
            ;
            credentials = Buffer.from(credentials, 'base64').toString('ascii').split(":");
            //id          = ;
            // TODO : secret      = credentials[1];
            //secret = credentials[1];
            if (encodeSecret)
                credentials[1] = encodeSecret(credentials[1]);
            user = await users.get(`${rootUri}${credentials[0]}`);
            if (!user['dom:active'] || (user['dom:active'] && (user['dom:active'][0]['@value'] === "true")))
                if (user['dom:password'][0]['@value'] === credentials[1])
                    //return user;
                    return {
                        '@id':   user['@id'],
                        '@type': user['@type']
                    };
            return undefined;
        };
        Object.defineProperties(fn, {
            'id': {value: id, enumerable: false}
        });
        Object.freeze(fn);
        return fn;
    } // BasicAuthentication_Name_Factory

    function IDS_DAT_Authentication_Factory({
                                                'id':           id,
                                                'rootUri':      rootUri,
                                                'encodeSecret': encodeSecret = undefined
                                            }) {

        // REM : this will authenticate/validate requesting IDS-Connector, so, returning the user means:
        // REM :    it is a correct requester!!! for this Connector-provider)
        // REM :    So, we will NOT search it in our own registry...
        // REM :    So, if we want to express, that given requester has to ALSO in providers registry
        // REM :        we have to implemented it, too!!!
        // REM : If we DO search it in our own registry, we do it for the purpose of fetching
        // REM :    its Access Control (or whatever)

        let fn = async (DAT, users) => {
            //let
            //    skiaki = undefined,
            //    //secret  = undefined,
            //    user   = undefined
            //;
            //skiaki     = DAT['sub'];
            //skiaki     = (skiaki);

            //id          = ;
            // TODO : secret      = credentials[1];
            //secret = credentials[1];
            //if (encodeSecret)
            //    credentials[1] = encodeSecret(credentials[1]);
            //user = await users.get(`${rootUri}${credentials[0]}`);
            //if (!user['dom:active'] || (user['dom:active'] && (user['dom:active'][0]['@value'] === "true")))
            //    if (user['dom:password'][0]['@value'] === credentials[1])
            //        return user;

            return undefined;
        }; // fn
        Object.defineProperties(fn, {
            'id': {value: id, enumerable: false}
        });
        Object.freeze(fn);
        return fn;
    } // IDS_DAT_Authentication_Factory

    amec.authMechanism('BasicAuthentication_Leave', BasicAuthentication_Leave_Factory({
        'id':           `${id}amec/BasicAuthentication_Leave`,
        'rootUri':      rootUri,
        'encodeSecret': encodeSecret
    }));
    amec.authMechanism('IDS_DAT_Authentication', IDS_DAT_Authentication_Factory({
        'id':           `${id}amec/IDS_DAT_Authentication`,
        'rootUri':      rootUri,
        'encodeSecret': encodeSecret
    }));

    //amec.authMechanism('login', async function (request) {
    //    // 1. get identification data
    //    const
    //        user     = request.body?.user,
    //        password = request.body?.password;
    //
    //    // 2. reject invalid authentication
    //    if (!user || !password) return null;
    //    if (!tmp_users.has(user)) return null;
    //    if (password !== tmp_users.get(user)) return null;
    //
    //    // 3. return auth on success
    //    return {user};
    //});
    //
    //amec.authMechanism('login-tfa', async function (request) {
    //    // 1. get identification data
    //    const
    //        user     = request.body?.user,
    //        password = request.body?.password,
    //        tfa      = request.body?.tfa;
    //
    //    // 2. reject invalid authentication
    //    if (!user || !password || !tfa) return null;
    //    if (!tmp_users.has(user)) return null;
    //    if (tfa.replace(/\D/g, '') !== request.session.tfa) return null;
    //    if (password !== tmp_users.get(user)) return null;
    //
    //    // 3. return auth on success
    //    return {user};
    //});
    //endregion amec

    //region domain
    let
        domain_config = testbed_config['ecm:domain'][0],
        ec            = {}
    ;
    await domain_config.read();
    const
        pep    = PEP({'id': `${id}PEP`}),
        domain = new Domain({
            //'id':    `${id}domain/`,
            'config': domain_config,
            'amec':   amec
        })
    ;
    //endregion domain

    Object.defineProperties(testbedAgent, {
        'id':                     {value: id, enumerable: true},
        'testsuite_inbox_socket': {
            set(socket) {
                if (!testsuite_inbox_socket)
                    testsuite_inbox_socket = socket;
            }, enumerable: false
        },
        'on':                     {
            value:          Object.defineProperties((topic, callback) => {
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
            }, {
                'id': {value: `${id}on`, enumerable: true}
            }), enumerable: true
        }, // on
        'scheduler':              {
            value: new Scheduler(scheduler), enumerable: true
        },
        'amec':                   {
            value: amec, enumerable: true
        },
        'PEP':                    {
            value: pep, enumerable: false
        },
        'domain':                 {
            value: domain, enumerable: true
        },
        'space':                  {
            value: space, enumerable: true
        },
        'inbox':                  {
            value:         async (message) => {
                if (testsuite_inbox_socket)
                    testsuite_inbox_socket.emit();
                return undefined;
            }, enumerable: true
        }, // inbox
        'executeTest':            {
            value:         async (param) => {
                try {
                    let
                        ec = testbedAgent['ec'][param.ec],
                        command
                    ;

                    if (!ec) {
                        throw(new ErrorTestbedUnkownEcoSystem({prov: `${id}executeTest`, ec: ed}));

                    } else {
                        command = ec[param.command];
                        if (!command) {
                            throw(new ErrorTestbedUnkownCommand({prov: `${id}executeTest`, command: command}));
                        } else {
                            param.param.thread = (param.param.thread || randomLeave(`${id_agent}thread/`));
                            let result         = await command(param.param);
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

    //region ec.ip
    // TODO : instance shield
    let {ip} = require("../../ec/ip/src/tb.ec.ip.js");
    ip.uri   = `${id}ec/ids/`;
    ip.on('event', (error, data) => {
        //eventEmitter.emit('event', error, data);
        //debugger;
    });
    ip.on('error', (error) => {
        //eventEmitter.emit('event', error, data);
        debugger;
    });
    ec['ip'] = ip;
    Object.freeze(ec['ip']);
    //endregion ec.ip

    //region ec.net
    // TODO : instance shield
    //let {net} = require("../../ec/net/src/tb.ec.net.js");
    //net.uri   = `${id}ec/net/`;
    //net.on('event', (error, data) => {
    //    eventEmitter.emit('event', error, data);
    //    debugger;
    //});
    //net.on('error', (error) => {
    //    //eventEmitter.emit('event', error, data);
    //    debugger;
    //});
    //ec['net'] = net;
    //Object.freeze(ec['net']);
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
    await node_alice.read();
    await node_bob.read();

    let
        cert_alice = require("C:/fua/DEVL/js/app/nrd-testbed/ec/ids/src/rc/alice/cert/index.js"),
        cert_bob   = require("C:/fua/DEVL/js/app/nrd-testbed/ec/ids/src/rc/bob/cert/index.js"),
        ids        = require("../../ec/ids/src/tb.ec.ids.js")({
            'uri':   `${id}ec/ids/`,
            'ALICE': {
                'id':     alice_id,
                'schema': "http",
                'host':   "127.0.0.1",
                //'port':   8099,
                'port': parseInt(node_alice['fua:port'][0]['@value']),
                // TODO: SKIAKI
                'SKIAKI': "11:B9:DE:C7:63:7C:00:B6:A9:32:57:5A:23:01:3F:44:0E:39:02:82:keyid:3B:9B:8E:72:A4:54:05:5A:10:48:E7:C0:33:0B:87:02:BC:57:7C:A4",
                //
                'user': {
                    'tb_ec_ids': {'name': "tb_ec_ids", 'password': "marzipan"}
                },
                //
                'idle_timeout': parseInt(node_alice['idsecm:idle_timeout'][0]['@value']),
                //'idle_timeout': 1,
                //
                'DAPS':        {
                    //'default':                           "https://nrd-daps.nicos-rd.com:8082/",
                    'default':                            node_alice['idsecm:daps_default'][0]['@id'],
                    'https://nrd-daps.nicos-rd.com:8082': "https://nrd-daps.nicos-rd.com:8082/"
                },
                'cert_client': "C:/fua/DEVL/js/app/nrd-testbed/ec/ids/src/rc/alice/cert/index.js"
            }, // ALICE
            'BOB':   {
                'id': bob_id,
                //
                'schema': "http",
                'host':   "127.0.0.1",
                'port':   parseInt(node_bob['fua:port'][0]['@value']),
                // TODO: SKIAKI
                'SKIAKI': "11:B9:DE:C7:63:7C:00:B6:A9:32:57:5A:23:01:3F:44:0E:39:02:82:keyid:3B:9B:8E:72:A4:54:05:5A:10:48:E7:C0:33:0B:87:02:BC:57:7C:A4",
                //
                'user': {
                    "tb_ec_ids": {'name': "tb_ec_ids", 'password': "marzipan"}
                },
                //
                'idle_timeout': parseInt(node_bob['idsecm:idle_timeout'][0]['@value']),
                //'idle_timeout': 1,
                //
                'DAPS':        {
                    //'default':                           "https://nrd-daps.nicos-rd.com:8082/",
                    'default':                            node_bob['idsecm:daps_default'][0]['@id'],
                    'https://nrd-daps.nicos-rd.com:8082': "https://nrd-daps.nicos-rd.com:8082/"
                },
                'cert_client': "C:/fua/DEVL/js/app/nrd-testbed/ec/ids/src/rc/bob/cert/index.js"
            }
        });
    ids.uri        = `${id}ec/ids/`;
    ids.ec         = ec;
    ids.on('event', (error, data) => {
        eventEmitter.emit('event', error, data);
    });
    ids.on('error', (error) => {
        eventEmitter.emit('error', error);
        //debugger;
    });
    ec['ids'] = ids;
    Object.freeze(ec['ids']);

    if (DAPS) {
        //Object.defineProperty(ec['ids'], 'ids', {
        //
        //});
        let
            daps_id         = "https://nrd-daps.nicos-rd.com/", // TODO : config
            nrd_daps_config = space.getNode(daps_id)
        ;
        await nrd_daps_config.read()
        Object.defineProperty(testbedAgent, 'DAPS', {
            value:         new DAPS({
                    'id':      `${daps_id}agent/`,
                    'rootUri': rootUri,
                    'domain':  domain,
                    //
                    'privateKey':      nrd_daps_config['dapsm:privateKey'][0]['@value'],
                    'jwt_payload_iss': daps_id
                }
            ), enumerable: false
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