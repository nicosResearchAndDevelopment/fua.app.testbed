const
    path   = require('path'),
    //
    util   = require('@nrd/fua.core.util'),
    //
    {Self} = require(path.join(util.FUA_JS_LIB, 'agent.Self/src/agent.Self.js'))
;

//region error

class ErrorTestsuiteIdIsMissing extends Error {
    constructor(message) {
        super(`fua.agent.Testsuite: Testsuite :: ${message}`);
    }
}

//endregion error

function Testsuite({
                       'prefix': prefix = {
                           'testsuite': "ts:",
                           'testbed':   "tb:",
                           'system':    "sys:",
                           'sys':       "sys:",
                           'domain':    "dom:",
                           'dom':       "dom:"
                       },
                       'type':   type = [],
                       //
                       'self':   self = true,
                       'system': system = undefined,
                       'domain': domain = undefined,
                       //
                       'fn':   fn = undefined,
                       'node': node = undefined
                   }) {

    let tmp_node;

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

            temp_predicate = `${prefix.system}system`;
            if (testsuite[temp_predicate] && !presentation[temp_predicate])
                presentation[temp_predicate] = await testsuite[temp_predicate]();

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
            throw new ErrorTestsuiteIdIsMissing(`id is missing on node.`)
        Object.defineProperties(fn, {
            '@id':   {value: node['@id'], enumerable: true},
            '@type': {value: type, enumerable: true}
        });
    } // if ()

    if (/** boolean */ self) {
        Self({
            'prefix': {
                'self':   prefix.testsuite,
                'system': prefix.system,
                'sys':    prefix.sys,
                'domain': prefix.domain,
                'dom':    prefix.domain
            },
            'type':   type,
            //
            'domain': domain,
            'system': system,
            //
            'fn':   fn,
            'node': node
        });
    } else {
        if (system) {
            const
                {System} = require(path.join(util.FUA_JS_LIB, 'agent.System/src/agent.System.beta.js'))
            ;
            Object.defineProperty(fn, `${prefix['system']}system`, {
                value: system, enumerable: true
            });
            type.push(System);
        } else {
            tmp_node = (node['system'] || node[`${prefix['system']}system`]);
            if (tmp_node) {
                const
                    // TODO : BETA!!! :: agent.System/src/agent.System.beta.js
                    {System} = require(path.join(util.FUA_JS_LIB, 'agent.System/src/agent.System.beta.js'))
                ;
                Object.defineProperty(fn, `${prefix['system']}system`, {
                    value:      new System({
                        'type': [],
                        'node': tmp_node,
                        'fn':   undefined
                    }),
                    enumerable: true
                });
            } // if ()
            type.push(System);
        } // if ()

        if (domain) {
            //const
            // TODO :    {Domain} = require(path.join(util.FUA_JS_LIB, 'agent.Domain/src/agent.Domain.js'))
            //;
            Object.defineProperty(fn, `${prefix['domain']}domain`, {
                value:      domain,
                enumerable: true
            });
            // TODO : type.push(Domain);
        } else {
            tmp_node = (node['domain'] || node[`${prefix['domain']}domain`]);
            if (tmp_node)
                // TODO : require(Domain)?!?
                //const
                // TODO : {Domain} = require(path.join(util.FUA_JS_LIB, 'agent.Domain/src/agent.Domain.js'))
                //;
                Object.defineProperty(fn, `${prefix['domain']}domain`, {
                    // TODO : this will burn!
                    value:        new Domain({
                        'type': [],
                        'node': tmp_node,
                        'fn':   undefined
                    })
                    , enumerable: true
                });
        } // if ()

    } // if ()

    return fn;
} // Testsuite

Object.defineProperties(Testsuite, {
    '@id': {value: "fua.agent.Testsuite", enumerable: true}
});

exports.Testsuite = Testsuite;