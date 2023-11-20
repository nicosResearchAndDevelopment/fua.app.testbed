const
    Testbed            = exports,
    {name: identifier} = require('../../package.json'),
    assert             = require('@nrd/fua.core.assert');

assert(!global[identifier], 'unable to load a second uncached version of the singleton ' + identifier);
Object.defineProperty(global, identifier, {value: Testbed, configurable: false, writable: false, enumerable: false});

const
    _Testbed     = Object.create(null),
    is           = require('@nrd/fua.core.is'),
    tty          = require('@nrd/fua.core.tty'),
    testing      = require('@nrd/fua.module.testing'),
    EventEmitter = require('events');

_Testbed.emitter = new EventEmitter();

Object.defineProperties(Testbed, {
    testing: {get: () => _Testbed.testing || null, enumerable: true},
    on:      {value: (event, callback) => _Testbed.emitter.on(event, callback) && Testbed, enumerable: true},
    once:    {value: (event, callback) => _Testbed.emitter.once(event, callback) && Testbed, enumerable: true},
    off:     {value: (event, callback) => _Testbed.emitter.off(event, callback) && Testbed, enumerable: true},
    emit:    {value: (event, ...args) => _Testbed.emitter.emit(event, ...args) && Testbed, enumerable: true}
});

Testbed.initialize = async function (options = {}) {
    assert.object(options);
    assert(!_Testbed.initialized, 'already initialized');
    _Testbed.initialized = true;

    _Testbed.testing = new testing.Provider({
        '@id':      options.uri,
        ecosystems: Object.values(options.ecosystem).map(({module}) => module)
    });

    await Promise.all(Object.entries(options.ecosystem).map(async ([label, {module, ...options}]) => {
        await module.initialize(options);
        tty.log.text('ecosystem ' + label + ' initialized');
    }));

    return Testbed;
};

// TODO implement functionality

Object.freeze(Testbed);
module.exports = Testbed;
