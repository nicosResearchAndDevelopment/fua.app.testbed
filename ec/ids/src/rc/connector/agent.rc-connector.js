const
    util           = require('../../tb.ec.ids.util.js'),
    ConnectorAgent = require('@nrd/fua.ids.agent.connector');

class RCConnectorAgent extends ConnectorAgent {

    async initialize(options = {}) {
        await super.initialize(options);

        // TODO

        return this;
    } // RCConnectorAgent#initialize

} // RCConnectorAgent

module.exports = RCConnectorAgent;
