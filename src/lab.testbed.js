const
    util = require('./code/util.testbed.js');

module.exports = async function TestbedLab(
    {
        'agent': agent
    }
) {

    agent.scheduler
        .on('idle', (schedule) => {
            // util.logObject({
            //     topic:     'idle',
            //     timestamp: new Date(schedule.lastTime * 1000).toISOString(),
            //     threshold: Math.round(schedule.nextTime - schedule.lastTime) + 's'
            // });
            util.logText('IDLE: ' + util.time(Math.round(schedule.lastTime)));
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
