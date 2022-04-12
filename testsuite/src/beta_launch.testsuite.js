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

        // TODO

    });

    testsuiteAgent.amec.registerMechanism(BasicAuth.prefLabel, BasicAuth({
        domain: testsuiteAgent.domain
    }));

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
