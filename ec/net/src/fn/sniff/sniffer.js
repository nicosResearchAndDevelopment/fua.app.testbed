const
    uuid             = require('@nrd/fua.core.uuid'),
    {RunningProcess} = require('@nrd/fua.module.subprocess'),
    EventEmitter     = require('events'),
    cmd_tshark       = RunningProcess('tshark', {verbose: false}),
    emitter          = new EventEmitter(),
    commandId        = '/tshark-sniff#',
    processMap       = new Map();

exports.start = function (param) {
    const
        processId    = commandId + uuid.v1(),
        processArgs  = param.args,
        childProcess = cmd_tshark(...processArgs),
        startData    = {
            type:    'ProcessStart',
            command: commandId,
            process: processId,
            started: false
        };

    let lastLine = '';
    childProcess.stdout.on('data', function (chunk) {
        const lines = chunk.toString().split(/\r?\n/g);
        lines[0]    = lastLine + lines[0];
        lastLine    = lines.pop();
        for (let line of lines) {
            const lineData = {
                type:    'ProcessData',
                command: commandId,
                process: processId,
                last:    false,
                data:    line
            };
            emitter.emit('event', null, lineData);
        }
        const chunkData = {
            type:    'ProcessChunk',
            command: commandId,
            process: processId,
            data:    chunk
        };
        emitter.emit('event', null, chunkData);
    });

    childProcess.on('spawn', function (err) {
        const spawnData = {
            type:    'ProcessSpawn',
            command: commandId,
            process: processId
        };
        emitter.emit('event', null, spawnData);
    });

    childProcess.on('error', function (err) {
        emitter.emit('event', err);
    });

    childProcess.on('exit', function (exitCode) {
        processMap.delete(processId);
        const lastLineData = {
            type:    'ProcessData',
            command: commandId,
            process: processId,
            last:    true,
            data:    lastLine
        };
        emitter.emit('event', null, lastLineData);
        const closeData = {
            type:     'ProcessExit',
            command:  commandId,
            process:  processId,
            exitCode: exitCode
        };
        emitter.emit('event', null, closeData);
    });

    processMap.set(processId, childProcess);
    startData.started = true;
    return startData;
}; // sniffer.start

exports.stop = function (param) {
    const
        processId    = param.process,
        childProcess = processMap.get(processId),
        stopData     = {
            type:    'ProcessStop',
            command: commandId,
            process: processId,
            stopped: false
        };

    if (childProcess) {
        childProcess.kill();
        stopData.stopped = true;
    }
    return stopData;
}; // sniffer.stop

exports.listen = function (event, listener) {
    emitter.on(event, listener);
}; // sniffer.listen
