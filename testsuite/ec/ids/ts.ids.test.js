const
    path                            = require("path"),
    fs                              = require("fs"),
    {describe, test, before, after} = require('mocha'),
    //
    util                            = require('@nrd/fua.core.util'),
    uuid                            = require('@nrd/fua.core.uuid'),
    //
    testsuite_id                    = "https://testsuite.nicos-rd.com/",
    tc_root_urn                     = `urn:ts:ec:ids:tc:`,
    tc_root_uri                     = `${testsuite_id}ec/ids/tc/`,
    //
    cert                            = require('../../cert/tls-server/server.js'),
    TestsuiteAgent                  = require('../../src/code/agent.testsuite.js')// REM: as agent
    //Portscan                        = require('../../src/agent.testsuite.js')
;

const
    operator = "https://testbed.nicos-rd.com/domain/user#jlangkau"
    //operator = "https://testbed.nicos-rd.com/domain/user#spetrac",
;

const
    tc_console_log = true,
    // auditlog       = `C:/fua/DEVL/js/app/nrd-testbed/auditlog`,
    auditlog       = path.join(__dirname, '../../../auditlog'),
    applicant_root = `${auditlog}/tb_ids_bob`,
    session_root   = `${applicant_root}/ids`,
    applicant      = require(`${applicant_root}/config.json`)
;

let
    testbed_io = {
        schema:  "https",
        host:    "testbed.nicos-rd.com",
        port:    8080,
        options: {
            key:                  cert.key,
            cert:                 cert.cert,
            ca:                   cert.ca,
            requestCert:          false, // REM : server ONLY
            rejectUnauthorized:   false,
            reconnectionDelayMax: 10000,
            reconnect:            true,
            auth:                 {
                user:     "testsuite",
                password: "marzipan" // TODO : password : HASH
            }
        }
    },
    alice      = "https://alice.nicos-rd.com:8099/",
    bob        = {
        schema: "https",
        host:   "bob.nicos-rd.com",
        port:   8098
    },
    data
; // let

const
    RC  = alice,
    SUT = bob
;

function Session({
                     root: root
                 }) {

    let session = {};

    Object.defineProperties(session, {
        write: {
            value:         async ({testcase: testcase, token: token, data: data, error: error}) => {
                try {
                    const
                        leave = uuid.v1()
                    ;
                    let node  = {
                            id:    `${tc_root_uri}${testcase}/${leave}`,
                            urn:   `${tc_root_urn}${testcase}:${leave}`,
                            token: token,
                            data:  data
                        }
                    ;
                    if (error)
                        node.error = error;

                    fs.writeFileSync(`${root}/${testcase}_${leave}.json`, JSON.stringify(node, "", "\t"), /** options */ {});
                } catch (jex) {
                    throw (jex);
                } // try
            }, enumerable: false
        } // write
    }); // Object.defineProperties(session)

    Object.freeze(session);
    return session;
}

describe('IDS', function () {

    this.timeout(0);

    let
        tc,
        session,
        agent
    ;

    before(async function () {

        let config = {
            port: 8081
        };

        session = Session({root: session_root});
        //session = null; // REM : mute output

        agent = await TestsuiteAgent.create({
            id:      testsuite_id,
            testbed: testbed_io
        });
        tc    = require('../../src/tc/ec/ids/tc.ec.ids.launch.js')({
            //ec:          "net", // REM : "net" = default
            root_uri:    testsuite_id,
            root_urn:    "urn:ts:",
            agent:       agent,
            console_log: tc_console_log
        });

        if (!agent.testbed_connected) await new Promise((resolve, reject) => agent
            .once('testbed_socket_connect', resolve)
            .once('error', reject)
        );

    }); // before()

    //describe('INF_01', function () {
    //
    //    //before(function () {
    //    //
    //    //}); // before()
    //
    //    //param = { // REM : ALICE gets BOBs selfDescription
    //    //    'ec':      "ids",
    //    //    'command': "requestApplicantsSelfDescription",
    //    //operator: operator,
    //    //    'param':   {
    //    //        //'operator': "simon petrac",
    //    //        'rc': alice,
    //    //        // REM : Bob as applicant
    //    //        'schema': bob.schema,
    //    //        'host':   bob.host,
    //    //        'port':   bob.port,
    //    //        'path':   "/about"
    //    //    }
    //    //};
    //    //
    //    test(`should successfully 'ping' applicant <${applicant.host}>`, async () => await tc.INF_01(
    //        agent.Token({
    //            id:     undefined,
    //            start:  undefined,
    //            thread: `${util.utcDateTime()} : TS-MOCHA : test : ping :  start`
    //        }),
    //        /** data */ {
    //            operator: operator,
    //            param:    {
    //                host: applicant.host
    //            }
    //        }, session)
    //    ); // test
    //
    //    //after(function () {
    //    //
    //    //}); // after()
    //
    //}); // describe(INF_01)

    describe('SUT_provides_self_description', function () {

        before(function () {
            data = { // REM : ALICE gets BOBs selfDescription
                ec:       "ids",
                command:  "requestApplicantsSelfDescription",
                operator: operator,
                param:    {
                    rc:     RC,
                    schema: SUT.schema,
                    host:   SUT.host,
                    port:   SUT.port,
                    path:   "/about"
                }
            };
        }); // before()

        test(`should successfully consume applicants <${applicant.host}> Self Description`, async () => await tc.SUT_provides_self_description(
            agent.Token({
                id:     undefined,
                start:  undefined,
                thread: `${util.utcDateTime()} : TS-MOCHA : test : requestApplicantsSelfDescription :  start`
            }),
            data,
            session)
        ); // test

        //after(function () {
        //
        //}); // after()

    }); // describe(SUT_provides_self_description)

    describe('rc_refreshDAT', function () {

        before(() => {
            data = { // REM : ALICE gets BOBs selfDescription
                ec:       "ids",
                command:  "rc_refreshDAT",
                operator: operator,
                param:    {
                    rc:        RC,
                    daps:      "default",
                    rc_daps:   {
                        nbf: 12234234234
                    },
                    verifyDAT: true
                }
            };
        }); // before()

        test(`should refresh RC's <${RC}> DAT`, async () => await tc.rc_refreshDAT(
            agent.Token({
                id:     undefined,
                start:  undefined,
                thread: `${util.utcDateTime()} : TS-MOCHA : test : requestApplicantsSelfDescription :  start`
            }),
            data,
            session)
        ); // test

        //after(function () {
        //
        //}); // after()

    }); // describe(SUT_provides_self_description)

}); // describe('ids')
