#!/usr/bin/env node

const
    path    = require('path'),
    App     = require('@nrd/fua.agent.app'),
    Testbed = require('./app/testbed.js');

App.launch({
    app: require('./app/app.js'),
    async initialize(config) {
        await Testbed.initialize(config.tb);
        return {tb: Testbed};
    },
    config: {
        app: {
            about: {
                issuer:           'https://tb.nicos-rd.com/',
                software_version: require('../package.json').version
            },
            ldp:   {
                uri: 'https://tb.nicos-rd.com/'
            }
        },
        tb:  {
            uri:       'https://tb.nicos-rd.com/',
            ecosystem: {
                net: {
                    module: require('../ec/net/src/tb.ec.net.js')
                },
                ids: {
                    module: require('../ec/ids/src/tb.ec.ids.js'),
                    config: {
                        daps:  {
                            url:     'https://daps.tb.nicos-rd.com/',
                            options: {
                                extraHeaders: {
                                    'Authorization': 'Basic ' + Buffer.from('testbed:testing').toString('base64')
                                }
                            }
                        },
                        alice: {url: 'https://alice.tb.nicos-rd.com/'},
                        bob:   {url: 'https://bob.tb.nicos-rd.com/'}
                    }
                },
                dev: {
                    module: require('../ec/dev/src/tb.ec.dev.js')
                }
            }
        }
    },
    server: {
        port:    3000,
        app:     true,
        io:      true,
        session: {
            secret:            '@nrd/fua.app.testbed',
            resave:            false,
            saveUninitialized: false
        }
    },
    space:  {
        context: {
            'ids':  'https://w3id.org/idsa/core/',
            'idsc': 'https://w3id.org/idsa/code/',
            'fua':  'https://www.nicos-rd.com/fua#',
            'dom':  'https://www.nicos-rd.com/fua/domain#',
            'ecm':  'https://www.nicos-rd.com/fua/ecosystem#',
            'daps': 'https://www.nicos-rd.com/fua/daps#',
            'tb':   'https://tb.nicos-rd.com/',
            'tbm':  'https://www.nicos-rd.com/fua/testbed#'
        },
        store:   {
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
    amec:   {
        mechanisms: [{
            authType:     "BasicAuth",
            usernameAttr: "dom:name",
            passwordAttr: "dom:password"
        }]
    },
    domain: {
        uri: 'https://tb.nicos-rd.com/domain/'
    },
    helmut: true,
    events: true
});
