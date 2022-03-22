const
    GET    = exports,
    expect = require('expect'),
    util   = require('../../src/code/util.testsuite.js'),
    tb     = require('../../src/code/tb.interface.js');

GET.basic = async function (param) {
    expect(typeof param).toBe('object');
    const result = await tb.execute('http/GET', param);
    expect(typeof result).toBe('object');
    console.log(result);
    return result;
}; // GET.basic

GET.successful = async function (param) {
    const result = await GET.basic(param);
    expect(result.ok).toBeTruthy();
    expect(result.status).toBe(200);
}; // GET.successful

GET.unsuccessful = async function (param) {
    const result = await GET.basic(param);
    expect(result.ok).toBeFalsy();
    //expect(result.status).toBe(200);
}; // GET.unsuccessful
