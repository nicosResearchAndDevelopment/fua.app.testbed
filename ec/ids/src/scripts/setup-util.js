const
    util = require('@nrd/fua.core.util'),
    path = require('path');

exports = module.exports = {
    ...util,
    assert:   new util.Assert('nrd-testbed/ec/ids'),
    joinPath: path.join
};

exports.awaitMain = function (fn, ...args) {
    fn.apply(null, args)
        .then(() => process.exit(0))
        .catch((err) => console.error(err?.stack ?? err) || process.exit(1))
};

exports.ignoreErr = function (promise) {
    return new Promise(
        (resolve, reject) => promise
            .then(resolve)
            .catch((err) => resolve())
    );
};

/**
 * @param argv
 * @returns {{args: Array<string>, param: {Object}}}
 */
exports.parseArgv = function (argv = process.argv) {
    const
        tmp_args     = [],
        args         = [],
        param        = {},
        RE_match_arg = /^(--?)?([0-9a-z\-_.?$]+)(?:(=)(.*))?$/i,
        cleanupValue = (val) => val.substring((val.startsWith('"') ? 1 : 0), val.length - (val.endsWith('"') ? 1 : 0));

    for (let arg of argv) {
        const res = RE_match_arg.exec(arg);
        if (res) {
            if (res[3]) {
                tmp_args.push({type: 'key', value: res[2]});
                tmp_args.push({type: 'val', value: cleanupValue(res[4])});
            } else if (res[1]) {
                tmp_args.push({type: 'key', value: res[2]});
            } else {
                tmp_args.push({type: 'val', value: cleanupValue(arg)});
            }
        } else {
            tmp_args.push({type: 'val', value: cleanupValue(arg)});
        }
    }

    for (let index = 0, max = tmp_args.length - 1; index <= max; index++) {
        if (tmp_args[index].type === 'key') {
            const
                key   = tmp_args[index].value,
                value = (index === max || tmp_args[index + 1].type !== 'val')
                    ? true : tmp_args[++index].value;
            if (!(key in param)) {
                param[key] = value;
            } else if (!util.isArray(param[key])) {
                param[key] = [param[key], value];
            } else {
                param[key].push(value);
            }
        } else {
            args.push(tmp_args[index].value);
        }
    }

    return {param, args};
}; // parseArgv
