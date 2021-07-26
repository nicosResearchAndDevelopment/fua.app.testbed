const
    getDATfromDAPS = exports,
    expect         = require('expect'),
    testsuite      = require('../../src/code/main.testsuite.js');

getDATfromDAPS.basic = async function (param) {
    const result = await testsuite.execute('ids/getDATfromDAPS', param);
    expect(typeof result).toBe('object');
    return result;
}; // getDATfromDAPS.basic