const
    getDATfromDAPS = exports,
    expect         = require('expect'),
    testsuite      = require('../../src/code/main.testsuite.js')
;

getDATfromDAPS.basic = async function (param) {
    expect(typeof param).toBe('object');
    const result = await testsuite.execute('ids/getDATfromDAPS', param);

    //region validation
    expect(typeof result).toBe('object');
    //endregion validation

    return result;
}; // getDATfromDAPS.basic