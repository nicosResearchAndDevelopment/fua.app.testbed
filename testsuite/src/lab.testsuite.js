const
    util = require('./code/util.testsuite.js');

module.exports = async function TestsuiteLab(
    {
        'agent': agent
    }
) {

    // REM disable lab shield
    if (true) return;

    agent.amec
        .on('authentication-error', (error) => {
            util.logError(error);
            //debugger;
        });

    agent.server
        .on('error', (error) => {
            util.logError(error);
        });

    if (!agent.testbed_connected)
        await new Promise(resolve => agent.once('testbed_socket_connect', resolve));

    let
        alice = "http://127.0.0.1:8099/",
        bob   = {
            schema: "http",
            host:   "127.0.0.1",
            port:   8098
        }
        // REM : doesn't work!!!!!!!! (connect NOT present!!!
    ; // let

    // const param = { // REM : connect ALICE
    //    'ec':      "ids",
    //    'command': "getSelfDescriptionFromRC",
    //    'param':   {
    //        'rc': alice
    //    }
    // };
    const param = { // REM : ALICE gets BOBs selfDescription
        'ec':      "ids",
        'command': "requestApplicantsSelfDescription",
        'param':   {
            //'operator': "simon petrac",
            'rc': alice,
            // REM : Bob as applicant
            'schema': bob.schema,
            'host':   bob.host,
            'port':   bob.port,
            'path':   "/about"
        }
    };

    // const data = { // REM :
    //    //'ec':      "ids",
    //    //'command': "requestApplicantsSelfDescription",
    //    testCase: "urn:ts:ec:ids:tc:INF_01",
    //    param:   {
    //        //'operator': "simon petrac",
    //        'rc': alice,
    //        // REM : Bob as applicant
    //        'schema': bob.schema,
    //        'host':   bob.host,
    //        'port':   bob.port,
    //        'path':   "/about"
    //    }
    // };
    const data = { // REM : ping localhost ALICE
        testCase: "urn:ts:ec:net:tc:ping",
        param:    {
            'host': "127.0.0.1"
        }
    };
    // const data = { // REM : ping localhost ALICE
    //    testCase: "urn:ts:ec:net:tc:portscan",
    //    param:    {
    //        'host': "127.0.0.1"
    //    }
    // };
    let
        pool_root = `${agent.id}bpef/pool/`,
        test_result
    ;
    try {

        let host      = "applicant.com";
        data.operator = "https://testbed.nicos-rd.com/domain/user#jlangkau";

        //test_result = await agent.test(agent.Token({id: undefined, start: undefined}), data);

        test_result = await agent.enforce(
            agent.Token({
                id:     undefined,
                start:  undefined,
                thread: `${util.utcDateTime()} : TESTSUITE : app : process : start`
            }),
            data
        );

        util.logObject(test_result);
        debugger;

    } catch (error) {
        util.logError(error);
        debugger;
    } // try

}; // module.exports = TestsuiteLab
