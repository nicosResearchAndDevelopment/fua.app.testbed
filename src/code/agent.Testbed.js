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

//function contextHasPrefix(contexts, prefix) {
//    let result = false;
//    for (let i = 0; ((!result) && (i < contexts.length)); i++) {
//        result = ((contexts[i][prefix]) ? true : false)
//    } // for (i)
//    return result;
//}

//endregion fn

function TestbedAgent({
                          '@context':               context_parent = [],
                          '@id':                    id,
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
                          'node': node = undefined,
                          'app':  app,
                          //
                          'tb_util': tb_util
                      }) {

    const
        context_self = context_parent.concat(TestbedAgent['@context']), // REM: self context
        owner        = app['owner'] // TODO : sollte auch eine async function sein, wenn die app implementiert ist...
    ;
    let
        tmp_prefix,
        tmp_node
    ;

    id = ((id) ? (`${id}agent/`) : (`${tb_util['idAsBlankNode']()}/agent/`));
    type.push(TestbedAgent);

    fn = (fn || (async function /** as self */ testbedAgent() {
        try {
            let presentation = {
                '@context': undefined,
                '@id':      testbedAgent['@id'],
                '@type':    ((testbedAgent['@type']) ? testbedAgent['@type'].map((type) => {
                    return (type['@id'] || type);
                }) : undefined)
            };

            let temp_predicate;
            temp_predicate = `owner`;
            if (testbedAgent[temp_predicate])
                presentation[temp_predicate] = await testbedAgent[temp_predicate]();

            temp_predicate = `scheduler`;
            if (testbedAgent[temp_predicate] && !presentation[temp_predicate])
                presentation[temp_predicate] = await testbedAgent[temp_predicate]();

            //temp_predicate = `${prefix_system_model}system`;
            temp_predicate = `system`;
            if (testbedAgent[temp_predicate] && !presentation[temp_predicate])
                presentation[temp_predicate] = await testbedAgent[temp_predicate]();

            //temp_predicate = `${prefix_domain_model}domain`;
            temp_predicate = `domain`;
            if (testbedAgent[temp_predicate] && !presentation[temp_predicate])
                presentation[temp_predicate] = await testbedAgent[temp_predicate]();

            temp_predicate = `${prefix_testbed_model}testsuite`;
            if (testbedAgent[temp_predicate] && !presentation[temp_predicate])
                presentation[temp_predicate] = await testbedAgent[temp_predicate]();

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
        '@context': context_self,
        '@id':      id,
        'type':     type,
        //
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
        'System':    Device,
        'domain':    undefined,
        'scheduler': undefined,
        //
        'fn':   fn,
        'node': node,
        //
        'contextHasPrefix': tb_util['contextHasPrefix'],
        'idAsBlankNode':    tb_util['idAsBlankNode'],
        'randomLeaveId':    tb_util['randomLeaveId']
    });

    tmp_node = (node['testsuite'] || node[`${prefix_testbed_model}testsuite`]);
    if (tmp_node)
        // REM : object-property 'testsuite' comes from testbed-model ('tbm')
        Object.defineProperty(fn, `${prefix_testbed_model}testsuite`, {
            value:          new Testsuite({
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
                'fn':   undefined,
                'node': tmp_node,
                //
                'contextHasPrefix': tb_util['contextHasPrefix'],
                'idAsBlankNode':    tb_util['idAsBlankNode']
            }), enumerable: true
        });

    fn['on'](fn['on_task']['scheduler_idle'], (data) => {
        //debugger;
        console.log(`fn['on'](fn['on_task']['scheduler_idle'] : data <${JSON.stringify(data)}>`);
        return undefined;
    });
    fn['on'](fn['on_task']['scheduler_error'], (error) => {
        //debugger;
        console.log(`fn['on'](fn['on_task']['scheduler_error'] : data <${JSON.stringify(data)}>`);
        return undefined;
    });
    Object.freeze(fn);

    return fn;
} // TestbedAgent

Object.defineProperties(TestbedAgent, {
    '@context': {
        value:          [{
            "@base": "http://testbed.nicos-rd.com",
            "vocab": "/",
            "tb":    "http://testbed.nicos-rd.com/",
            "tbm":   "http://testbed.nicos-rd.com/",
            //
            "sysm": "http://www.nicos-rd.com/fua/agent/system#",
            "domm": "http://www.nicos-rd.com/fua/agent/domain#",
            //
            "system": "http://www.nicos-rd.com/fua/agent/system#system",
            "domain": "http://www.nicos-rd.com/fua/agent/domain#domain",
            // TODO : ha to be switched, when testsuite has its own app...
            "testsuite": "http://testsuite.nicos-rd.com/"
        }], enumerable: true
    },
    '@id':      {value: "http://www.nicos-rd.com/fua/testbed#TestbedAgent/"}
});

exports.TestbedAgent = TestbedAgent;