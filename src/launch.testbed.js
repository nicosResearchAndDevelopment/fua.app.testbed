const
    config        = require('./config/config.testbed.js'),
    util          = require('./code/util.testbed.js'),
    BasicAuth     = require('@nrd/fua.agent.amec/BasicAuth'),
    TestbedAgent  = require('./code/agent.testbed.js'),
    TestbedApp    = require('./app.testbed.js'),
    TestbedLab    = require('./lab.testbed.js'),
    initializeNet = require('../ec/net/src/initialize.net.js'),
    initializeIDS = require('../ec/ids/src/initialize.ids.js'),
    initializeLDP = require('../ec/ldp/src/initialize.ldp.js')
; // const

(async function LaunchTestbed() {

    /* 1. Construct a server agent for your setup: */

    util.logText('creating testbed agent');

    const testbedAgent = await TestbedAgent.create({
        schema:   'https',
        hostname: 'testbed.nicos-rd.com',
        port:     8080,
        context:  config.space.context,
        store:    config.space.datastore,
        // space:     config.space,
        amec:      true,
        server:    config.server.options,
        app:       true,
        io:        true,
        event:     true,
        domain:    true,
        sessions:  {
            resave:            false,
            saveUninitialized: false,
            secret:            config.server.id
        },
        daps:      {
            keys:                      {
                default: {
                    publicKey:  config.cert.daps_connector.publicKey,
                    privateKey: config.cert.daps_connector.privateKey
                }
            },
            publicKey:                 config.cert.daps_connector.publicKey,
            privateKey:                config.cert.daps_connector.privateKey,
            tweak_DAT_custom_enabled:  true,
            tweak_DAT_custom_max_size: 10000
        },
        scheduler: {
            'idle': '*/30 * * * * *'
        }
    });

    /* 2. Use additional methods to configure the setup: */

    testbedAgent.event.on('*', (event) => testbedAgent.emit('event', event));

    testbedAgent.amec.registerMechanism(BasicAuth.prefLabel, BasicAuth({
        domain: testbedAgent.domain
    }));

    /* 3. Wait for all ecosystems to initialize: */

    util.logText('initializing ecosystems');

    await Promise.all([
        initializeNet({'agent': testbedAgent}),
        initializeIDS({'agent': testbedAgent}),
        initializeLDP({'agent': testbedAgent})
    ]);

    util.logText('ecosystems initialized (' + Object.keys(testbedAgent.ecosystems).join(', ') + ')');

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

    util.logText('launch complete');

})().catch((err) => {

    /* ERR. Log any error during launch and exit the application: */

    util.logError(err);
    debugger;
    process.exit(1);

}); // LaunchTestbed
