const
    mocha = require('mocha'),
    /** @type {object<string, string>} */
    constants = mocha.Runner.constants,
    /** @type {object<string, function>} */
    reporters = mocha.reporters;

// https://github.com/mochajs/mocha/wiki/Third-party-reporters
function ComprehensiveReporter(runner) {

    reporters.Base.call(this, runner);

    const tests = [];

    runner.on(constants.EVENT_TEST_END, (test) => {
        tests.push(test.serialize());
    });

    runner.on(constants.EVENT_RUN_END, () => {
        const output = JSON.stringify({
            'stats': this.stats,
            'tests': tests
        }, null, 2);
        console.log(output);
    });

} // ComprehensiveReporter

module.exports = ComprehensiveReporter;