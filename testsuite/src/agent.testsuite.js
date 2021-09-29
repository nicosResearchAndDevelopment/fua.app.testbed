const
    path = require('path'),
    //
    util = require('@nrd/fua.core.util'),
    uuid = require('@nrd/fua.core.uuid')
    //
    //{Self}   = require(path.join(util.FUA_JS_LIB, 'agent.Self/src/agent.Self.js')),
    //{Domain} = require(path.join(util.FUA_JS_LIB, 'agent.Domain/src/agent.Domain.js'))
;

//region ERROR
const
    ERROR_CODE_ErrorTestsuiteIdIsMissing = "ids.agent.Testsuite.ERROR.1"
; // const

class ErrorTestsuiteIdIsMissing extends Error {
    constructor({prov: prov}) {
        super(`fua.agent.TestsuiteAgent : id is missing.`);
        this.id   = `${"urn:fua:agent:TestbedAgent:"}error:${uuid.v4()}`;
        this.code = ERROR_CODE_ErrorTestsuiteIdIsMissing;
        this.prov = prov;
        Object.freeze(this);
    }
}

//endregion ERROR

async function TestsuiteAgent({
                                  'id':      id = undefined,
                                  'testbed': testbed = undefined
                                  //'scheduler': scheduler = undefined,
                                  //'system':    system = undefined,
                                  //'domain':    domain = undefined
                              }) {

    let
        testsuite = {},
        testbed_emit
    ; // let

    if (!id)
        throw (new ErrorTestsuiteIdIsMissing({
            prov: 'agent.TestsuiteAgent.constructor'
        }));

    Object.defineProperties(testsuite, {
        'id':   {value: id, enumerable: true},
        'test': {
            value:         async (param) => {
                try {
                    let result = await testbed_emit("test", param);
                    return result;
                } catch (jex) {
                    throw(jex);
                } // try
            }, enumerable: false
        }
        //'testbed':   {
        //    value: testbed, enumerable: true
        //}
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

        //region TEST
        let
            alice = "http://127.0.0.1:8099/",
            bob   = {
                schema: "http",
                host:   "127.0.0.1",
                port:   8098
            },
            // REM : doesn't work!!!!!!!! (connect NOT present!!!
            param = { // REM : connect ALICE
                'ec':      "ids",
                'command': "connect",
                'param':   {
                    'url': alice
                }
            }
        ; // let

        param = { // REM : connect ALICE
            'ec':      "ids",
            'command': "getSelfDescriptionFromRC",
            'param':   {
                'rc': alice
            }
        };
        param = { // REM : connect ALICE
            'ec':      "ids",
            'command': "requestConnectorSelfDescription",
            'param':   {
                //'operator': "simon petrac",
                'rc': alice,
                // REM : Bob as applicant
                'schema': bob.schema,
                'host':   bob.host,
                'path':   `${bob.port}/about`
            }
        };

        param = { // REM : connect ALICE
            'ec':      "ip",
            'command': "ping",
            'param':   {
                'host': "127.0.0.1"
            }
        };

        let result;
        try {
            result = await testsuite.test(param);
            debugger;
        } catch (error) {
            console.error(error);
            debugger;
        } // try

        //endregion TEST

    });
    testbed_socket.on("error", (error) => {
        console.error(error);
    });
    testbed_socket.on("event", (error, data) => {
        if (error)
            console.error(error);
        console.log(data);
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