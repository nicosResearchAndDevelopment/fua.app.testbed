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
    ERROR_CODE_ErrorTestbedUnknownOnTopic           = "ids.agent.Testsuite.ERROR.3"
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

class ErrorTestbedUnknownOnTopic extends Error {
    constructor({prov: prov, topic: topic}) {
        super(`fua.agent.TestsuiteAgent : unknow on topic <${topic}>.`);
        this.id   = `${"urn:fua:agent:TestbedAgent:"}error:${uuid.v1()}`;
        this.code = ERROR_CODE_ErrorTestbedUnknownOnTopic;
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

    const
        bpep             = new BPEPAgent({
            id: "https://www.nicos-rd.com/test/agent/bpef/"
        }), // new BPEPAgent()
        BPMN             = BPMN_factory({
            //uri: "https://www.nicos-rd.com/fua/module/BPMN/" // REM : default
            //prefix: "bpmn", // REM : default
            bpep:      Object.freeze({
                id:      bpep.id,
                addNode: bpep.addNode,
                hasNode: bpep.hasNode
            }),
            doAddNode: true
        }),
        implemented_task = {
            // self topics
            'testbed_socket_connect': "testbed_socket_connect",
            'error':                  "error",
            'event':                  "event"
        },
        eventEmitter     = new EventEmitter()
    ; // const
    let
        testsuite        = {},
        testbed_emit
    ; // let

    if (!id)
        throw (new ErrorTestsuiteIdIsMissing({
            prov: 'agent.TestsuiteAgent.constructor'
        }));

    Object.defineProperties(testsuite, {
        id:    {value: id, enumerable: true},
        test:  {
            value:         async (token) => {
                try {
                    let testResult                   = await testbed_emit("test", token.data);
                    token.data.testResult            = testResult;
                    token.data.validationResult = await validate.ec[token.data.ec][token.data.command]({
                        id:         `${testsuite.id}validation/ec/${token.data.ec}/${token.data.command}/${uuid.v1()}`,
                        testResult: token.data.testResult
                    });
                    token.end                   = util.timestamp();
                    return token;
                } catch (jex) {
                    throw(jex);
                } // try
            }, enumerable: false
        },
        Token: {
            value:         ({data: data}) => {
                return BPMN.Token({
                    id:   `${id}pbmn/token/${uuid.v1()}`,
                    data: data
                });
            }, enumerable: false
        },
        on:    {
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
                                error = (new ErrorTestsuiteCallbackMissingOnTopic({
                                    prov:  "fua.agent.TestsuiteAgent.on",
                                    topic: topic
                                }));
                            } // if ()
                        } else {
                            error = (new ErrorTestsuiteUnknownOnTopic({prov: "fua.agent.TestsuiteAgent.on", topic: topic}));
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
    });

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
    'id': {value: "http://www.nicos-rd.com/fua/testbed#Testsuite", enumerable: true}
});
Object.freeze(TestsuiteAgent);
exports.TestsuiteAgent = TestsuiteAgent;