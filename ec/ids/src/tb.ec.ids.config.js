const
    config = exports,
    util   = require('./tb.ec.ids.util.js');
// aliceCerts = require('../data/alice/cert/index.js'),
// bobCerts   = require('../data/bob/cert/index.js');

config.daps = {
    url:         'https://daps.tb.nicos-rd.com/',
    tweakerUrl:  'https://daps.tb.nicos-rd.com/tweak',
    observerUrl: 'https://daps.tb.nicos-rd.com/observe'
    // url:    'https://daps.tb.nicos-rd.com:443/',
    // id:     'urn:tb:ec:ids:rc:daps',
    // server: {
    //     schema: 'https',
    //     // hostname: 'nrd-daps.nicos-rd.com',
    //     // port:     8083,
    //     hostname: 'daps.tb.nicos-rd.com',
    //     port:     443
    // },
    // http:   {
    //     headers: {
    //         // 'Authorization': 'Basic ...',
    //         // 'Authorization': 'Bearer ...',
    //     },
    //     agent:   new util.https.Agent({
    //         key:  aliceCerts.server.key.toString(),
    //         cert: aliceCerts.server.cert.toString(),
    //         ca:   aliceCerts.server.ca.toString()
    //     })
    // }
};

config.alice = {
    url: 'https://alice.tb.nicos-rd.com/'
    // url: 'https://localhost:8099/'
    // launcher:  './rc/connector/launch.rc-connector.js',
    // id:        'urn:tb:ec:ids:rc:alice',
    // server:    {
    //     schema: 'https',
    //     // hostname: 'alice.nicos-rd.com',
    //     hostname: 'localhost',
    //     port:     8099,
    //     options:  {
    //         key:  aliceCerts.server.key.toString(),
    //         cert: aliceCerts.server.cert.toString(),
    //         ca:   aliceCerts.server.ca.toString()
    //     }
    // },
    // connector: {
    //     uri: 'https://alice.nicos-rd.com/',
    //     id:  aliceCerts.connector.meta.SKIAKI,
    //     key: aliceCerts.connector.key.toString(),
    //     pub: aliceCerts.connector.pub.toString()
    // },
    // daps:      {
    //     default: {
    //         dapsUrl:       config.daps.url,
    //         dapsTokenPath: '/token',
    //         dapsJwksPath:  '/jwks.json'
    //     }
    // }
};

config.bob = {
    url: 'https://bob.tb.nicos-rd.com/'
    // url: 'https://localhost:8098/'
    // launcher:  './rc/connector/launch.rc-connector.js',
    // id:        'urn:tb:ec:ids:rc:bob',
    // server:    {
    //     schema: 'https',
    //     // hostname: 'bob.nicos-rd.com',
    //     hostname: 'localhost',
    //     port:     8098,
    //     options:  {
    //         key:  bobCerts.server.key.toString(),
    //         cert: bobCerts.server.cert.toString(),
    //         ca:   bobCerts.server.ca.toString()
    //     }
    // },
    // connector: {
    //     uri: 'https://bob.nicos-rd.com/',
    //     id:  bobCerts.connector.meta.SKIAKI,
    //     key: bobCerts.connector.key.toString(),
    //     pub: bobCerts.connector.pub.toString()
    // },
    // daps:      {
    //     default: {
    //         dapsUrl:       config.daps.url,
    //         dapsTokenPath: '/token',
    //         dapsJwksPath:  '/jwks.json'
    //     }
    // }
};

config.socketIO = {
    options: {
        rejectUnauthorized: false,
        connectTimeout:     60e3
        // reconnectionAttempts: 5
    }
};
