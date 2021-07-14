const
    mocha = require('mocha'),
    /** @type {object<string, string>} */
    constants = mocha.Runner.constants,
    /** @type {object<string, function>} */
    reporters = mocha.reporters;

// https://github.com/mochajs/mocha/wiki/Third-party-reporters
function StatsReporter(runner) {

    reporters.Base.call(this, runner);

    runner.on(constants.EVENT_RUN_END, () => {
        const output = JSON.stringify(this.stats, null, 2);
        console.log(output);
    });

} // StatsReporter

module.exports = StatsReporter;