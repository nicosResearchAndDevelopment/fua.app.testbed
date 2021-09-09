const
    path         = require('path'),
    //
    util         = require('@nrd/fua.core.util'),
    rdf         = require('@nrd/fua.module.rdf'),

    EventEmitter = require('events'),
    //{Self}      = require(path.join(util.FUA_JS_LIB, 'agent.Self/src/agent.Self.js')),
    // TODO : beta
    {Time}       = require(path.join(util.FUA_JS_LIB, 'agent.Time/src/agent.Time.js')),
    {Scheduler}  = require(path.join(util.FUA_JS_LIB, 'agent.Scheduler/src/agent.Scheduler.js')),
    {Domain}     = require(path.join(util.FUA_JS_LIB, 'agent.Domain/src/agent.Domain.beta.js')),

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
                                'id':        id = undefined,
                                'scheduler': scheduler,
                                'space':     space
                            }) {


    const that = rdf.generateGraph(space.dataStore.dataset, undefined, {'compact': true, 'meshed': true, 'blanks': true});

    const
        testbed_config           = space.getNode(id),
        testbed_config_data      = await testbed_config.read(),
        implemented_task = {
            // self topics
            'error': "error"
        },
        eventEmitter     = new EventEmitter()
    ;
    let node             = {};

    //if (new.target) {
    if (!id)
        throw new ErrorTestbedIdIsMissing(`id is missing on node`)

    //region system
    //endregion system

    //region domain
    let
        domain_config = testbed_config['ecm:domain'][0],
        domain_config_data = await domain_config.read()
        ;
    const domain = new Domain({
        //'id':    `${id}domain/`,
        'config': domain_config
    });
    //endregion domain
    //region TEST
    let user = await domain.users.get("https://testbed.nicos-rd.com/domain/users/spetrac");
    //endregion TEST
    //region amec
    amec.authMechanism('login', async function (request) {
        // 1. get identification data
        const
            user     = request.body?.user,
            password = request.body?.password;

        // 2. reject invalid authentication
        if (!user || !password) return null;
        if (!tmp_users.has(user)) return null;
        if (password !== tmp_users.get(user)) return null;

        // 3. return auth on success
        return {user};
    });

    amec.authMechanism('login-tfa', async function (request) {
        // 1. get identification data
        const
            user     = request.body?.user,
            password = request.body?.password,
            tfa      = request.body?.tfa;

        // 2. reject invalid authentication
        if (!user || !password || !tfa) return null;
        if (!tmp_users.has(user)) return null;
        if (tfa.replace(/\D/g, '') !== request.session.tfa) return null;
        if (password !== tmp_users.get(user)) return null;

        // 3. return auth on success
        return {user};
    });
    //endregion amec

    Object.defineProperties(node, {
        'id':           {value: id, enumerable: true},
        'on':           {
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
        'scheduler':    {
            value: new Scheduler(scheduler), enumerable: true
        },
        'amec':         {
            value: amec, enumerable: true
        },
        'authenticate': {
            //'login':       {
            value:         async ({'type': type, 'user': user, 'password': password}) => {
                return undefined;
            }, enumerable: true
        },
        'domain':       {
            value: domain, enumerable: true
        },
        'space':        {
            value: space, enumerable: true
        },
        'executeTest':  {
            value:         async (param) => {
                try {
                    throw new Error(`agent.Testbed : 'executeTest' NOT implemented now.`);
                } catch (jex) {
                    throw jex;
                } // try
            }, enumerable: true
        }
    });
    for (const [key, value] of Object.entries(task['scheduler'])) {
        implemented_task[key] = value;
        //let topic             = ((value.contains('_')) ? value.split('_')[1] : value);
        node['scheduler']['on'](((value.includes('_')) ? value.split('_')[1] : value), (data) => {
            eventEmitter['emit'](value, data);
        });
    } // for()
    //} // if (new.target)

    //
    //
    node['on'](implemented_task['scheduler_idle'], (data) => {
        //debugger;
        console.log(`'scheduler_idle' : data <${JSON.stringify(data)}>`);
        return undefined;
    });
    node['on'](implemented_task['scheduler_error'], (error) => {
        //debugger;
        console.log(`'scheduler_error' : error <${JSON.stringify(error)}>`);
        return undefined;
    });

    Object.freeze(node);

    return node;
} // TestbedAgent

Object.defineProperties(TestbedAgent, {
    'id': {value: "http://www.nicos-rd.com/fua/testbed#TestbedAgent/"}
});

exports.TestbedAgent = TestbedAgent;