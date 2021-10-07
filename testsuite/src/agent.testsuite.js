const
    path         = require('path'),
    EventEmitter = require('events'),
    //
    util         = require('@nrd/fua.core.util'),
    uuid         = require('@nrd/fua.core.uuid'),

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
                                  id:       id = undefined,
                                  validate: validate = undefined,
                                  testbed:  testbed = undefined
                              }) {

    function event(event) {
        debugger;
    }

    async function endExit({token: token}) {
        console.log(token);
        debugger;
        return true; // TODO:
    }

    const
        pool_root                            = `${id}bpef/pool/`,
        _test_                               = async (token) => {
            try {
                let testResult        = await testbed_emit("test", token.data);
                token.data.testResult = testResult;
                //token.data.validationResult = await validate.ec[token.data.ec][token.data.command]({
                //    id:         `${testsuite.id}validation/ec/${token.data.ec}/${token.data.command}/${uuid.v1()}`,
                //    testResult: token.data.testResult
                //});
                token.end = util.timestamp();
                return token;
            } catch (jex) {
                throw(jex);
            } // try
        } // test = async (token)

    ; // const
    let
        BPEF                                 = {
            exec: ({id: id, environment: environment}) => {
                return Object.defineProperties(async ({token: token}) => {
                    return await environment.test(/** token */ token);
                }, {id: {value: id, enumerable: true}});
            }
        }
    ;
    BPEF.id                                  = {
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
                                    selfDescription:          {
                                        id:   `${pool_root}ec/ids/tc/INF_01/activity/getSelfDescription/`,
                                        exec: BPEF.exec({
                                            id:          `${pool_root}ec/ids/tc/INF_01/activity/getSelfDescription/exec/`,
                                            environment: {test: _test_}
                                        }),
                                        exit: `${pool_root}ec/ids/tc/INF_01/activity/getSelfDescription/validate/`
                                    },
                                    validate_selfDescription: {
                                        id:   `${pool_root}ec/ids/tc/INF_01/activity/getSelfDescription/validate/`,
                                        exec: async ({token:token}) => {
                                            return false;
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
    BPEF.graph                               = [
        {
            id:       BPEF.id.root.ec.ids.testcases.id,
            type:     "bpmn:Pool",
            label:    "IDS testcases",
            swimLane: [BPEF.id.root.ec.ids.testcases.swimlane.INF_01.id]
        },
        {
            id:       BPEF.id.root.ec.ids.testcases.swimlane.INF_01.id,
            type:     "bpmn:SwimLane",
            label:    "IDS Testcase 'INF_01'",
            start:    {
                id:   BPEF.id.root.ec.ids.testcases.swimlane.INF_01.start.id,
                exit: BPEF.id.root.ec.ids.testcases.swimlane.INF_01.start.exit
            },
            activity: [
                {
                    id:    BPEF.id.root.ec.ids.testcases.swimlane.INF_01.activity.selfDescription.id,
                    type:  "bpmn:Activity",
                    label: "getSelfDescription",
                    exec:  BPEF.id.root.ec.ids.testcases.swimlane.INF_01.activity.selfDescription.exec,
                    exit:  BPEF.id.root.ec.ids.testcases.swimlane.INF_01.activity.validate_selfDescription.id
                },
                {
                    id:    BPEF.id.root.ec.ids.testcases.swimlane.INF_01.activity.validate_selfDescription.id,
                    type:  "bpmn:Activity",
                    label: "validate getSelfDescription",
                    exec:  BPEF.id.root.ec.ids.testcases.swimlane.INF_01.activity.validate_selfDescription.exec,
                    exit:  BPEF.id.root.ec.ids.testcases.swimlane.INF_01.end.id
                }
            ],
            end:      {
                id:   BPEF.id.root.ec.ids.testcases.swimlane.INF_01.end.id,
                exit: BPEF.id.root.ec.ids.testcases.swimlane.INF_01.end.exit
            }
        }
    ] // BPEF.graph
    ; // let
    const
        bpep                                 = new BPEPAgent({
            id: "https://www.nicos-rd.com/test/agent/bpef/"
        }), // new BPEPAgent()
        BPMN                                 = BPMN_factory({
            //uri: "https://www.nicos-rd.com/fua/module/BPMN/" // REM : default
            //prefix: "bpmn", // REM : default
            bpep:      Object.freeze({
                id:      bpep.id,
                addNode: bpep.addNode,
                hasNode: bpep.hasNode
            }),
            doAddNode: true
        }), // BPMN
        implemented_emits                    = {
            // self topics
            testbed_socket_connect: "testbed_socket_connect",
            error:                  "error",
            event:                  "event"
        },
        eventEmitter                         = new EventEmitter()
    ; // const
    let
        BPMN_buildExecutableFromGraph_result = await BPMN.buildExecutableFromGraph(BPEF.graph),
        bpep_renderTargets_result            = await bpep.renderTargets({param: undefined}),
        testsuite                            = {},
        testbed_emit
    ; // let

    console.warn(BPMN_buildExecutableFromGraph_result);
    //debugger;

    if (!id)
        throw (new ErrorTestsuiteIdIsMissing({
            prov: 'agent.TestsuiteAgent.constructor'
        }));

    Object.defineProperties(testsuite, {
        id: {value: id, enumerable: true},
        //test:  {
        //    value:         async (token) => {
        //        try {
        //            let testResult              = await testbed_emit("test", token.data);
        //            token.data.testResult       = testResult;
        //            token.data.validationResult = await validate.ec[token.data.ec][token.data.command]({
        //                id:         `${testsuite.id}validation/ec/${token.data.ec}/${token.data.command}/${uuid.v1()}`,
        //                testResult: token.data.testResult
        //            });
        //            token.end                   = util.timestamp();
        //            return token;
        //        } catch (jex) {
        //            throw(jex);
        //        } // try
        //    }, enumerable: false
        //}, // test
        test:    {
            value: _test_, enumerable: false
        }, // test
        enforce: {
            value:         async ({id: id, token: token}) => {
                let result = await bpep.enforce({id: id, token: token});
                return result;
            }, enumerable: false
        }, // test
        Token:   {
            value:         ({data: data}) => {
                return BPMN.Token({
                    id:   `${id}token/${uuid.v1()}`,
                    data: data
                });
            }, enumerable: false
        }, // Token
        on:      {
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
        io             = require("socket.io-client"),
        testbed_socket = io(`${testbed.schema}://${testbed.host}:${testbed.port}/execute`, {
            reconnectionDelayMax: 10000,
            reconnect:            true,
            rejectUnauthorized:   false,
            auth:                 testbed.auth
        })
    ; // const

    testbed_socket.on("connect", async () => {
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
    id: {value: "http://www.nicos-rd.com/fua/testbed#Testsuite", enumerable: true}
});
Object.freeze(TestsuiteAgent);

exports.TestsuiteAgent = TestsuiteAgent;