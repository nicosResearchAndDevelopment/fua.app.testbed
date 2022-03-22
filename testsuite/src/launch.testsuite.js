const
    path                    = require('path'),
    config                  = require('./config/config.testsuite.js'),
    util                    = require('@nrd/fua.core.util'),
    //
    //Amec             = require(path.join(util.FUA_JS_LIB, 'agent.amec/src/agent.amec.js')),
    {TestsuiteAgent}        = require('./code/agent.Testsuite.js'),// REM: as agent
    server_tls_certificates = require('../cert/tls-server/server.js'),
    //
    testsuite_id            = "https://testsuite.nicos-rd.com/",
    testbed                 = {
        schema: "https",
        host:   "testbed.nicos-rd.com",
        port:   8080,
        auth:   {
            user:     "testsuite",
            password: "marzipan"
        }
    },
    TestsuiteApp            = require('./app.testsuite.js'),
    TestsuiteLab            = require('./lab.testsuite.js')
; // const

(async function LaunchTestsuite() {

    config.server.url     = testsuite_id;
    config.server.options = {
        key:                server_tls_certificates.key,
        cert:               server_tls_certificates.cert,
        ca:                 server_tls_certificates.ca,
        requestCert:        false,
        rejectUnauthorized: false
    };
    config.testbed        = testbed;

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

    await TestsuiteApp({
        'space':  undefined,
        'agent':  testsuite_agent,
        'config': config
    });

    await TestsuiteLab({
        'agent': testsuite_agent
    });

})().catch((err) => {
    util.logError(err);
    debugger;
    process.exit(1);
}); // LaunchTestsuite
