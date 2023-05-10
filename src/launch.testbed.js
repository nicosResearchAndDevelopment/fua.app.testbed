#!/usr/bin/env node

const
    config       = require('./config/config.testbed.js'),
    util         = require('./code/util.testbed.js'),
    BasicAuth    = require('@nrd/fua.agent.amec/BasicAuth'),
    TestbedAgent = require('./code/agent.testbed.js'),
    TestbedApp   = require('./app.testbed.js'),
    TestbedLab   = require('./lab.testbed.js'),
    ecosystems   = {
        net: require('../ec/net/src/tb.ec.net.js'),
        ids: require('../ec/ids/src/tb.ec.ids.js')
    };

(async function LaunchTestbed() {

    /* 1. Construct a server agent for your setup: */

    util.logText('creating testbed agent');

    const testbedAgent = await TestbedAgent.create({
        uri:        config.space.uri,
        schema:     config.server.schema,
        hostname:   config.server.hostname,
        port:       config.server.port,
        context:    config.space.context,
        store:      config.space.store,
        amec:       true,
        server:     config.server.options,
        app:        true,
        io:         true,
        event:      true,
        domain:     true,
        sessions:   {
            resave:            false,
            saveUninitialized: false,
            secret:            config.space.uri
        },
        daps:       {
            keys:                      {
                default: {
                    publicKey:  config.connector.publicKey,
                    privateKey: config.connector.privateKey
                }
            },
            publicKey:                 config.connector.publicKey,
            privateKey:                config.connector.privateKey,
            tweak_DAT_generation:      true,
            tweak_DAT_custom_enabled:  true,
            tweak_DAT_custom_max_size: 10000
        },
        scheduler:  {
            //    'idle': '*/30 * * * * *'
        },
        ecosystems: Object.keys(config.ecosystem).map(ecName => ecosystems[ecName])
    });

    /* 2. Use additional methods to configure the setup: */

    testbedAgent.amec.registerMechanism(BasicAuth.prefLabel, BasicAuth({
        domain: testbedAgent.domain
    }));

    /* 3. Wait for all ecosystems to initialize: */

    util.logText('initializing ecosystems');

    await Promise.all(Object.entries(config.ecosystem)
        .map(([ecName, ecConfig]) => ecosystems[ecName].initialize(ecConfig)));

    util.logText('ecosystems initialized (' + Object.keys(config.ecosystem).join(', ') + ')');

    /* 4. Launch the main app: */

    util.logText('starting application');

    await TestbedApp({
        'config': config,
        'agent':  testbedAgent
    });

    /* 5. Launch the testing lab: */

    await TestbedLab({
        'config': config,
        'agent':  testbedAgent
    });

    util.logSuccess('launch complete');

})().catch((err) => {

    /* ERR. Log any error during launch and exit the application: */

    util.logError(err);
    debugger;
    process.exit(1);

}); // LaunchTestbed
