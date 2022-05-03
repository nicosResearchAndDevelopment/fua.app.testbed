const
    path         = require('path'),
    EventEmitter = require('events'),
    io_client    = require("socket.io-client"),
    //
    util         = require('@nrd/fua.core.util'),
    uuid         = require('@nrd/fua.core.uuid'),
    //
    _prefix_     = "ts",
    //
    {BPEPAgent}  = require(path.join(util.FUA_JS_LIB, 'BPEF/agent.BPEP/src/agent.BPEP')),
    BPMN_factory = require(path.join(util.FUA_JS_LIB, 'BPEF/module.BPMN-2.0/src/module.BPMN'))

;

//region ERROR
const
    ERROR_CODE_ErrorTestsuiteIdIsMissing            = "ids.agent.Testsuite.ERROR.1",
    ERROR_CODE_ErrorTestsuiteCallbackMissingOnTopic = "ids.agent.Testsuite.ERROR.2",
    ERROR_CODE_ErrorTestsuiteUnknownOnTopic         = "ids.agent.Testsuite.ERROR.3"
; // const

class ErrorTestsuiteIdIsMissing extends Error {
    constructor({prov: prov}) {
        super(`fua.agent.TestsuiteAgent : id is missing.`);
        this.id   = `${"urn:fua:agent:TestsuiteAgent:"}error:${uuid.v1()}`;
        this.code = ERROR_CODE_ErrorTestsuiteIdIsMissing;
        this.prov = prov;
        Object.freeze(this);
    }
}

class ErrorTestsuiteUnknownOnTopic extends Error {
    constructor({prov: prov, topic: topic}) {
        super(`fua.agent.TestsuiteAgent : unknow on topic <${topic}>.`);
        this.id   = `${"urn:fua:agent:TestbedAgent:"}error:${uuid.v1()}`;
        this.code = ERROR_CODE_ErrorTestsuiteUnknownOnTopic;
        this.prov = prov;
        Object.freeze(this);
    }
}

class ErrorTestsuiteCallbackMissingOnTopic extends Error {
    constructor({prov: prov, topic: topic}) {
        super(`fua.agent.TestbedAgent : on-callback  missing (topic <${topic}>).`);
        this.id   = `${"urn:fua:agent:TestsuiteAgent:"}error:${uuid.v1()}`;
        this.code = ERROR_CODE_ErrorTestsuiteCallbackMissingOnTopic;
        this.prov = prov;
        Object.freeze(this);
    }
}

//endregion ERROR

