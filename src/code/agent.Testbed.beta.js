const
    path         = require('path'),
    //
    util         = require('@nrd/fua.core.util'),
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
    {DAPS}       = require(path.join(util.FUA_JS_LIB, 'impl/ids/ids.agent.daps/src/agent.DAPS.beta.js'))

    //DAPS         = false
;
//const testbed = require("./code/main.testbed.js");

//region error

class ErrorTestbedIdIsMissing extends Error {
    constructor(message) {
        super(`${timestamp()}] : fua.agent.Testbed : Testbed :: ${message}`);
    }
}

//endregion error

//region fn
function timestamp() {
    return (new Date).toISOString();
}

//endregion fn

async function TestbedAgent({
                                //function TestbedAgent({
                                'id':           id = undefined,
                                'scheduler':    scheduler,
                                'space':        space,
                                'encodeSecret': encodeSecret = undefined
                            }) {

    const
        that = rdf.generateGraph(space.dataStore.dataset, undefined, {
            'compact': true,
            'meshed':  true,
            'blanks':  true
        });

    const
        rootUri             = "https://testbed.nicos-rd.com/domain/user#",
        testbed_config      = space.getNode(id),
        testbed_config_data = await testbed_config.read(),
        implemented_task    = {
            // self topics
            'error': "error"
        },
        eventEmitter        = new EventEmitter()
    ;
    let testbedAgent        = {};

    //if (new.target) {
    if (!id)
        throw new ErrorTestbedIdIsMissing(`id is missing on node`)

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
        domain_config = testbed_config['ecm:domain'][0]
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
        'id':          {value: id, enumerable: true},
        'on':          {
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
                            error = new Error(`fua.agent.Testbed : callback is missing on topic < ${topic} >.`);
                        } // if ()
                    } else {
                        error = new Error(`fua.agent.Testbed : topic < ${topic} > not known.`);
                    } // if ()
                } catch (jex) {
                    throw jex;
                } // try
                if (error)
                    throw error;
                return result;
            }, {
                'id': {value: `${id}on`, enumerable: true}
            }), enumerable: true
        }, // on
        'scheduler':   {
            value: new Scheduler(scheduler), enumerable: true
        },
        'amec':        {
            value: amec, enumerable: true
        },
        'PEP':         {
            value: pep, enumerable: false
        },
        'domain':      {
            value: domain, enumerable: true
        },
        'space':       {
            value: space, enumerable: true
        },
        'executeTest': {
            value:         async (param) => {
                try {
                    throw new Error(`agent.Testbed : 'executeTest' NOT implemented now.`);
                } catch (jex) {
                    throw jex;
                } // try
            }, enumerable: true
        }
    });

    if (DAPS)
        Object.defineProperty(testbedAgent, 'DAPS', {
            value:      new DAPS({
                    'id':      `${id}daps/`,
                    'rootUri': rootUri,
                    'domain':  domain,
                    //
                    'privateKey':      `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEApLZgK4TFWJ9LNeYGtCjIRdMvcAszgODjnXjRwOK5O6qRXo4Z
QWFPf2oSIOrSFbXQbDL6/X4UjYctkEAZYigvGUe0l4Q8aqGa7ie29JHacUJlS+bc
z8vd/hISg1iD6Wr9SOB3OxCliT7iLdek3eJgxc/mFTKgt/ZQOJiHKaezUX/U7TMI
hIMoNXvc9hLk16iub0ADfyzBoAqNKtadt9M897uNILtpxzPOySW+cXxlGYbQm5fH
DDyIU0yZvULnW4bB1lGb2/HdbKeIYp06UepDxj0s1twVt2JkC+T0TaxOadJ5GmDb
QJZdkZsmA6r4hrGFRGYUoNPBki8+g9+vWTb2hwIDAQABAoIBAEjVrKkRyQJrTiLD
WOuJrSXTQQLWsSuoRn530qjsmORdhHK/e0OB+FlrWiDcNZIMF+IAmSRHAGelAuzq
q07QXiNbpevqOZ0dYRk2zpxPcrzqk0iBCduJVtzmuPEDzzEEcoQrXg3sSobqG7IR
zYGgfRJ74E43WQKAFPEx4XL2CUFcA/H9wHj5Sp7TNMBt1hnvfZMTWV4i8eRXLAAh
e2h1GNKjV2+ie2fcPqxKb9vavbJixtEqQ4UoD+fLcRp3zbbhWVyIEst2g6BeXjb1
fbSPabwO5GgGCq5i8+nTqTRM827Cqoid/cOKixacryuRS52H70boY/v61TA52i6L
HUwO6IECgYEA0coRb40CyndgoyAPH/VnvyqlqSpVoqMChYyfqpzG9eImUEYmx8qE
DM1I3E/wGD7KMPDNvTrTQ+flYHyunZNVYCdLqRQhqX2Pp+q8+uASrm3Bpot9ueLE
6XF4WdOC4Q80T7KvZw3xH8XO+KobFMiNyvB7rZ9XnnsctFGFtMtE8vECgYEAyP5w
VjsUxotZfUsORsa2vrIGwX7iyAAqsKpbUCkALpB5w6owwAA5HeJ7kfi/stIKUGly
HpmWBucvvX5EAZHJJFyBBm5DeQXv7QAYCRTv8a4Owp7OvAsNL90Ir3di/WF9Uwki
Al8F7eTjIQQMRmhZ0XJplPAKPjM+HyEGqS+ZkPcCgYA1GKp/DDZ3ne00fCm30fm3
FYkmHpPb/NvnhybmHJXyp5FA4fBwwp3XS6G0OPswd7ve1SONUDUmS6vvVr8vHJoQ
IwHwQise5auVOUEpUcsIoLjReR6SDIX/+3sVaQYIBjwcK8JfF9U+UGdI4mzGPtg8
U89JqzmW39vs+3EWyBekUQKBgCBGm4t9WUy4u9oe32AGMPpWZDdWRNyRCknsUVWC
AAF6OdNt1P5ACuv9npJGO6JfkEBxbl3zk9/v5/6p9Am8e2xXXnDF7BfXGDwas8Fh
l1Zb+QrPrasMq0VwXSCwLzk5GoLnCIsQ70bQZpi6qa30u9eiY8oC8eIjIGqnRwaM
GkDpAoGBAKVj3Khhj86zVz933vQzoT4/EE6tWTo0hmnzxFxR92D5woMe3KbkMQT1
+ujajKnBK4uDkwpF7QWFqJbu3PB/EKgIo6ebD+p+WFeavbC5ibeS79Ng7SCOGXMR
cF7ogfDRmadLrqnQFG2oqGSHgN0WU7YLZSs9nLP1O4Qn4AeBcG8N
-----END RSA PRIVATE KEY-----`,
                    'jwt_payload_iss': "https://nrd-daps.nicos-rd.com/"
                }
            ),
            enumerable: false
        });

    for (const [key, value] of Object.entries(task['scheduler'])) {
        implemented_task[key] = value;
        //let topic             = ((value.contains('_')) ? value.split('_')[1] : value);
        testbedAgent['scheduler']['on'](((value.includes('_')) ? value.split('_')[1] : value), (data) => {
            eventEmitter['emit'](value, data);
        });
    } // for()
    //} // if (new.target)

    //
    //
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