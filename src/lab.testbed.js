module.exports = async function TestbedLab(
    {
        'agent':      agent,
        'serverNode': serverNode
    }
) {

    //region TEST

    //region TEST :: space

    //let
    //    users = await agent.domain.users()
    //;

    //let jlangkau = Buffer.from("jlangkau:marzipan").toString('base64');
    //jlangkau     = "amxhbmdrYXU6bWFyemlwYW4=";

    //let
    //    user  = await agent.domain.authenticate("amxhbmdrYXU6bWFyemlwYW4=", 'BasicAuthentication_Leave'),
    //    group = await agent.domain.groups.get("https://testbed.nicos-rd.com/domain/group#admin"),
    //    is_in = await agent.domain.group.hasMember(group, user)
    //;
    //is_in     = await agent.domain.group.hasMember(group, "http//:unknown_user/");
    //is_in     = await agent.domain.user.memberOf(user, group);

    //endregion TEST :: space

    //region TEST :: IDS

    //region TEST :: IDS :: DAPS
    //
    //// nrd_gbx03
    //user = await agent.domain.users.get("https://testbed.nicos-rd.com/domain/user#11_B9_DE_C7_63_7C_00_B6_A9_32_57_5A_23_01_3F_44_0E_39_02_82_keyid_3B_9B_8E_72_A4_54_05_5A_10_48_E7_C0_33_0B_87_02_BC_57_7C_A4");
    //
    ////const requestToken = DAPS.client.generateReqeustToken();
    //
    //const
    //    {ClientDaps}    = require(path.join(util.FUA_JS_LIB, 'ids/ids.client.daps/src/ids.client.DAPS.beta.js')),
    //    crypto          = require("crypto"),
    //    {client}        = require("C:/fua/DEVL/js/app/nrd-testbed/ec/ids/resources/cert/index.js"),
    //    clientDaps      = new ClientDaps({
    //        'id':          "http://nrd-ids-bc.nicos-rd.com/",
    //        'daps_host':   "http://nrd-daps.nicos-rd.com/",
    //        'private_key': crypto.createPrivateKey(client.private),
    //        'skiaki':      "11_B9_DE_C7_63_7C_00_B6_A9_32_57_5A_23_01_3F_44_0E_39_02_82_keyid_3B_9B_8E_72_A4_54_05_5A_10_48_E7_C0_33_0B_87_02_BC_57_7C_A4".replace(/_/g, ':')
    //    })
    //;
    //let
    //    DATrequestToken = await clientDaps.produceDatRequestToken({
    //        'scope':  "this.is.not.a.scope",
    //        'format': "json"
    //    }),
    //    DAT             = await agent.DAPS.generateDAT(DATrequestToken)
    //;
    //endregion TEST :: IDS :: DAPS

    //region TEST :: IDS :: bc-rc

    //endregion TEST :: IDS :: bc-rc

    //endregion TEST :: IDS
    //region TEST :: executeTest
    // REM : so, coming from testsuite by socket.io
    let test = {
        'ec':      "ip",
        'command': "ping",
        'param':   {
            'endpoint': "127.0.0.1"
        }
    };

    //function data_consumer(data) {
    //    console.log(data);
    //    //debugger;
    //}
    if (/** shield */ false) {
        agent.executeTest({ // REM : connect ALICE
            'ec':      "ids",
            'command': "connect",
            'param':   {
                'url':  `${exec_cmd_Alice.schema}://${exec_cmd_Alice.host}:${exec_cmd_Alice.port}`,
                'auth': {
                    'user':     exec_cmd_Alice.user.tb_ec_ids.name,
                    'password': exec_cmd_Alice.user.tb_ec_ids.password
                }
            }
        }).then((result) => {

            console.log("TEST : app.testbed :: agent.executeTest(connect ALICE).then :: >>>");
            console.log(result);
            console.log("TEST : app.testbed :: agent.executeTest(connect ALICE).then :: <<<");

            //let BPMN_token = {
            //    id:   "asdf", // REM : this is the thread
            //    type: ["bpmn:Token"],
            //    data: { // REM : connect BOB
            //        'ec':      "ids",
            //        'command': "connect",
            //        'param':   {
            //            'url':   `${exec_cmd_Bob.schema}://${exec_cmd_Bob.host}:${exec_cmd_Bob.port}`,
            //            'query': {
            //                'user':     exec_cmd_Bob.user.tb_ec_ids.name,
            //                'password': exec_cmd_Bob.user.tb_ec_ids.password
            //            }
            //        }
            //    }
            //};

            agent.executeTest({ // REM : connect BOB
                'ec':      "ids",
                'command': "connect",
                'param':   {
                    'url':  `${exec_cmd_Bob.schema}://${exec_cmd_Bob.host}:${exec_cmd_Bob.port}`,
                    'auth': {
                        'user':     exec_cmd_Bob.user.tb_ec_ids.name,
                        'password': exec_cmd_Bob.user.tb_ec_ids.password
                    }
                }
            }).then((result) => {

                console.log("TEST : app.testbed :: agent.executeTest(connect BOB).then :: >>>");
                console.log(result);
                console.log("TEST : app.testbed :: agent.executeTest(connect BOB).then :: <<<");

                //debugger;
                //region ec :: ip
                //agent.executeTest({ // REM : ping
                //    'ec':      "ip",
                //    'command': "ping",
                //    'param':   {
                //        'endpoint': "127.0.0.1"
                //    }
                //}).then((result) => {
                //    result;
                //    debugger;
                //}).catch((error) => {
                //    error;
                //    debugger;
                //});
                //endregion ec :: ip

                //region ec :: ids

                agent.executeTest({ // REM : requestConnectorSelfDescription
                    'comment': "ec.ids : Alice will get Bobs selfDescription",
                    'ec':      "ids",
                    'command': "requestConnectorSelfDescription",
                    'param':   {
                        //'operator': "simon petrac",
                        'rc': `${exec_cmd_Alice.schema}://${exec_cmd_Alice.host}:${exec_cmd_Alice.port}`,
                        // REM : Bob as applicant
                        'schema': `${exec_cmd_Bob.schema}`,
                        'host':   exec_cmd_Bob.host,
                        'path':   `:${exec_cmd_Bob.port}/about`
                    }
                }).then((result) => {
                    console.log("TEST : app.testbed :: agent.executeTest(requestConnectorSelfDescription).then :: >>>");
                    console.log(result);
                    console.log("TEST : app.testbed :: agent.executeTest(requestConnectorSelfDescription).then :: <<<");
                }).catch((error) => {
                    console.error(error);
                    debugger;
                });

                //agent.executeTest({ // REM : connectorSelfDescriptionRequest
                //    'ec':      "ids",
                //    'command': "connectorSelfDescriptionRequest",
                //    'param':   {
                //        'requester_url': "https://127.0.0.1:8099/about",
                //        'timeout':       3 // REM : seconds
                //    }
                //}).then((result) => {
                //    result;
                //    debugger;
                //}).catch((error) => {
                //    error;
                //    debugger;
                //});

                //agent.executeTest({ // REM : getSelfDescriptionFromRC
                //    'ec':      "ids",
                //    'command': "getSelfDescriptionFromRC",
                //    'param':   undefined
                //}).then((result) => {
                //    result;
                //    debugger;
                //}).catch((error) => {
                //    error;
                //    debugger;
                //});

                //endregion ec :: ids

                //    //agent.executeTest({ // REM : on_RC_IDLE
                //    //    'ec':      "ids",
                //    //    'command': "on_RC_IDLE",
                //    //    'param':   undefined
                //    //}, data_consumer );

            }).catch((error) => {
                error;
                debugger;
            });

        }).catch((error) => {
            debugger;
            error;
            //io :: callback(error, undefined);
        });
    } // if (shield)
    //endregion TEST :: executeTest

    //debugger; // TEST

    //endregion TEST

}; // module.exports