async function TestsuiteAgent({
                                  id:     id = undefined,
                                  prefix: prefix = _prefix_,
                                  //validate: validate = undefined,
                                  testbed: testbed = undefined
                              }) {

    function event(event) {
        debugger;
    }

    async function endExit(token, data) {
        token.end = util.utcDateTime();
        console.log(token);
        console.log(data);
        //debugger;
        return {token: token, data: data}; // TODO:
    }

    const
        pool_root = `${id}bpef/pool/`,
        _test_    = async (token, data) => {
            try {

                let testResult = await testbed_emit(
                    "test",
                    {
                        id:     token.id,
                        start:  token.start,
                        thread: []
                    },
                    data
                );

                if (typeof testResult[0] === "string") {
                    if (testResult[0] !== token.id)
                        throw(new Error(``)); // TODO : better ERROR
                } else {
                    if (testResult[0].id !== token.id)
                        throw(new Error(``)); // TODO : better ERROR
                    if (testResult[0].thread)
                        token.thread = token.thread.concat(testResult[0].thread);
                } //  if ()

                data.testResult = testResult[1];

                //token.end = util.utcDateTime();
                return {token: token, data: data};
            } catch (jex) {
                throw(jex);
            } // try
        } // test = async (token)

    ; // const
    let
        BPEF      = {
            exec: ({id: id, environment: environment}) => {
                return Object.defineProperties(async (token, data) => {

                    //let result = await environment.test(/** token */ token, data);
                    //return result;
                    return await environment.test(/** token */ token, data);

                }, {id: {value: id, enumerable: true}});
            }
        }
    ;
    BPEF.id       = {
        root: {
            ec: {
                id:  `${pool_root}ec/`,
                ids: {
                    id:        `${pool_root}ec/ids/`,
                    testcases: {
                        id:       `${pool_root}ec/ids/tc/`,
                        swimlane: {
                            INF_01: {
                                id:       `${pool_root}ec/ids/tc/INF_01/`,
                                start:    {
                                    id:   `${pool_root}ec/ids/tc/INF_01/start/`,
                                    exit: `${pool_root}ec/ids/tc/INF_01/activity/getSelfDescription/`
                                },
                                activity: {
                                    getSelfDescription: {
                                        id:   `${pool_root}ec/ids/tc/INF_01/activity/getSelfDescription/`,
                                        exec: BPEF.exec({
                                            id:          `${pool_root}ec/ids/tc/INF_01/activity/getSelfDescription/exec/`,
                                            environment: {test: _test_}
                                        }),
                                        exit: `${pool_root}ec/ids/tc/INF_01/activity/getSelfDescription/validate/`
                                    },
                                    validate:           {
                                        id:   `${pool_root}ec/ids/tc/INF_01/activity/getSelfDescription/validate/`,
                                        exec: async (token, data) => {
                                            data.validationResult = {
                                                timestamp: util.utcDateTime()
                                            };
                                            if (data.testResult.isAlive) {
                                                data.validationResult.valid  = true;
                                                data.validationResult.status = "PASS";
                                            } else {
                                                data.validationResult.valid  = false;
                                                data.validationResult.status = "FAIL";
                                            } // if ()

                                            return {token: token, data: data};
                                        },
                                        exit: `${pool_root}ec/ids/tc/INF_01/end/`
                                    }
                                }, // activity
                                end:      {
                                    id:   `${pool_root}ec/ids/tc/INF_01/end/`,
                                    exit: endExit
                                }
                            } // INF_01
                        } // root.ec.ids.testcases.swimlane
                    } // root.ec.ids.testcases
                } // root.ec.ids
            } // root.ec
        } // root
    } // BPEF.id
    ;
    BPEF.graph    = [] // BPEF.graph
    ; // let
    //let carrier;
    //carrier       = require('./bpef/testsuite/bpef.testsuite.js')({
    //        root:    pool_root,
    //        endExit: endExit
    //    }
    //);
    //BPEF.graph    = BPEF.graph.concat(carrier.graph);
    //carrier       = require('./bpef/frontend/bpef.frontend.js')({
    //        root:          pool_root,
    //        testsuiteRoot: carrier.root,
    //        endExit:       endExit
    //    }
    //);
    //BPEF.graph    = BPEF.graph.concat(carrier.graph);

    //const
    //    bpep                                 = new BPEPAgent({
    //        id: "https://www.nicos-rd.com/test/agent/bpef/"
    //    }), // new BPEPAgent()
    //    BPMN                                 = BPMN_factory({
    //        //uri: "https://www.nicos-rd.com/fua/module/BPMN/" // REM : default
    //        //prefix: "bpmn", // REM : default
    //        bpep:      Object.freeze({
    //            id:      bpep.id,
    //            addNode: bpep.addNode,
    //            hasNode: bpep.hasNode
    //        }),
    //        doAddNode: true
    //    }), // BPMN

    //; // const
    //let
    //    BPMN_buildExecutableFromGraph_result = await BPMN.buildExecutableFromGraph(BPEF.graph),
    //    bpep_renderTargets_result            = await bpep.renderTargets({param: undefined}),
    //    testsuite                            = {},
    //    testbed_emit
    //; // let

    let
        testcases         = null, // !!!
        testsuite         = {},
        testbed_emit,
        implemented_emits = {
            // self topics
            testbed_socket_connect: "testbed_socket_connect",
            error:                  "error",
            event:                  "event"
        },
        eventEmitter      = new EventEmitter()
    ; // let

    //console.warn(BPMN_buildExecutableFromGraph_result);
    //debugger;

    if (!id)
        throw (new ErrorTestsuiteIdIsMissing({
            prov: 'agent.TestsuiteAgent.constructor'
        }));

    Object.defineProperties(testsuite, {
        id:        {value: id, enumerable: true},
        prefix:    {value: prefix, enumerable: true},
        testcases: {
            set(tc) {
                if (testcases !== null)
                    throw(new Error(``)); // TODO : better ERROR
                testcases = new Map();
                for (let [ec_name, ec] of Object.entries(tc)) {
                    for (let [fn_name, fn] of Object.entries(ec)) {
                        if (testcases.get(fn.id))
                            throw(new Error(``)); // TODO : better ERROR

                        testcases.set(fn.id, fn);

                        if (fn.urn) {
                            if (testcases.get(fn.urn))
                                throw(new Error(``)); // TODO : better ERROR
                            testcases.set(fn.urn, fn);
                        } // if ()

                    } // for
                } // for
            } // set
        }, // testcases
        test:      {
            value: _test_, enumerable: false
        }, // test
        enforce:   {
            //value:         async (id, token, data) => {
            value:         async (token, data) => {
                const tc_fn = testcases.get(data.testCase);
                if (!tc_fn)
                    throw(new Error(``)); // TODO : make better ERROR
                try {
                    return await tc_fn(token, data);
                    data.validationResult.value = "PASS";
                } catch (jex) {
                    data.validationResult.value = "FAIL";
                } //
                //let result = await bpep.enforce(id, token, data);
                //return result;
            }, enumerable: false
        }, // enforce
        Token:     {
            value: ({
                        id:     id = `${testsuite.id}token/${uuid.v1()}`,
                        start:  start = util.utcDateTime(),
                        thread: thread = []
                    }) => {
                if (typeof thread === "string")
                    thread = [thread];
                let
                    _data  = undefined,
                    result = {
                        id:     id,
                        type:   [`${prefix}:Token`],
                        start:  start,
                        thread: thread
                    }
                ; // let

                return result; // TODO : freeze never?!?
            } // Token()
            //value:         () => {
            //    return BPMN.Token({
            //        id: `${id}token/${uuid.v1()}`
            //        //,data: data
            //    });
            //}, enumerable: false
        }, // Token
        on:        {
            value:              Object.defineProperties((topic, callback) => {
                    let
                        error  = null,
                        result = false
                    ;
                    try {
                        if (implemented_emits[topic]) {
                            if (!!callback) {
                                eventEmitter['on'](topic, callback);
                                result = true;
                            } else {
                                error = (new ErrorTestsuiteCallbackMissingOnTopic({
                                    prov:  "fua.agent.TestsuiteAgent.on",
                                    topic: topic
                                }));
                            } // if ()
                        } else {
                            error = (new ErrorTestsuiteUnknownOnTopic({prov: "fua.agent.Testsuite.on", topic: topic}));
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
        } // on
    }); // Object.defineProperties(testsuite)

    //region testbed io client

    const
        testbed_socket = io_client(`${testbed.schema}://${testbed.host}:${testbed.port}/execute`, testbed.options)
    ; // const

    testbed_socket.on("connect", async (that) => {
        testbed_emit = util.promisify(testbed_socket.emit).bind(testbed_socket);
        eventEmitter.emit('event', {
            message: `testbed_socket connect.`
        });
        eventEmitter.emit('testbed_socket_connect', undefined);
    });

    testbed_socket.on("error", (error) => {
        console.error(error);
        eventEmitter.emit('error', error);
    });

    testbed_socket.on("event", (error, data) => {
        if (error) {
            console.error(error);
            eventEmitter.emit('error', error);
        } // if ()
        console.log(data);
        eventEmitter.emit('event', data);
    });
    //endregion testbed io client

    Object.freeze(testsuite);

    return testsuite;
} // TestsuiteAgent

Object.defineProperties(TestsuiteAgent, {
    id: {value: "http://www.nicos-rd.com/fua/testbed#TestsuiteAgent", enumerable: true}
});
Object.freeze(TestsuiteAgent);

exports.TestsuiteAgent = TestsuiteAgent;
