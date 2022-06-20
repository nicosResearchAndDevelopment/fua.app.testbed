const
    path         = require('path'),
    util         = require('../../../src/code/util.testbed.js'),
    TestbedAgent = require('../../../src/code/agent.testbed.js'),
    EC_ldp       = require('./tb.ec.ldp.js'),
    EC_NAME      = 'ldp';

module.exports = async function initializeLDP(
    {
        'agent': agent
    } = {}
) {
    util.assert(agent instanceof TestbedAgent, 'expected agent to be a TestbedAgent');
    util.assert(!agent.ecosystems[EC_NAME], 'expected ecosystem ' + EC_NAME + ' not to be initialized already');

    agent.ecosystems[EC_NAME] = 'initializing';

    const ec_ldp = EC_ldp.ldp;

    ec_ldp.on('error', (error) => {
        util.logError(error);
        // agent.emit('error', error);
        debugger;
    });

    agent.ecosystems[EC_NAME] = Object.freeze(ec_ldp);
    util.lockProp(agent.ecosystems, EC_NAME);

    return ec_ldp;
}; // module.exports = async function initializeIDS
