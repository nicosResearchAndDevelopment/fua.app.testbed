const
    fn_interface = exports,
    testbed      = require('./main.testbed.js'),
    util         = require('@nrd/fua.core.util');

for (let [ecName, ec] of Object.entries(testbed.ecosystems)) {
    for (let [fnName, fn] of Object.entries(ec.fn)) {
        testbed.assert(util.isFunction(fn), `expected ${ecName}->${fnName} to be a function`);
        const method         = `${ecName}/${fnName}`;
        fn_interface[method] = async function (param) {
            const
                args   = [param], // TODO parameter mapping
                result = await fn.apply(null, args);
            return result; // TODO result mapping
        }
    }
}