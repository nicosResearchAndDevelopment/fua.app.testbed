#!/usr/bin/env node

const
    path    = require('path'),
    App     = require('@nrd/fua.agent.app'),
    Testbed = require('./code/testbed.js');

App.launch({
    app:    require('./app.js'),
    config: {
        ...require('./config.json'),
        tb: {
            testing:   {
                uri: 'https://tb.nicos-rd.com/'
            },
            ecosystem: {
                net: {
                    module: require('../ec/net/src/tb.ec.net.js')
                },
                ids: {
                    module: require('../ec/ids/src/tb.ec.ids.js'),
                    config: {
                        daps:  {
                            url: 'https://daps.tb.nicos-rd.com/'
                        },
                        alice: {
                            url: 'https://alice.tb.nicos-rd.com/'
                        },
                        bob:   {
                            // url: 'https://alice.tb.nicos-rd.com/'
                            url: 'https://bob.tb.nicos-rd.com/'
                        }
                    }
                },
                dev: {
                    module: require('../ec/dev/src/tb.ec.dev.js')
                }
            }
        }
    },
    async initialize(config) {
        await Testbed.initialize(config.tb);
        return {tb: Testbed};
    },
    space:  {
        store: {
            module:  'filesystem',
            options: {
                defaultFile: 'file://data.ttl',
                loadFiles:   [
                    {
                        'dct:identifier': path.join(__dirname, '../data/load.json'),
                        'dct:format':     'application/fua.load+json'
                    },
                    require('@nrd/fua.resource.ontology.core')
                ]
            }
        }
    },
    server: true,
    events: true,
    amec:   true,
    domain: true,
    helmut: true
});
