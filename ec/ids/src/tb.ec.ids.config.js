const
    config = exports,
    util   = require('./tb.ec.ids.util.js');

config.daps = {
    // id:     'urn:tb:ec:ids:rc:daps',
    url:         'https://daps.tb.nicos-rd.com/',
    tweakerUrl:  'https://daps.tb.nicos-rd.com/tweak',
    observerUrl: 'https://daps.tb.nicos-rd.com/observe'
    // url:         'https://daps.tb.nicos-rd:8080/',
    // tweakerUrl:  'https://daps.tb.nicos-rd:8080/tweak',
    // observerUrl: 'https://daps.tb.nicos-rd:8080/observe'
};

config.alice = {
    // id:        'urn:tb:ec:ids:rc:alice',
    url: 'https://alice.tb.nicos-rd.com/'
    // url: 'https://alice.tb.nicos-rd:8080/'
};

config.bob = {
    // id:        'urn:tb:ec:ids:rc:bob',
    url: 'https://bob.tb.nicos-rd.com/'
    // url: 'https://bob.tb.nicos-rd:8080/'
};

config.socketIO = {
    options: {
        rejectUnauthorized: false,
        connectTimeout:     60e3
        // reconnectionAttempts: 5
    }
};
