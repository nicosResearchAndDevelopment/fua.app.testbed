const
    path             = require('path'),
    config           = require('./config/config.testsuite.js'),
    util             = require('@nrd/fua.core.util'),
    //
    //Amec             = require(path.join(util.FUA_JS_LIB, 'agent.amec/src/agent.amec.js')),
    {TestsuiteAgent} = require('./agent.testsuite.js'),// REM: as agent
    //
    testsuite_id     = "https://testsuite.nicos-rd.com/",

    testbed          = {
        schema: "https",
        host:   "testbed.nicos-rd.com",
        port:   8080,
        auth:   {
            user:     "testsuite",
            password: "marzipan"
        }
    }
; // const

let
    amec
;
(async ({'config': config}) => {

    config.server.url = testsuite_id;
    config.testbed    = testbed;

    const
        validate        = {
            ec: {
                net: {
                    ping: async ({
                                     id:         id,
                                     testResult: testResult
                                 }) => {
                        const
                            pass = "ip:Pass",
                            fail = "ip:Fail"
                        ; // const

                        let result = {
                            '@context': ["https://www.nicos-rd.com/fua/ip/"],
                            id:         id,
                            type:       ["ip:validationResult"]
                        };
                        if (testResult.isAlive) {
                            result.type.push(pass);
                        } else {
                            result.type.push(fail);
                        } // if ()
                        return result;
                    }
                }
            }
        },
        testsuite_agent = await TestsuiteAgent({
            id: testsuite_id,
            //validate: validate,
            testbed: config.testbed
        })
    ; // const

    //amec = new Amec();

    const
        tc_console_log = true
    ;
    let testcases      = {
        net: require(`./tc/ec/net/tc.ec.net.launch`)({
            root_uri:    testsuite_id,
            agent:       {
                test: testsuite_agent.test
            },
            console_log: tc_console_log
        }),
        ids: require(`./tc/ec/ids/tc.ec.ids.launch`)({
            root_uri:    testsuite_id,
            agent:       {
                test: testsuite_agent.test
            },
            console_log: tc_console_log
        })
    };

    testsuite_agent.testcases = testcases;

    const
        APP_testsuite = require('./app.testsuite.js')({
            'space':  undefined,
            'agent':  testsuite_agent,
            'config': config
        })
    ; // const

})
({'config': config}).catch(console.error);

