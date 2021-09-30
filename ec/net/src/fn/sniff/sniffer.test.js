const
    sniffer    = require('./sniffer.js'),
    // startParam = {args: [{i: 'Ethernet 4', y: 'EN10MB'}]},
    // startParam = {args: [{i: 'Ethernet 4', y: 'EN10MB', T: 'json'}]},
    startParam = {args: [{i: 'Ethernet 4', y: 'EN10MB', T: 'ek'}]},
    startData  = sniffer.start(startParam),
    stopParam  = {process: startData.process};

// console.log(startData);

let lineBuffer = [];
sniffer.listen('event', (err, data) => {
    if (err) {
        console.error(err);
    } else {
        switch (data?.type) {
            case 'ProcessSpawn':
            case 'ProcessExit':
                // console.log(data);
                break;

            case 'ProcessData':
                console.log(data.data);

                // if (data.data.startsWith('  }')) {
                //     lineBuffer.push('  }');
                //     const
                //         jsonStr = lineBuffer.join('\n'),
                //         jsonObj = JSON.parse(jsonStr);
                //     lineBuffer  = [];
                //     console.log(jsonObj);
                //     // console.log(JSON.stringify(jsonObj, null, 2));
                // } else if (data.data.startsWith('  ')) {
                //     lineBuffer.push(data.data);
                // }

                // if (!data.last) {
                //     const jsonObj = JSON.parse(data.data);
                //     // console.log(jsonObj);
                //     console.log(JSON.stringify(jsonObj, null, 2));
                // }
                break;

            case 'ProcessChunk':
                // console.log(
                //     '-----CHUNK START-----\n' +
                //     data.data.toString() +
                //     '\n-----CHUNK END-----'
                // );
                break;
        } // switch
    }
});

setTimeout(() => {
    const stopData = sniffer.stop(stopParam);
    // console.log(stopData);
}, 4000);
