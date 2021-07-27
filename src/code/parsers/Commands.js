const
    util                  = require('@nrd/fua.core.util'),
    RE_matchAll_cmdArgs   = /(-\S|--\S{2,})(?=\s+-|$)|(-[^-\s]|--[^-\s]\S+)\s+('.*?'|".*?"|[^-'"\s][^'"\s]*)(?=\s|$)|('.*?'|".*?"|[^-'"\s][^'"\s]*)(?=\s|$)/g,
    RE_replace_dashes     = /^--?/,
    RE_replace_quoteMarks = /^['"]|['"]$/g;

/**
 * @param {string} cmdLine
 * @returns {{ param: {}, args: [] }}
 */
exports.parseCmdLineArgs = function (cmdLine) {
    let
        search                        = cmdLine.matchAll(RE_matchAll_cmdArgs),
        param = {}, args = [], result = {param, args};

    for (let [match, bool, key, value, arg] of search) {
        if (bool) {
            param[bool.replace(RE_replace_quoteMarks, '')] = true;
        } else if (key) {
            param[key.replace(RE_replace_dashes, '')] = value.replace(RE_replace_quoteMarks, '');
        } else if (arg) {
            args.push(arg.replace(RE_replace_quoteMarks, ''));
        }
    }

    return result;
}; // exports.parseCmdLine

/**
 * @returns {{ exe: string, script: string, param: {}, args: [] }}
 */
exports.parseArgv = function () {
    const
        [exe, script, ...cmdArgs] = process.argv,
        {param, args}             = exports.parseCmdLineArgs(cmdArgs.join(' ')),
        result                    = {exe, script, param, args};

    return result;
}; // exports.parseArgv

function flattenArgs(args) {
    if (util.isArray(args)) {
        return args.map(flattenArgs).flat(1);
    } else if (util.isObject(args)) {
        const res = [];
        for (let [key, value] of Object.entries(args)) {
            if (!key.startsWith('-')) key = (key.length > 1 ? '--' : '-') + key;
            if (util.isArray(value)) {
                for (let entry of value) {
                    res.push(key);
                    res.push(entry);
                }
            } else {
                res.push(key);
                res.push(value);
            }
        }
        return res;
    } else {
        return args;
    }
} // flattenArgs

exports.createFlatCmdLineArgs = function (...args) {
    return flattenArgs(args);
}; // exports.createFlatCmdLineArgs

exports.createCmdLine = function (command, ...args) {
    return command + ' ' + flattenArgs(args).join(' ');
}; // exports.createCmdLine