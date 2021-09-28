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
        auth: {
            user: "testsuite",
            password: "marzipan"
        }
    }
; // const

(async ({'config': config}) => {

    config.server.url   = testsuite_id;
    config.testbed      = testbed;

    const
        testsuite_agent = await TestsuiteAgent({
            'id':      testsuite_id,
            'testbed': config.testbed
        })
    ;

    const APP_testsuite = require('./app.testsuite.js')({
        'space':  undefined,
        'agent':  testsuite_agent,
        'config': config
    });
    //debugger;
})({'config': config}).catch(console.error);

