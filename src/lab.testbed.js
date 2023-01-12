const
    util = require('./code/util.testbed.js');

module.exports = async function TestbedLab(
    {
        'agent': agent
    }
) {

    // agent.scheduler
    //     .on('idle', (schedule) => {
    //         util.logText('IDLE: ' + util.time(Math.round(schedule.lastTime)));
    //     });

    // agent.amec
    //     .on('authentication-error', (error) => {
    //         util.logError(error);
    //         //debugger;
    //     });

    // agent.server
    //     .on('error', (error) => {
    //         util.logError(error);
    //     });

    // agent.testing.getEcosystem('urn:tb:ec:ids')
    //     .callAlice('getSelfDescriptionFromRC')
    //     .then(util.logObject)
    //     .catch(util.logError);

}; // module.exports = TestbedLab
