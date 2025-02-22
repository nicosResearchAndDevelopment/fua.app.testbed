const
    tshark        = exports,
    child_process = require('child_process'),
    EventEmitter  = require('events');

/**
 * @param {...string} args
 * @returns {ChildProcess}
 */
function spawnTshark(...args) {
    return child_process.spawn('tshark', args);
} // spawnTshark

/**
 * @param {...string} args
 * @returns {Promise<string>}
 */
async function execTshark(...args) {
    const
        proc   = child_process.spawn('tshark', args),
        result = await new Promise((resolve, reject) => {
            let stdout = '', stderr = '', finished = false;
            proc.stdout.on('data', (chunk) => stdout += chunk);
            proc.stderr.on('data', (chunk) => stderr += chunk);
            proc.on('error', (err) => {
                debugger;
                !finished && (finished = true) && resolve({err});
            });
            proc.on('exit', (code) => !finished && (finished = true) && resolve({stdout, stderr, code}));
        });

    if (result.code === 0) {
        return result.stdout;
    } else {
        // this error wrap ensures a usable stack trace
        const err = result.err || new Error(result.stderr);
        Error.captureStackTrace(err, execTshark);
        throw err;
    }
} // execTshark

// TShark (Wireshark) 3.4.4 (v3.4.4-0-gc33f6306cbb2)  
// Dump and analyze network traffic.
// See https://www.wireshark.org for more information.
// 
// Usage: tshark [options] ...
// 
// Capture interface:
//     -i <interface>, --interface <interface>
//                             name or idx of interface (def: first non-loopback)
//     -f <capture filter>      packet filter in libpcap filter syntax
//     -s <snaplen>, --snapshot-length <snaplen>
//                             packet snapshot length (def: appropriate maximum)
//     -p, --no-promiscuous-mode
//                             don't capture in promiscuous mode    
//     -I, --monitor-mode       capture in monitor mode, if available
//     -B <buffer size>, --buffer-size <buffer size>
//                             size of kernel buffer (def: 2MB)
//     -y <link type>, --linktype <link type>
//                             link layer type (def: first appropriate)
//     --time-stamp-type <type> timestamp method for interface
//     -D, --list-interfaces    print list of interfaces and exit
//     -L, --list-data-link-types
//                             print list of link-layer types of iface and exit
//     --list-time-stamp-types  print list of timestamp types for iface and exit
// 
// Capture stop conditions:
//     -c <packet count>        stop after n packets (def: infinite)
//     -a <autostop cond.> ..., --autostop <autostop cond.> ...
//                             duration:NUM - stop after NUM seconds
//                             filesize:NUM - stop this file after NUM KB
//                                 files:NUM - stop after NUM files
//                             packets:NUM - stop after NUM packets
// Capture output:
//     -b <ringbuffer opt.> ..., --ring-buffer <ringbuffer opt.>
//                             duration:NUM - switch to next file after NUM secs
//                             filesize:NUM - switch to next file after NUM KB
//                                 files:NUM - ringbuffer: replace after NUM files
//                             packets:NUM - switch to next file after NUM packets
//                             interval:NUM - switch to next file when the time is
//                                             an exact multiple of NUM secs
// RPCAP options:
//     -A <user>:<password>     use RPCAP password authentication
// Input file:
//     -r <infile>, --read-file <infile>
//                             set the filename to read from (or '-' for stdin)
// 
// Processing:
//     -2                       perform a two-pass analysis
//     -M <packet count>        perform session auto reset
//     -R <read filter>, --read-filter <read filter>
//                             packet Read filter in Wireshark display filter syntax
//                             (requires -2)
//     -Y <display filter>, --display-filter <display filter>
//                             packet displaY filter in Wireshark display filter
//                             syntax
//     -n                       disable all name resolutions (def: all enabled)
//     -N <name resolve flags>  enable specific name resolution(s): "mnNtdv"
//     -d <layer_type>==<selector>,<decode_as_protocol> ...
//                             "Decode As", see the man page for details
//                             Example: tcp.port==8888,http
//     -H <hosts file>          read a list of entries from a hosts file, which will
//                             then be written to a capture file. (Implies -W n)
//     --enable-protocol <proto_name>
//                             enable dissection of proto_name
//     --disable-protocol <proto_name>
//                             disable dissection of proto_name
//     --enable-heuristic <short_name>
//                             enable dissection of heuristic protocol
//     --disable-heuristic <short_name>
//                             disable dissection of heuristic protocol
// Output:
//     -w <outfile|->           write packets to a pcapng-format file named "outfile"
//                             (or '-' for stdout)
//     --capture-comment <comment>
//                             set the capture file comment, if supported
//     -C <config profile>      start with specified configuration profile
//     -F <output file type>    set the output file type, default is pcapng
//                             an empty "-F" option will list the file types
//     -V                       add output of packet tree        (Packet Details)
//     -O <protocols>           Only show packet details of these protocols, comma
//                             separated
//     -P, --print              print packet summary even when writing to a file
//     -S <separator>           the line separator to print between packets
//     -x                       add output of hex and ASCII dump (Packet Bytes)
//     -T pdml|ps|psml|json|jsonraw|ek|tabs|text|fields|?
//                             format of text output (def: text)
//     -j <protocolfilter>      protocols layers filter if -T ek|pdml|json selected
//                             (e.g. "ip ip.flags text", filter does not expand child
//                             nodes, unless child is specified also in the filter)
//     -J <protocolfilter>      top level protocol filter if -T ek|pdml|json selected
//                             (e.g. "http tcp", filter which expands all child nodes)
//     -e <field>               field to print if -Tfields selected (e.g. tcp.port,
//                             _ws.col.Info)
//                             this option can be repeated to print multiple fields
//     -E<fieldsoption>=<value> set options for output when -Tfields selected:
//         bom=y|n               print a UTF-8 BOM
//         header=y|n            switch headers on and off
//         separator=/t|/s|<char> select tab, space, printable character as separator
//         occurrence=f|l|a      print first, last or all occurrences of each field
//         aggregator=,|/s|<char> select comma, space, printable character as
//                             aggregator
//         quote=d|s|n           select double, single, no quotes for values
//     -t a|ad|adoy|d|dd|e|r|u|ud|udoy
//                             output format of time stamps (def: r: rel. to first)
//     -u s|hms                 output format of seconds (def: s: seconds)
//     -l                       flush standard output after each packet
//     -q                       be more quiet on stdout (e.g. when using statistics)
//     -Q                       only log true errors to stderr (quieter than -q)
//     -g                       enable group read access on the output file(s)
//     -W n                     Save extra information in the file, if supported.
//                             n = write network address resolution information
//     -X <key>:<value>         eXtension options, see the man page for details
//     -U tap_name              PDUs export mode, see the man page for details
//     -z <statistics>          various statistics, see the man page for details
//     --export-objects <protocol>,<destdir>
//                             save exported objects for a protocol to a directory
//                             named "destdir"
//     --color                  color output text similarly to the Wireshark GUI,
//                             requires a terminal with 24-bit color support
//                             Also supplies color attributes to pdml and psml formats
//                             (Note that attributes are nonstandard)
//     --no-duplicate-keys      If -T json is specified, merge duplicate keys in an object
//                             into a single key with as value a json array containing all
//                             values
//     --elastic-mapping-filter <protocols> If -G elastic-mapping is specified, put only the
//                             specified protocols within the mapping file
// 
// Miscellaneous:
//     -h, --help               display this help and exit
//     -v, --version            display version info and exit
//     -o <name>:<value> ...    override preference setting
//     -K <keytab>              keytab file to use for kerberos decryption
//     -G [report]              dump one of several available reports and exit
//                             default report="fields"
//                             use "-G help" for more help

