const
    path        = require('path'),
    //
    util        = require('@nrd/fua.core.util'),
    //
    {Self}      = require(path.join(util.FUA_JS_LIB, 'agent.Self/src/agent.Self.js')),
    // TODO : beta
    {Time}      = require(path.join(util.FUA_JS_LIB, 'agent.Time/src/agent.Time.js')),
    {System}    = require(path.join(util.FUA_JS_LIB, 'agent.System/src/agent.System.beta.js')),
    {Device}    = require(path.join(util.FUA_JS_LIB, 'agent.System/src/agent.System.beta.js')),
    {Testsuite} = require('./agent.Testsuite.js')// REM: as agent
;

//region error

class ErrorTestbedIdIsMissing extends Error {
    constructor(message) {
        super(`${timestamp()}] : fua.agent.Testbed : Testbed :: ${message}`);
    }
}

//endregion error

//region fn
function timestamp() {
    return (new Date).toISOString();
}

//endregion fn

function Testbed({
                     'prefix':                 prefix = {
                         'testbed': "tb:",
                         'tb':      "tb:",
                         //'testsuite': "ts:",
                         //'ts':        "ts:",
                         'system': "sys:",
                         'sys':    "sys:",
                         'domain': "dom:",
                         'dom':    "dom:"
                     },
                     'prefix_self':            prefix_self = "",
                     'prefix_self_model':      prefix_self_model = "",
                     'prefix_system':          prefix_system = "",
                     'prefix_system_model':    prefix_system_model = "",
                     'prefix_domain':          prefix_domain = "",
                     'prefix_domain_model':    prefix_domain_model = "",
                     'prefix_ldp_model':       prefix_ldp_model = "",
                     'prefix_testsuite':       prefix_testsuite = "",
                     'prefix_testsuite_model': prefix_testsuite_model = "",
                     'prefix_testbed':         prefix_testbed = "",
                     'prefix_testbed_model':   prefix_testbed_model = "",
                     //
                     'type': type = [],
                     'fn':   fn = undefined,
                     'node': node = undefined
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

            temp_predicate = `${prefix_system_model}system`;
            if (testbed[temp_predicate] && !presentation[temp_predicate])
                presentation[temp_predicate] = await testbed[temp_predicate]();

            temp_predicate = `${prefix_domain_model}domain`;
            if (testbed[temp_predicate] && !presentation[temp_predicate])
                presentation[temp_predicate] = await testbed[temp_predicate]();

            temp_predicate = `${prefix_testbed_model}testsuite`;
            if (testbed[temp_predicate] && !presentation[temp_predicate])
                presentation[temp_predicate] = await testbed[temp_predicate]();

            return presentation;
        } catch (jex) {
            throw jex;
        } // try
    }));

    if (new.target) {
        if (!node['@id'])
            throw new ErrorTestbedIdIsMissing(`id is missing on node`)
        Object.defineProperties(fn, {
            '@id':   {value: node['@id'], enumerable: true},
            '@type': {value: type, enumerable: true}
        });
    } // if ()

    Self({
        'prefix':                 {
            'self':   prefix.testbed,
            'system': prefix.sys,
            'sys':    prefix.sys,
            'domain': prefix.dom,
            'dom':    prefix.dom
        },
        'prefix_self':            prefix_self,
        'prefix_self_model':      prefix_self_model,
        'prefix_system':          prefix_system,
        'prefix_system_model':    prefix_system_model,
        'prefix_domain':          prefix_domain,
        'prefix_domain_model':    prefix_domain_model,
        'prefix_ldp_model':       prefix_ldp_model,
        'prefix_testsuite':       prefix_testsuite,
        'prefix_testsuite_model': prefix_testsuite_model,
        'prefix_testbed':         prefix_testbed,
        'prefix_testbed_model':   prefix_testbed_model,
        //
        'type': type,
        //
        'System': Device,
        'domain': undefined,
        //
        'fn':   fn,
        'node': node
    });

    tmp_node = (node['testsuite'] || node[`${prefix_testbed_model}testsuite`]);
    if (tmp_node)
        // REM : object-property 'testsuite' comes from testbed-model ('tbm')
        Object.defineProperty(fn, `${prefix_testbed_model}testsuite`, {
            value:      new Testsuite({
                'prefix_self':            prefix_self,
                'prefix_self_model':      prefix_self_model,
                'prefix_system':          prefix_system,
                'prefix_system_model':    prefix_system_model,
                'prefix_domain':          prefix_domain,
                'prefix_domain_model':    prefix_domain_model,
                'prefix_testsuite':       prefix_testsuite,
                'prefix_testsuite_model': prefix_testsuite_model,
                'prefix_testbed':         prefix_testbed,
                'prefix_testbed_model':   prefix_testbed_model,
                //
                'type': [],
                //
                'self':   false, // REM : to prevent testsuite to get self once again...
                'system': fn[`${prefix_system_model}system`],
                'domain': fn[`${prefix_domain_model}domain`],
                //
                'node': tmp_node,
                'fn':   undefined
            }),
            enumerable: true
        });

    return fn;
} // Testbed

Object.defineProperties(Testbed, {
    '@id': {value: "fua.agent.Testbed"}
});

exports.Testbed = Testbed;