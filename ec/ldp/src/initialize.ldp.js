const
    util         = require('../../../src/code/util.testbed.js'),
    TestbedAgent = require('../../../src/code/agent.testbed.js'),
    EcosystemLDP = require('./tb.ec.ldp.js'),
    EC_NAME      = 'ldp';

module.exports = async function initializeLDP(
    {
        'agent': agent
    } = {}
) {
    util.assert(agent instanceof TestbedAgent, 'expected agent to be a TestbedAgent');
    util.assert(!agent.ecosystems[EC_NAME], 'expected ecosystem ' + EC_NAME + ' not to be initialized already');

    const ec_ldp = agent.ecosystems[EC_NAME] = new EcosystemLDP();
    util.lockProp(agent.ecosystems, EC_NAME);

    ec_ldp.on('error', (error) => {
        util.logError(error);
        debugger;
    });

    return ec_ldp;
}; // module.exports = async function initializeLDP
