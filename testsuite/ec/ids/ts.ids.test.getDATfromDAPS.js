const
    getDATfromDAPS = exports,
    expect         = require('expect'),
    util           = require('../../src/code/util.testsuite.js'),
    tb             = require('../../src/code/tb.interface.js');

getDATfromDAPS.basic = async function (param) {
    expect(typeof param).toBe('object');
    const result = await tb.execute('ids/getDATfromDAPS', param);

    //region validation
    expect(typeof result).toBe('object');
    //endregion validation

    return result;
}; // getDATfromDAPS.basic
