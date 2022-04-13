const
    config         = require('./config/config.testsuite.js'),
    util           = require('./code/util.testsuite.js'),
    BasicAuth      = require('@nrd/fua.agent.amec/BasicAuth'),
    TestsuiteAgent = require('./code/beta_agent.testsuite.js'),
    TestsuiteApp   = require('./beta_app.testsuite.js'),
    TestsuiteLab   = require('./beta_lab.testsuite.js')
; // const

(async function LaunchTestsuite() {

    const testsuiteAgent = await TestsuiteAgent.create({
        schema:   (config.server.url.match(/^\w+(?=:\/\/)/) || ['http'])[0],
        hostname: (config.server.url.match(/^\w+:\/\/([^/#:]+)(?=[/#:]|$)/) || [null, 'localhost'])[1],
        port:     config.server.port,
        context:  config.space.context,
        store:    config.space.datastore,
        // space:     config.space,
        amec:     true,
        server:   config.server.options,
        app:      true,
        io:       true,
        domain:   true,
        sessions: {
            resave:            false,
            saveUninitialized: false,
            secret:            config.server.id
        },
        prefix:   'ts',
        testbed:  config.testbed
    });

    testsuiteAgent.amec.registerMechanism(BasicAuth.prefLabel, BasicAuth({
        domain: testsuiteAgent.domain
    }));

    testsuiteAgent.testcases = {
        net: require(`./tc/ec/net/tc.ec.net.launch`)({
            root_uri:    config.server.id,
            agent:       {
                test: testsuiteAgent.test.bind(testsuiteAgent)
            },
            console_log: false
        }),
        ids: require(`./tc/ec/ids/tc.ec.ids.launch`)({
            root_uri:    config.server.id,
            agent:       {
                test: testsuiteAgent.test.bind(testsuiteAgent)
            },
            console_log: false
        })
    };

    await TestsuiteApp({
        'config': config,
        'agent':  testsuiteAgent
    });

    await TestsuiteLab({
        'config': config,
        'agent':  testsuiteAgent
    });

})().catch((err) => {
    util.logError(err);
    debugger;
    process.exit(1);
}); // LaunchTestsuite
