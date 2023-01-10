const
    util         = require('../../../src/code/util.testbed.js'),
    TestbedAgent = require('../../../src/code/agent.testbed.js'),
    EcosystemNet = require('./tb.ec.net.js'),
    EC_NAME      = 'net';

module.exports = async function initializeNet(
    {
        'agent': agent
    } = {}
) {
    util.assert(agent instanceof TestbedAgent, 'expected agent to be a TestbedAgent');
    util.assert(!agent.ecosystems[EC_NAME], 'expected ecosystem ' + EC_NAME + ' not to be initialized already');

    const ec_net = agent.ecosystems[EC_NAME] = new EcosystemNet();
    util.lockProp(agent.ecosystems, EC_NAME);

    ec_net.on('tshark_data', (data) => {
        agent.event.emit({
            type:            'tb.net.tshark.data',
            source:          agent.url,
            datacontenttype: 'application/json',
            data:            data
        });
    });

    ec_net.on('tshark_error', (err) => {
        agent.event.emit({
            type:            'tb.net.tshark.error',
            source:          agent.url,
            datacontenttype: 'application/json',
            data:            {message: '' + (err?.message ?? err)}
        });
    });

    ec_net.on('error', (error) => {
        util.logError(error);
        debugger;
    });

    return ec_net;
}; // module.exports = async function initializeNet
