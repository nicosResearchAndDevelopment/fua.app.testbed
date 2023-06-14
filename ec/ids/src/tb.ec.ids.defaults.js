const defaults = exports;

defaults.daps = {
    url:          'https://daps.tb.nicos-rd.com/',
    tweakerPath:  '/tweak',
    observerPath: '/observe'
};

defaults.alice = {
    url: 'https://alice.tb.nicos-rd.com/'
};

defaults.bob = {
    url: 'https://bob.tb.nicos-rd.com/'
};

defaults.socketIO = {
    options: {
        rejectUnauthorized: false,
        connectTimeout:     60e3
        // reconnectionAttempts: 5
    }
};
