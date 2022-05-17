const
    path                            = require("path"),
    fs                              = require("fs"),
    {describe, test, before, after} = require('mocha'),
    //
    util                            = require('@nrd/fua.core.util'),
    uuid                            = require('@nrd/fua.core.uuid'),
    //
    testsuite_id                    = "https://testsuite.nicos-rd.com/",
    tc_root_urn                     = `urn:ts:ec:net:tc:`,
    tc_root_uri                     = `${testsuite_id}ec/net/tc/`,
    //
    TestsuiteAgent                  = require('../../src/code/agent.testsuite.js')// REM: as agent
    //Portscan                        = require('../../src/agent.testsuite.js')
;

const
    operator = "https://testbed.nicos-rd.com/domain/user#jlangkau"
    //operator = "https://testbed.nicos-rd.com/domain/user#spetrac",
;

const
    tc_console_log = true,
    ports          = {
        needed: undefined, // REM: TC claims to need those
        //used:   undefined, // REM: applicant claims to use those
        bad: {tcp: [21]} // REM: TC claims those to be bad, validation-result on NOT_bad, PASS|FAIL|NOT_APPLICABLE
        //bad:    {tcp: []}
    },
    //applicant = {
    //    log_root: "",
    //    name:     "bob",
    //    host:     "127.0.0.1",
    //    port:     8080
    //}
    // auditlog       = `C:/fua/DEVL/js/app/nrd-testbed/auditlog`,
    auditlog       = path.join(__dirname, '../../../auditlog'),
    applicant_root = `${auditlog}/tb_ids_bob`,
    session_root   = `${applicant_root}/net`,
    applicant      = require(`${applicant_root}/config.json`)
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

describe('net', function () {

    this.timeout(0);

    let
        tc,
        session,
        agent
    ;

    before(async function () {

        let config = {
            ...require('../../src/config/config.testsuite.js'),
            port:    8081,
            testbed: {
                // https://testbed.nicos-rd.com:8080/
                schema:  "https",
                host:    "testbed.nicos-rd.com",
                port:    8080,
                auth:    {
                    user:     "testsuite",
                    password: "marzipan" // TODO : password : HASH
                },
                options: {
                    requestCert:        false,
                    rejectUnauthorized: false
                }
            }
        };

        session = Session({root: session_root});
        //session = null; // REM : mute output

        agent = await TestsuiteAgent.create({
            id:      testsuite_id,
            schema:   'https',
            hostname: 'testsuite.nicos-rd.com',
            port:     8081,
            prefix:  'ts',
            store:   config.space.datastore,
            testbed: config.testbed
        });

        tc = require('../../src/tc/ec/net/tc.ec.net.launch.js')({
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

    describe('ping', function () {

        //before(function () {
        //
        //}); // before()

        test(
            `should successfully 'ping' applicant <${applicant.host}>`,
            async () => await tc.ping(
                agent.Token({
                    id:     undefined,
                    start:  undefined,
                    thread: `${util.utcDateTime()} : TS-MOCHA : test : ping :  start`
                }),
                /** data */ {
                    operator: operator,
                    param:    {
                        host: applicant.host
                    }
                }, session)
        ); // test

        after(function () {
            console.log(`#########################################################`);
            console.log(`# ${tc_root_urn}ping : after`);
            console.log(`#########################################################`);
        }); // after()

    }); // describe(ping)

    describe('portscan', function () {

        let portscan;

        before(async function () {
            //let result = await tc.ping(
            //    agent.Token({
            //        id:     undefined,
            //        start:  undefined,
            //        thread: `${util.utcDateTime()} : TS-MOCHA : test : ping :  start`
            //    }),
            //    /** data */ {
            //        param: {
            //            host: applicant.host
            //        }
            //    }, session);
            //if (result.error)
            //    throw (error);
            ////throw (new Error(``)); // REM : testing only
        });

        test(
            `TODO should successfully make 'portscan' at applicant <${applicant.host}`,
            () => tc.portscan(agent.Token({
                    id:     undefined,
                    start:  undefined,
                    thread: `${util.utcDateTime()} : TS-MOCHA : test : portscan : start`
                }),
                /** data */ {
                    operator: operator,
                    param:    {
                        host:  applicant.host,
                        ports: ports
                    }
                }, session)
        ); // test

        after(function () {
            console.log(`#########################################################`);
            console.log(`# ${tc_root_urn}portscan : after`);
            console.log(`#########################################################`);
        }); // after()

    }); // describe(portscan)

}); // describe('NET')
