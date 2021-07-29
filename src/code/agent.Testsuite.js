const
    path   = require('path'),
    //
    util   = require('@nrd/fua.core.util'),
    //
    {Self} = require(path.join(util.FUA_JS_LIB, 'agent.Self/src/agent.Self.js'))
;

function Testsuite({
                       'prefix': prefix = {
                           'testsuite': "ts:",
                           'testbed':   "tb:",
                           'domain':    "domain:"
                       },
                       'type':   type = [],
                       'domain': domain,
                       'fn':     fn = undefined,
                       'node':   node = undefined
                   }) {

    type.push(Testsuite);

    fn = (fn || (async function testsuite() {
        try {
            let presentation = {
                '@context': undefined,
                '@id':      testsuite['@id'],
                '@type':    ((testsuite['@type']) ? testsuite['@type'].map((type) => {
                    return (type['@id'] || type);
                }) : undefined)
            };

            let temp_predicate;

            temp_predicate = `${prefix.domain}domain`;
            if (testsuite[temp_predicate] && !presentation[temp_predicate])
                presentation[temp_predicate] = await testsuite[temp_predicate]();

            return presentation;
        } catch (jex) {
            throw jex;
        } // try
    }));

    if (new.target) {
        if (!node['@id'])
            throw new Error(`Testsuite : id is missing on node.`)
        Object.defineProperties(fn, {
            '@id':   {value: node['@id']},
            '@type': {value: type}
        });
    } // if ()

    Self({
        'prefix': {
            'self':   prefix.testsuite,
            'domain': prefix.domain
        },
        'type':   type,
        'domain': domain,
        'fn':     fn,
        'node':   node
    });

    //Object.defineProperties(fn, {
    //    '$mahl': {value: "...zeit"}
    //});

    return fn;
} // Testsuite

Object.defineProperties(Testsuite, {
    '@id': {value: "fua.agent.Testsuite"}
});

exports.Testsuite = Testsuite;