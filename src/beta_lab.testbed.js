const
    util = require('./code/util.testbed.js');

module.exports = async function TestbedLab(
    {
        'agent': agent
    }
) {

    agent
        .on('scheduler_idle', (data) => {
            util.logObject(data);
            //debugger;
        })
        .on('scheduler_error', (error) => {
            util.logError(error);
            //debugger;
        });

    agent.amec
        .on('authentication-error', (error) => {
            util.logError(error);
            //debugger;
        });

    agent.server
        .on('error', (error) => {
            util.logError(error);
        });

}; // module.exports = TestbedLab
