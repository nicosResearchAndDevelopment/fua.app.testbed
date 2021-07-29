const
    path        = require('path'),
    //
    util        = require('@nrd/fua.core.util'),
    //
    {Self}      = require(path.join(util.FUA_JS_LIB, 'agent.Self/src/agent.Self.js')),
    {Testsuite} = require('./agent.Testsuite.js')// REM: as agent
;

function Testbed({
                     'prefix': prefix = {
                         'testbed':   "tb:",
                         'testsuite': "ts:",
                         'domain':    "domain:"
                     },
                     'type':   type = [],
                     'fn':     fn = undefined,
                     'node':   node = undefined
                 }) {

    let tmp_node;

    type.push(Testbed);

    fn = (fn || (async function testbed() {
        try {
            let presentation = {
                '@context': undefined,
                '@id':      testbed['@id'],
                '@type':    ((testbed['@type']) ? testbed['@type'].map((type) => {
                    return (type['@id'] || type);
                }) : undefined)
            };

            let temp_predicate;

            temp_predicate = `${prefix.domain}domain`;
            if (testbed[temp_predicate] && !presentation[temp_predicate])
                presentation[temp_predicate] = await testbed[temp_predicate]();

            temp_predicate = `${prefix.testbed}testsuite`;
            if (testbed[temp_predicate] && !presentation[temp_predicate])
                presentation[temp_predicate] = await testbed[temp_predicate]();

            return presentation;
        } catch (jex) {
            throw jex;
        } // try
    }));

    if (new.target) {
        if (!node['@id'])
            throw new Error(`Testbed : id is missing on node.`)
        Object.defineProperties(fn, {
            '@id':   {value: node['@id']},
            '@type': {value: type}
        });
    } // if ()

    Self({
        'prefix': {
            'self':   prefix.testbed,
            'domain': prefix.domain
        },
        'type':   type,
        'domain': undefined,
        'fn':     fn,
        'node':   node
    });

    tmp_node = (node['testsuite'] || node[`${prefix['testbed']}testsuite`]);
    if (tmp_node)
        Object.defineProperty(fn, `${prefix['testbed']}testsuite`, {
            value: new Testsuite({
                'type':   [],
                'domain': fn[`${prefix.domain}domain`],
                'node':   tmp_node,
                'fn':     undefined
            })
        });

    return fn;
} // Testbed

Object.defineProperties(Testbed, {
    '@id': {value: "fua.agent.Testbed"}
});

exports.Testbed = Testbed;