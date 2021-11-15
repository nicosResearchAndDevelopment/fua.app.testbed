const
    fs          = require("fs").http = require("https"),
    path        = require('path'),
    //
    config      = require('./config/config.testbed.js'),
    util        = require('@nrd/fua.core.util'),
    //
    Amec        = require(path.join(util.FUA_JS_LIB, 'agent.amec/src/agent.amec.js')),
    BasicAuth   = require(path.join(util.FUA_JS_LIB, 'agent.amec/src/mechanisms/BasicAuth.js')),
    testbed     = require('./code/main.testbed.js'),
    LDPRouter   = require(path.join(util.FUA_JS_LIB, 'impl/ldp/agent.ldp/next/router.ldp.js')),
    //amec        = require(path.join(util.FUA_JS_LIB, 'agent.amec/src/agent.amec.next.js')),
    rdf         = require('@nrd/fua.module.rdf'),
    persistence = require('@nrd/fua.module.persistence'),
    {DAPS}      = require(path.join(util.FUA_JS_LIB, 'ids/ids.agent.daps/src/agent.DAPS.beta.js')),
    {Space}     = require('@nrd/fua.module.space')
    //
; // const

//region new style
// TODO: get schemata
// TODO: get agents (testbed) data
const
    testbed_app             = {
        '@context':    [],
        '@id':         "http://testbed.nicos-rd.com/app/",
        '@type':       "http_//www.nicos-rd.com/fua/testbed#TestbedApp",
        'owner':       "http://www.nicos-rd.com",
        'domainOwner': "http://www.nicos-rd.com/DOMAIN/owner/",
        'systemOwner': "http://www.nicos-rd.com/SYSTEM/owner/",
        'agent':       undefined, // REM : will be set later...
        'service':     null
    }, // testbed_app
    testbed_scheduler       = {
        '@id':   "http://testbed.nicos-rd.com/scheduler/",
        '@type': "http://www.nicos-rd.com/fua/agent/scheduler#Scheduler",
        'owner': {
            '@id':   testbed_app.systemOwner,
            '@type': "foaf:Agent"
        },
        // TODO : hier könnte man vielleicht auch duration "PT1.42S" gehen?!?
        'idle_emit_threshold': {'@type': "xsd:decimal", '@value': /** seconds */ 60.0},
        'hasTRS':              "http://dbpedia.org/resource/Unix_time"
    }, // testbed_scheduler
    testbed_system          = {
        '@id':       "http://testbed.nicos-rd.com/system/",
        '@type':     "http://www.nicos-rd.com/fua/agent/System#Device",
        'owner':     {
            '@id':   testbed_app.systemOwner,
            '@type': "foaf:Agent"
        },
        'time':      {
            '@type':  "fua.agent.Time",
            'hasTRS': "http://dbpedia.org/resource/Unix_time"
        },
        'lifecycle': {
            '@type':             "time:Instant",
            'time:hasBeginning': {
                '@type':                   "time:Instant",
                'time:inXSDDateTimeStamp': "2019-12-14T12:35:25.047Z"
            }
        }
    }, // testbed_system
    testbed_domain          = {
        '@id':         "http://testbed.nicos-rd.com/domain/",
        'owner':       {
            '@id':   testbed_app.domainOwner,
            '@type': "foaf:Agent"
        },
        'users':       { // REM: as ldp:BasicContainer
            '@id': "http://testbed.nicos-rd.com/domain/users/"
        },
        'groups':      { // REM: as ldp:BasicContainer
            '@id': "http://testbed.nicos-rd.com/domain/groups/"
        },
        'roles':       { // REM: as ldp:BasicContainer
            '@id': "http://testbed.nicos-rd.com/domain/roles/"
        },
        'memberships': { // REM: as ldp:BasicContainer
            '@id': "http://testbed.nicos-rd.com/domain/memberships/"
        },
        'credentials': { // REM: as ldp:BasicContainer
            '@id': "http://testbed.nicos-rd.com/domain/credentials/"
        }
    }, // testbed_domain
    testbed_agent_testsuite = { // REM: as agent
        '@id': "http://testbed.nicos-rd.com/testsuite/",
        // REM: when testsuite will be stand alone in the future, it will serve its very own domain...
        'domain': "set by testbed (so we'll take 'testbed.domain')"
    }, // testbed_testsuite
    testbed_agent_node      = { // REM: ...is coming from generated graph.
        '@id':       "http://testbed.nicos-rd.com/agent/",
        'owner':     {
            '@id': testbed_app.owner
        },
        'holder':    testbed_app,
        'scheduler': testbed_scheduler,
        'system':    testbed_system,
        'domain':    testbed_domain,
        'testsuite': testbed_agent_testsuite
    }, // agent_node
    {TestbedAgent}          = require('./code/agent.Testbed.beta.js'),// REM: as agent
    // REM: agent (agent-testbed) will be put under all services (like http, gRPC, graphQL)
    testbed_agent_util      = {
        'contextHasPrefix': function ({'context': context, 'prefix': prefix}) {
            // TODO : context is array?
            let result = false;
            for (let i = 0; ((!result) && (i < context.length)); i++) {
                result = ((context[i][prefix]) ? true : false)
            } // for (i)
            return result;
        },
        'idAsBlankNode':    function (namespace = "") {
            //return `_:${(new Date).valueOf()}_${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
            return `_:${namespace}${testbed_agent_util['randomLeaveId']()}`;
        },
        'randomLeaveId':    function () {
            return `${(new Date).valueOf()}_${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
        }
    },
    testbed_agent_context   = []
;
//const {Testsuite}          = require("./code/agent.Testsuite.js"); // const

//endregion new style

const
    // TODO build a proper agent amec with a concise api
    tmp_users = new Map([
        ["test@test", "test"],
        ["spetrac@marzipan.com", "password123"],
        ["jlangkau@marzipan.com", "@8mT7Q@SPHvB6sYvy*M3"]
    ]);

/**
 * @param {object} config
 * @param {object} config.datastore
 * @param {string} config.datastore.module
 * @param {object} [config.datastore.options]
 * @param {Array<object>} [config.datastore.load]
 * @param {object} [config.context]
 * @param {Array<object>} [config.load]
 * @returns {Space}
 */
async function createSpace(config) {
    // 1. check input arguments
    testbed.assert(util.isObject(config),
        'createSpace : expected config to be an object', TypeError);
    testbed.assert(util.isObject(config.datastore),
        'createSpace : expected config.datastore to be an object', TypeError);
    testbed.assert(util.isString(config.datastore.module),
        'createSpace : expected config.datastore.module to be a string', TypeError);
    testbed.assert(util.isNull(config.datastore.options) || util.isObject(config.datastore.options),
        'createSpace : expected config.datastore.options to be an object', TypeError);
    testbed.assert(util.isNull(config.datastore.load) || util.isObjectArray(config.datastore.load),
        'createSpace : expected config.datastore.load to be an array of objects', TypeError);
    testbed.assert(util.isNull(config.context) || util.isObject(config.context),
        'createSpace : expected config.context to be an object', TypeError);
    testbed.assert(util.isNull(config.load) || util.isObjectArray(config.load),
        'createSpace : expected config.load to be an array of objects', TypeError);

    // 2. require the persistence module, to be able to make the persistence configurable
    // (this is an exception, normally you would try to avoid requiring in any place other than the top of the script)
    const DataStore = require(config.datastore.module);
    testbed.assert(persistence.DataStore.isPrototypeOf(DataStore),
        'createSpace : expected DataStore to be a subclass of persistence.DataStore', TypeError);

    // 3. create the necessary components for the space, like factory and datastore
    const
        context   = config.context || {},
        factory   = new persistence.DataFactory(context),
        // local protected data for data models
        //dataset   = new persistence.Dataset(null, factory),
        // persistent data that can be manipulated by resources
        dataStore = new DataStore(config.datastore.options, factory);

    // 4. if a load is configured for the space, import available data files into the dataset
    //if (config.load) {
    //    const resultArr = await rdf.loadDataFiles(config.load, factory);
    //    for (let result of resultArr) {
    //        if (result.dataset) dataset.add(result.dataset);
    //    }
    //}
    // 5. if a load is configured for the datastore, import available data files into the datastore
    //    this should only be done, if the datastore is an inmemory store
    if (dataStore.dataset && config.datastore.load) {
        const resultArr = await rdf.loadDataFiles(config.datastore.load, factory);
        for (let result of resultArr) {
            if (result.dataset) dataStore.dataset.add(result.dataset);
        }
    }

    // 6. make sure the datastore is available (ping) by requesting its size
    await dataStore.size();

    //const tmp = rdf.generateGraph(dataStore.dataset, undefined, {'compact': true, 'meshed': true, 'blanks': true});
    //debugger;
    //console.log(tmp);

    //let that = rdf.generateGraph(dataStore.dataset, {
    //    compact: false,
    //    strings:   false,
    //    meshed:  true,
    //    blanks:  true
    //});

    // 7. create a space out of the collected components and return it
    return new Space({store: dataStore});
}

const
    server_tls_certificates     = require('../cert/tls-server/server.js'),
    daps_connector_certificates = require('./daps/cert/connector/client.js')
;

config.server.options = {
    key:                server_tls_certificates.key,
    cert:               server_tls_certificates.cert,
    ca:                 server_tls_certificates.ca,
    requestCert:        false,
    rejectUnauthorized: false
};

(async () => {

    const
        space                    = await createSpace(config.space),
        daps_id                  = "https://nrd-daps.nicos-rd.com/", // TODO : config
        jwt_payload_iss          = "https://testbed.nicos-rd.com:8080",
        tweak_DAT_custom_enabled = true,
        nrd_daps_config          = space.getNode(daps_id),
        daps                     = new DAPS({
            id:      `${daps_id}agent/`,
            rootUri: "https://testbed.nicos-rd.com/domain/user#",
            domain:  null,                                            // REM : set by testbed-agent
            //
            keys:                     {
                default: {
                    publicKey:  daps_connector_certificates.publicKey,
                    privateKey: daps_connector_certificates.privateKey
                }
            },
            publicKey:                daps_connector_certificates.publicKey,
            privateKey:               daps_connector_certificates.privateKey,
            jwt_payload_iss:          jwt_payload_iss,
            tweak_DAT_custom_enabled: tweak_DAT_custom_enabled
        }),
        testbed_agent            = await TestbedAgent({
            testbed_id:   "https://testbed.nicos-rd.com/",
            scheduler:    testbed_scheduler,
            space:        space,
            daps:         daps,
            encodeSecret: (secret) => {
                return `${secret}_salt`;
            }
        }) // new TestbedAgent()
    ; // const

    let
        amec
    ;

    amec = new Amec();

    // TODO : to app-layer!
    amec.on('authentication-error', (error) => {
        debugger;
    });
    //let users     = await testbed_agent.domain.users();
    let basicAuth = BasicAuth({
        domain: testbed_agent.domain
    });
    amec.registerMechanism(BasicAuth.prefLabel, basicAuth);

    testbed_agent.amec = amec;

    testbed_app['agent'] = testbed_agent;

    let
        scheduler_status   = testbed_agent.scheduler.status,
        scheduler_isProper = testbed_agent.scheduler.isProper
    ;
    const APP_testbed      = require('./app.testbed.BETA.js')({
        'space':  space,
        'agent':  testbed_agent,
        'config': config
    });

})().catch(console.error);
