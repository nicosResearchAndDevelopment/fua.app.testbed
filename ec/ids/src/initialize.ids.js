const
    util         = require('../../../src/code/util.testbed.js'),
    TestbedAgent = require('../../../src/code/agent.testbed.js'),
    EcosystemIDS = require('./tb.ec.ids.js'),
    EC_NAME      = 'ids';

function _createRemoteConfig(rcNode) {
    return {
        id:           rcNode.id,
        schema:       rcNode.getLiteral('fua:schema').value,
        host:         rcNode.getLiteral('fua:host').value,
        port:         parseInt(rcNode.getLiteral('fua:port').value),
        SKIAKI:       rcNode.getLiteral('dapsm:skiaki').value,
        idle_timeout: parseInt(rcNode.getLiteral('idsecm:idle_timeout').value),
        DAPS:         {
            default: rcNode.getNode('idsecm:daps_default').id
        }
    };
} // _createRemoteConfig

async function _initializeAlice(agent, ec_ids) {
    const aliceNode = await agent.space.getNode('https://alice.nicos-rd.com/').load();
    if (aliceNode.type) await ec_ids.createRemoteComponent(
        './rc/launch.rc.alice.js',
        _createRemoteConfig(aliceNode)
    );
} // _initializeAlice

async function _initializeBob(agent, ec_ids) {
    const bobNode = await agent.space.getNode('https://bob.nicos-rd.com/').load();
    if (bobNode.type) await ec_ids.createRemoteComponent(
        './rc/launch.rc.bob.js',
        _createRemoteConfig(bobNode)
    );
} // _initializeBob

module.exports = async function initializeIDS(
    {
        'agent': agent
    } = {}
) {
    util.assert(agent instanceof TestbedAgent, 'expected agent to be a TestbedAgent');
    util.assert(!agent.ecosystems[EC_NAME], 'expected ecosystem ' + EC_NAME + ' not to be initialized already');

    const ec_ids = agent.ecosystems[EC_NAME] = new EcosystemIDS();
    util.lockProp(agent.ecosystems, EC_NAME);

    await Promise.all([
        _initializeAlice(agent, ec_ids),
        _initializeBob(agent, ec_ids)
    ]);

    ec_ids.on('event', (event) => {
        agent.event.emit(event);
    });

    ec_ids.on('error', (err) => {
        util.logError(err);
        debugger;
    });

    return ec_ids;
}; // module.exports = async function initializeIDS
