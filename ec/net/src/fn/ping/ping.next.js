// const
//     util               = require('@nrd/fua.core.util'),
//     {ExecutionProcess} = require('@nrd/fua.module.subprocess'),
//     {TestExec}         = require('@nrd/fua.module.testing/model'),
//     cmd_ping           = ExecutionProcess('ping', {encoding: 'cp437'});
//
// module.exports = new TestExec({
//     '@id': 'urn:tb:ec:net:te:ping',
//     /** @param {fua.module.testing.ProxyToken} token */
//     async execMethod(token) {
//         const
//             result = {
//                 timestamp: util.utcDateTime(),
//                 isAlive:   false
//             },
//             output = await cmd_ping({'n': 1}, token.param.host),
//             parts  = output.split(/\r?\n\r?\n/);
//
//         result.info      = parts[0];
//         result.statistic = parts[1] || null;
//
//         if (result.statistic !== null)
//             result.isAlive = true;
//
//         return result;
//     }
// });
