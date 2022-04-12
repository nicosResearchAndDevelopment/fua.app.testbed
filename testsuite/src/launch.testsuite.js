const
    config                   = require('./config/config.testsuite.js'),
    util                     = require('./code/util.testsuite.js'),
    //
    {DataStore, DataFactory} = require('@nrd/fua.module.persistence'),
    {Space}                  = require('@nrd/fua.module.space'),
    Amec                     = require('@nrd/fua.agent.amec'),
    BasicAuth                = require('@nrd/fua.agent.amec/BasicAuth'),
    TestsuiteAgent           = require('./code/agent.testsuite.js'),
    TestsuiteApp             = require('./app.testsuite.js'),
    TestsuiteLab             = require('./lab.testsuite.js')
; // const

/**
 * @param {object} config
 * @param {object} [config.context]
 * @param {object} config.datastore
 * @param {string} config.datastore.module
 * @param {object} [config.datastore.options]
 * @returns {Space}
 */
async function createSpace(config) {
    // 1. check input arguments
    util.assert(util.isObject(config),
        'createSpace : expected config to be an object', TypeError);
    util.assert(util.isNull(config.context) || util.isObject(config.context),
        'createSpace : expected config.context to be an object', TypeError);
    util.assert(util.isObject(config.datastore),
        'createSpace : expected config.datastore to be an object', TypeError);
    util.assert(util.isString(config.datastore.module),
        'createSpace : expected config.datastore.module to be a string', TypeError);
    util.assert(util.isNull(config.datastore.options) || util.isObject(config.datastore.options),
        'createSpace : expected config.datastore.options to be an object', TypeError);

    // 2. require the persistence module, to be able to make the persistence configurable
    // (this is an exception, normally you would try to avoid requiring in any place other than the top of the script)
    const SpecificDataStore = require(config.datastore.module);
    util.assert(DataStore.isPrototypeOf(SpecificDataStore),
        'createSpace : expected SpecificDataStore to be a subclass of DataStore', TypeError);

    // 3. create the necessary components for the space, like factory and datastore
    const
        context   = config.context || {},
        factory   = new DataFactory(context),
        dataStore = new SpecificDataStore(config.datastore.options, factory);

    // 4. make sure the datastore is available (ping) by requesting its size
    const size = await dataStore.size();
    util.assert(size, 'createSpace : expected space to not be empty', TypeError);

    // let that = rdf.generateGraph(dataStore.dataset, {
    //    compact: false,
    //    strings:   false,
    //    meshed:  true,
    //    blanks:  true
    // });

    // 5. create a space out of the collected components and return it
    return new Space({store: dataStore});
} // createSpace

(async function LaunchTestsuite() {

    const
        space           = await createSpace(config.space),
        testsuiteNode   = await space.getNode(config.server.id).load(),
        amec            = new Amec(),
        testsuite_agent = await TestsuiteAgent.create({
            id:      config.server.id,
            space:   space,
            amec:    amec,
            testbed: config.testbed
            // validate: {
            //     ec: {
            //         net: {
            //             ping: async ({
            //                              id:         id,
            //                              testResult: testResult
            //                          }) => {
            //                 const
            //                     pass = "ip:Pass",
            //                     fail = "ip:Fail"
            //                 ; // const
            //
            //                 let result = {
            //                     '@context': ["https://www.nicos-rd.com/fua/ip/"],
            //                     id:         id,
            //                     type:       ["ip:validationResult"]
            //                 };
            //                 if (testResult.isAlive) {
            //                     result.type.push(pass);
            //                 } else {
            //                     result.type.push(fail);
            //                 } // if ()
            //                 return result;
            //             }
            //         }
            //     }
            // }
        }),
        tc_console_log  = true;

    amec.registerMechanism(BasicAuth.prefLabel, BasicAuth({
        domain: testsuite_agent.domain
    }));

    testsuite_agent.testcases = {
        net: require(`./tc/ec/net/tc.ec.net.launch`)({
            root_uri:    config.server.id,
            agent:       {
                test: testsuite_agent.test.bind(testsuite_agent)
            },
            console_log: tc_console_log
        }),
        ids: require(`./tc/ec/ids/tc.ec.ids.launch`)({
            root_uri:    config.server.id,
            agent:       {
                test: testsuite_agent.test.bind(testsuite_agent)
            },
            console_log: tc_console_log
        })
    };

    await TestsuiteApp({
        'config':        config,
        'agent':         testsuite_agent,
        'space':         space,
        'serverNode':    testsuiteNode,
        'serverOptions': config.server.options,
        'amec':          amec
    });

    await TestsuiteLab({
        'agent': testsuite_agent
    });

})().catch((err) => {
    util.logError(err);
    debugger;
    process.exit(1);
}); // LaunchTestsuite
