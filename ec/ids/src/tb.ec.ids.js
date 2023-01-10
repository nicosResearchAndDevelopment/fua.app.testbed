const
    util             = require('./tb.ec.ids.util.js'),
    testing          = require('@nrd/fua.module.testing'),
    {RunningProcess} = require('@nrd/fua.module.subprocess'),
    NODE             = RunningProcess('node', {verbose: true, cwd: __dirname});

/** @type {fua.module.testing.TestingEcosystem} */
module.exports = new testing.Ecosystem({
    '@id': 'urn:tb:ec:ids',
    async initializer(args = {}) {

        // TODO

        // const
        //     aliceProc = NODE('./rc/connector/launch.rc-connector.js', {
        //         config: Buffer.from(JSON.stringify({
        //             name: 'ALICE'
        //         })).toString('base64')
        //     }),
        //     bobProc   = NODE('./rc/connector/launch.rc-connector.js', {
        //         config: Buffer.from(JSON.stringify({
        //             name: 'BOB'
        //         })).toString('base64')
        //     });
        //
        // await Promise.all([
        //     new Promise((resolve, reject) => {
        //         let onSpawn, onError;
        //         aliceProc.once('spawn', onSpawn = () => {
        //             aliceProc.off('error', onError);
        //             resolve();
        //         });
        //         aliceProc.once('error', onError = (err) => {
        //             aliceProc.off('spawn', onSpawn);
        //             reject(err);
        //         });
        //     }),
        //     new Promise((resolve, reject) => {
        //         let onSpawn, onError;
        //         bobProc.once('spawn', onSpawn = () => {
        //             bobProc.off('error', onError);
        //             resolve();
        //         });
        //         bobProc.once('error', onError = (err) => {
        //             bobProc.off('spawn', onSpawn);
        //             reject(err);
        //         });
        //     })
        // ]);

    },
    testMethods:    [
        // require('./tm/tb.ec.ids.tm.rc_refreshDAT.js'),
        // require('./tm/tb.ec.ids.tm.rc_createSelfDescription.js')
    ],
    testCases:      [
        // require('./tc/tb.ec.ids.tc.SUT_provideSelfDescription.js')
        require('./tc/DAPSInteraction/CheckDATfromDAPS.js'),
        require('./tc/DAPSInteraction/CommunicationDATProvisioning.js'),
        require('./tc/DAPSInteraction/DATDeniedfromDAPS.js'),
        require('./tc/DAPSInteraction/NoDATObtainedfromDAPS.js'),
        require('./tc/DAPSInteraction/ReceiveDATfromDAPS.js'),
        require('./tc/DAPSInteraction/ReceiveInvalidDATfromDAPS.js')
    ],
    testProcedures: []
});