tshark.listInterfaces = async function () {
    const
        stdout = await execTshark('-D'),
        result = stdout.trim().split(/\r?\n/g)
            .map(entry => entry.replace(/^\d+\./, '').trim());

    return result;
}; // tshark.listInterfaces

tshark.listDataLinkTypes = async function () {
    const
        stdout = await execTshark('-L'),
        result = stdout.trim().split(/\r?\n/g)
            .slice(1).map(entry => entry.trim());
    return result;
}; // tshark.listDataLinkTypes

tshark.captureTraffic = function (options) {
    const
        args    = Object.entries({
            '-i': options?.interface,
            '-y': options?.linktype
        }).filter(entry => entry[1]).flat(1),
        proc    = spawnTshark(...args),
        emitter = new EventEmitter();

    emitter.on('close', () => proc.kill());
    proc.on('error', err => {
        emitter.emit('error', err);
        emitter.emit('close');
    });

    let lastRow = '';
    proc.stdout.on('data', (data) => {
        const rows = data.toString().split(/\r?\n/g);
        rows[0]    = lastRow + rows[0];
        lastRow    = rows.pop();
        for (let row of rows) {
            const found = row.match(/^ *(\d+) +(\d+\.\d+) +(\S+) → (\S+) +(.*)$/);
            if (found) {
                emitter.emit('data', {
                    index:   parseInt(found[1]),
                    time:    parseFloat(found[2]),
                    source:  found[3],
                    target:  found[4],
                    message: found[5]
                });
            } else {
                emitter.emit('data', row.trim());
            }
        }
    });

    return emitter;
}; // tshark.captureTraffic