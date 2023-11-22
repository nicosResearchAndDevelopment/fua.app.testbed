#!/usr/bin/env node

const
    util       = require('./code/util.testbed.js'),
    BasicAuth  = require('@nrd/fua.agent.amec/BasicAuth'),
    ecosystems = {
        net: require('../ec/net/src/tb.ec.net.js'),
        ids: require('../ec/ids/src/tb.ec.ids.js'),
        dev: require('../ec/dev/src/tb.ec.dev.js')
    };

require('@nrd/fua.core.app').launch({
    config: {
        default: require('./config/config.testbed.js')
    },
    agent:  {
        class:  require('./code/agent.testbed.js'),
        param:  {
            amec:      true,
            app:       true,
            io:        true,
            event:     true,
            domain:    true,
            scheduler: {
                //    'idle': '*/30 * * * * *'
            }
        },
        mapper: (config) => ({
            uri:        config.space.uri,
            schema:     config.server.schema,
            hostname:   config.server.hostname,
            port:       config.server.port,
            context:    config.space.context,
            store:      config.space.store,
            server:     config.server.options,
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
            ecosystems: Object.keys(config.ecosystem).map(ecName => ecosystems[ecName])
        }),
        async setup({agent, config}) {
            agent.amec.registerMechanism(BasicAuth.prefLabel, BasicAuth({
                domain: agent.domain
            }));
            util.logText('setup ecosystems');
            await Promise.all(Object.entries(config.ecosystem).map(([ecName, ecConfig]) => ecosystems[ecName].initialize(ecConfig)));
        }
    },
    app:    {
        launch:  require('./app.testbed.js'),
        develop: require('./lab.testbed.js')
    }
});
