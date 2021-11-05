const
    testbed     = exports,
    path        = require('path'),
    express     = require('express'),
    util        = require('@nrd/fua.core.util'),
    rdf         = require('@nrd/fua.module.rdf'),
    persistence = require('@nrd/fua.module.persistence'),
    Space       = require(path.join(util.FUA_JS_LIB, 'module.space/src/module.space.js')),
    WebLogin    = require(path.join(util.FUA_JS_LIB, 'web.login/src/web.login.js')),
    WebLib      = require(path.join(util.FUA_JS_LIB, 'web.lib/src/web.lib.js'));

testbed.assert = new util.Assert('nrd-testbed');

testbed.ecosystems = Object.fromEntries([
    require('../../ec/ids/src/tb.ec.ids.js'),
    require('../../ec/http/src/tb.ec.http.js'),
    require('../../ec/ip/src/tb.ec.ip.js')
].map((ec) => [ec.ec, ec]));

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
testbed.createSpace = async function (config) {
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
        dataset   = new persistence.Dataset(null, factory),
        // persistent data that can be manipulated by resources
        dataStore = new DataStore(config.datastore.options, factory);

    // 4. if a load is configured for the space, import available data files into the dataset
    if (config.load) {
        const resultArr = await rdf.loadDataFiles(config.load, factory);
        for (let result of resultArr) {
            if (result.dataset) dataset.add(result.dataset);
        }
    }
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

    // 7. create a space out of the collected components and return it
    return new Space({context, factory, dataset, dataStore});
};

/**
 * @param {object} config
 * @param {object} config.page
 * @param {object} config.login
 * @param {object} config.report
 * @param {*} amec TODO still a temporary solution
 * @returns {express.Router}
 */
testbed.createLogin = function (config, amec) {
    // 1. check input arguments
    testbed.assert(util.isObject(config),
        'createSpace : expected config to be an object', TypeError);
    testbed.assert(!util.isNull(amec),
        'createSpace : expected amec to be not null', TypeError);

    // 2. create the login route and add basic body parsing features
    const route = express.Router();
    route.use(express.json());
    route.use(express.urlencoded({extended: false}));

    // 3. add the login web page to the route 
    route.get('/', WebLogin(config));

    // 4. add the login mechanism to the route
    const authMech = config.login?.tfa ? 'login-tfa' : 'login';
    route.post('/', (request, response, next) => {
        amec.authenticate(request, authMech)
            .then((auth) => auth ? response.redirect('/') : response.status(401).end())
            .catch(next);
    });

    // 5. add the logout mechanism to the route
    route.get('/logout', (request, response) => {
        request.session.destroy();
        response.redirect('/');
    });

    // 6. (optional) add the browser report mechanism to the route
    route.post('/report', (request, response) => {
        // TODO this is the browser self report, although this method might be illegal because of DSGVO
        console.log('[Report]:', request.body);
        response.status(200).end();
    });

    // 7. (optional) add the two-factor-authentication mechanism to the route
    route.post('/tfa', (request, response) => {
        //const tfa = "dddd-dddd".replace(/d/g, () => Math.floor(Math.random() * 10));
        const tfa = Math.floor(1e4 * Math.random()).toString().padStart(4, '0')
            + '-' + Math.floor(1e4 * Math.random()).toString().padStart(4, '0');
        console.log('[TFA]:', tfa);
        request.session.tfa = tfa.replace(/\D/g, '');
        // TODO do something with the generated tfa, e.g. send it to the user via mail
        //response.status(200).end();
        request.session.save(err => response.status(err ? 500 : 200).end());
    });

    // 8. return the route
    return route;
};

/**
 * @param {object} config
 * @returns {express.Router}
 */
testbed.createBrowser = function (config) {
    /* TODO
     * integrate the config or remove it, maybe render the web application,
     * with mustache to make it configurable like the login page
     */

    // 1. check input arguments
    testbed.assert(util.isNull(config) || util.isObject(config),
        'createSpace : expected config to be an object', TypeError);

    // 2. create the browse route
    const route = express.Router();

    // 3. add the web library to the route
    route.use('/lib', WebLib());

    // 4. add the web application to the route
    route.use('/', express.static(path.join(__dirname, 'browse')));

    // 5. return the route
    return route;
};