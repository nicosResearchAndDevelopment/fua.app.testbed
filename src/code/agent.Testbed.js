const
    path        = require('path'),
    //
    util        = require('@nrd/fua.core.util'),
    //
    {Self}      = require(path.join(util.FUA_JS_LIB, 'agent.Self/src/agent.Self.js')),
    // TODO : beta
    {System}    = require(path.join(util.FUA_JS_LIB, 'agent.System/src/agent.System.beta.js')),
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
                     'prefix': prefix = {
                         'testbed': "tb:",
                         'tb':      "tb:",
                         //'testsuite': "ts:",
                         //'ts':        "ts:",
                         'system': "sys:",
                         'sys':    "sys:",
                         'domain': "dom:",
                         'dom':    "dom:"
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

            temp_predicate = `${prefix.system}system`;
            if (testbed[temp_predicate] && !presentation[temp_predicate])
                presentation[temp_predicate] = await testbed[temp_predicate]();

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
            throw new ErrorTestbedIdIsMissing(`id is missing on node`)
        Object.defineProperties(fn, {
            '@id':   {value: node['@id'], enumerable: true},
            '@type': {value: type, enumerable: true}
        });
    } // if ()

    //if (system) {
        const
            // TODO : BETA!!! :: agent.System/src/agent.System.beta.js
            {Device} = require(path.join(util.FUA_JS_LIB, 'agent.System/src/agent.System.beta.js'))
        ;
    //    Object.defineProperty(fn, `${prefix['system']}system`, {
    //        value: system, enumerable: true
    //    });
    //    type.push(System);
    //} else {
    //    tmp_node = (node['system'] || node[`${prefix['system']}system`]);
    //    if (tmp_node) {
    //        const
    //            // TODO : BETA!!! :: agent.System/src/agent.System.beta.js
    //            {System} = require(path.join(util.FUA_JS_LIB, 'agent.System/src/agent.System.beta.js'))
    //        ;
    //        Object.defineProperty(fn, `${prefix['system']}system`, {
    //            value:      new System({
    //                'type': [],
    //                'node': tmp_node,
    //                'fn':   undefined
    //            }),
    //            enumerable: true
    //        });
    //        type.push(System);
    //    } // if ()
    //} // if ()

    Self({
        'prefix': {
            'self':   prefix.testbed,
            'system': prefix.sys,
            'sys':    prefix.sys,
            'domain': prefix.dom,
            'dom':    prefix.dom
        },
        'type':   type,
        //
        'System': Device,
        'domain': undefined,
        //
        'fn':   fn,
        'node': node
    });

    tmp_node = (node['testsuite'] || node[`${prefix['testbed']}testsuite`]);
    if (tmp_node)
        // REM : object-property 'testsuite' comes from testbed-model ('tbm')
        Object.defineProperty(fn, `${prefix['testbed']}testsuite`, {
            value:      new Testsuite({
                'type': [],
                //
                'self':   false, // REM : to prevent testsuite to get self once again...
                'system': fn[`${prefix.system}system`],
                'domain': fn[`${prefix.domain}domain`],
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