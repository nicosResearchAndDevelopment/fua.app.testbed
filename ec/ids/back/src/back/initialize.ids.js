const
    path         = require('path'),
    util         = require('../../../src/code/util.testbed.js'),
    TestbedAgent = require('../../../src/code/agent.testbed.js'),
    EC_ids       = require('./tb.ec.ids.js'),
    EC_NAME      = 'ids';

module.exports = async function initializeIDS(
    {
        'agent': agent
    } = {}
) {
    util.assert(agent instanceof TestbedAgent, 'expected agent to be a TestbedAgent');
    util.assert(!agent.ecosystems[EC_NAME], 'expected ecosystem ' + EC_NAME + ' not to be initialized already');

    agent.ecosystems[EC_NAME] = 'initializing';

    const
        aliceNode = await agent.space.getNode('https://alice.nicos-rd.com/').load(),
        bobNode   = await agent.space.getNode('https://bob.nicos-rd.com/').load(),
        ec_ids    = EC_ids({
            'uri':   `${agent.uri}ec/ids/`,
            'ALICE': {
                'id':     aliceNode.id,
                'schema': aliceNode.getLiteral('fua:schema').value,
                'host':   aliceNode.getLiteral('fua:host').value,
                'port':   parseInt(aliceNode.getLiteral('fua:port').value),
                'SKIAKI': aliceNode.getLiteral('dapsm:skiaki').value,
                //
                'user':         {
                    'tb_ec_ids': {'name': 'tb_ec_ids', 'password': 'marzipan'}
                },
                'idle_timeout': parseInt(aliceNode.getLiteral('idsecm:idle_timeout').value),
                'DAPS':         {
                    'default': aliceNode.getNode('idsecm:daps_default').id
                },
                // 'cert_client':  'C:/fua/DEVL/js/app/nrd-testbed/ec/ids/src/rc/alice/cert/index.js'
                'cert_client': path.join(__dirname, './rc/alice/cert/index.js')
            }, // ALICE
            'BOB':   {
                'id':     bobNode.id,
                'schema': bobNode.getLiteral('fua:schema').value,
                'host':   bobNode.getLiteral('fua:host').value,
                'port':   parseInt(bobNode.getLiteral('fua:port').value),
                'SKIAKI': bobNode.getLiteral('dapsm:skiaki').value,
                //
                'user': {
                    'tb_ec_ids': {'name': 'tb_ec_ids', 'password': 'marzipan'}
                },
                //
                'idle_timeout': parseInt(bobNode.getLiteral('idsecm:idle_timeout').value),
                //'idle_timeout': 1,
                //
                'DAPS': {
                    'default': bobNode.getNode('idsecm:daps_default').id
                },
                // 'cert_client': 'C:/fua/DEVL/js/app/nrd-testbed/ec/ids/src/rc/bob/cert/index.js'
                'cert_client': path.join(__dirname, './rc/bob/cert/index.js')
            }
        });

    ec_ids.uri = `${agent.uri}ec/ids/`;
    ec_ids.ec  = agent.ecosystems;

    // TODO the (error, result) pattern should only be used in acknowledge callbacks, not in events
    ec_ids.on('event', (error, data) => {
        // if (error) util.logError(error);
        // else util.logObject(data);
        agent.emit('event', error, data);
        //debugger;
    });
    ec_ids.on('error', (error) => {
        // util.logError(error);
        agent.emit('error', error);
        //debugger;
    });

    agent.ecosystems[EC_NAME] = Object.freeze(ec_ids);
    util.lockProp(agent.ecosystems, EC_NAME);

    return ec_ids;
}; // module.exports = async function initializeIDS
