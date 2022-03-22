const
    ping   = exports,
    expect = require('expect'),
    util   = require('../../src/code/util.testsuite.js'),
    tb     = require('../../src/code/tb.interface.js');

ping.basic = async function (param) {
    expect(typeof param).toBe('object');
    const result = await tb.execute('ip/ping', param);
    expect(typeof result).toBe('object');
    console.log(result);
    return result;
}; // ping.basic

ping.successful = async function (param) {
    // fno:id "https://w3id.org/idsa/3cm/tests/applicantGetsDATfromDAPS/validationAlgorithm"
    const result = await ping.basic(param);
    expect(result.info).toBeTruthy();
    expect(result.statistic).toBeTruthy();
}; // ping.successful

ping.unsuccessful = async function (param) {
    const result = await ping.basic(param);
    expect(result.info).toBeTruthy();
    expect(result.statistic).toBeFalsy();
}; // ping.unsuccessful
