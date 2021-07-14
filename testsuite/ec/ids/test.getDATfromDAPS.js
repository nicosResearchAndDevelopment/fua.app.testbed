const
    expect    = require('expect'),
    testsuite = require('../../src/code/main.testsuite.js');

module.exports = async function (param) {
    const result = await testsuite.execute('ids/getDATfromDAPS', param);
    expect(typeof result?.body).toBe('string');
    // TODO
};