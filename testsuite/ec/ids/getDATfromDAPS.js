const
    expect = require('expect'),
    test   = require('../../src/code/test.interface.js');

module.exports = async function (param) {
    const result = await test('ids/getDATfromDAPS', param);
    expect(typeof result?.body).toBe('string');
    // TODO
};