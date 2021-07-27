const
    ExtendedASCII = require('./parsers/ExtendedASCII.js'),
    util          = require('@nrd/fua.core.util'),
    child_process = require('child_process'),
    EventEmitter  = require('events');

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

function bufferToString(buffer) {
    switch (util.OS_PLATFORM) {
        case 'win32':
            return ExtendedASCII.byte2str(buffer);
        default:
            return buffer.toString();
    }
} // bufferToString

/**
 * @param {string} command
 * @param {...any} args
 * @returns {Promise<string>}
 */
exports.execute = async function (command, ...args) {
    const
        subprocess = child_process.spawn(command, flattenArgs(args)),
        chunks     = [];

    subprocess.stdout.on('data', chunks.push.bind(chunks));

    await new Promise((resolve, reject) => {
        subprocess.on('error', reject);
        subprocess.on('exit', resolve);
    });

    const
        buffer = Buffer.concat(chunks),
        string = bufferToString(buffer);

    return string.trim().replace(/\r\n/g, '\n');
}; // exports.execute

/**
 * @param {string} command
 * @param {...any} args
 * @returns {Promise<EventEmitter<string>>}
 */
exports.spawn = async function (command, ...args) {
    const
        subprocess = child_process.spawn(command, flattenArgs(args)),
        emitter    = new EventEmitter();

    emitter.on('close', () => subprocess.kill());

    let lastRow = '';
    subprocess.stdout.on('data', (chunk) => {
        const rows = bufferToString(chunk).split(/\r?\n/g);
        rows[0]    = lastRow + rows[0];
        lastRow    = rows.pop();
        rows.forEach((dataRow) => emitter.emit('data', dataRow));
    });

    subprocess.on('error', (err) => emitter.emit('error', err));
    subprocess.on('exit', (exitCode) => {
        emitter.emit('data', lastRow);
        emitter.emit('end', exitCode);
    });

    return emitter;
}; // exports.spawn