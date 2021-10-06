const
    path             = require('path'),
    config           = require('./config/config.testsuite.js'),
    util             = require('@nrd/fua.core.util'),
    //
    {TestsuiteAgent} = require('./agent.testsuite.js'),// REM: as agent
    //
    testsuite_id     = "https://testsuite.nicos-rd.com/",
    testbed          = {
        schema: "http",
        host:   "127.0.0.1",
        port:   8080,
        auth:   {
            user:     "testsuite",
            password: "marzipan"
        }
    }
; // const

(async ({'config': config}) => {

    config.server.url = testsuite_id;
    config.testbed    = testbed;

    const validate = {
        ec: {
            ip: {
                ping: async ({
                                 id:         id,
                                 testResult: testResult
                             }) => {
                    const
                        pass = "pass",
                        fail = "fail"
                        //notApplicable = "notApplicable"
                    ; // const

                    let result = {
                        id:   id,
                        mode: "fail",
                        fail: {},
                        pass: {}
                    };
                    if (testResult.isAlive) {
                        result.mode  = pass;
                        result[pass] = {};
                        delete result[fail];
                    } else {
                        result.mode  = fail;
                        result[fail] = {};
                        delete result["pass"];
                    } // if ()
                    return result;
                }
            }
        }
    }; // const

    const
        testsuite_agent = await TestsuiteAgent({
            id:       testsuite_id,
            validate: validate,
            testbed:  config.testbed
        })
    ;

    const APP_testsuite = require('./app.testsuite.js')({
        'space':  undefined,
        'agent':  testsuite_agent,
        'config': config
    });
    //debugger;
})({'config': config}).catch(console.error);

