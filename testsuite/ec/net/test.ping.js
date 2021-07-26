const
    ping      = exports,
    expect    = require('expect'),
    testsuite = require('../../src/code/main.testsuite.js');

ping.basic = async function (param) {
    const result = await testsuite.execute('net/ping', param);
    expect(typeof result).toBe('object');
    console.log(result);
    return result;
}; // ping.basic

ping.successful = async function (param) {
    const result = await ping.basic(param);
    expect(result.info).toBeTruthy();
    expect(result.statistic).toBeTruthy();
}; // ping.successful

ping.unsuccessful = async function (param) {
    const result = await ping.basic(param);
    expect(result.info).toBeTruthy();
    expect(result.statistic).toBeFalsy();
}; // ping.unsuccessful