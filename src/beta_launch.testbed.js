const
    config       = require('./config/config.testbed.js'),
    util         = require('./code/util.testbed.js'),
    BasicAuth    = require('@nrd/fua.agent.amec/BasicAuth'),
    TestbedAgent = require('./code/beta_agent.Testbed.js'),
    TestbedApp   = require('./beta_app.testbed.js'),
    TestbedLab   = require('./beta_lab.testbed.js')
; // const

(async function LaunchTestbed() {

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
            '@id':   'http://testbed.nicos-rd.com/scheduler/',
            '@type': 'http://www.nicos-rd.com/fua/agent/scheduler#Scheduler',
            'owner': {
                '@id':   'http://www.nicos-rd.com/SYSTEM/owner/',
                '@type': 'foaf:Agent'
            },
            // TODO : hier könnte man vielleicht auch duration 'PT1.42S' gehen?!?
            'idle_emit_threshold': {'@type': 'xsd:decimal', '@value': /** seconds */ 60.0},
            'hasTRS':              'http://dbpedia.org/resource/Unix_time'
        }
    });

    testbedAgent.amec.registerMechanism(BasicAuth.prefLabel, BasicAuth({
        domain: testbedAgent.domain
    }));

    await TestbedApp({
        'config': config,
        'agent':  testbedAgent
    });

    await TestbedLab({
        'config': config,
        'agent':  testbedAgent
    });

})().catch((err) => {
    util.logError(err);
    debugger;
    process.exit(1);
}); // LaunchTestbed
