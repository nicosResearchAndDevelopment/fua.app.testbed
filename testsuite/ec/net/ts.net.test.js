const
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
    {TestsuiteAgent}                = require('../../src/agent.testsuite.js')// REM: as agent
    //Portscan                        = require('../../src/agent.testsuite.js')
;

const
    bad_ports      = {
        tcp: [21]
    },
    //applicant = {
    //    log_root: "",
    //    name:     "bob",
    //    host:     "127.0.0.1",
    //    port:     8080
    //}
    auditlog       = `C:/fua/DEVL/js/app/nrd-testbed/auditlog`,
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
            port:    8081,
            testbed: {
                schema: "http",
                host:   "127.0.0.1",
                port:   8080,
                auth:   {
                    user:     "testsuite",
                    password: "marzipan" // TODO : password : HASH
                }
            }
        };

        session = Session({root: session_root});
        //session = null; // REM : mute output

        agent = await TestsuiteAgent({
            id:      testsuite_id,
            testbed: config.testbed
        });
        tc    = require('../../src/tc/ec/net/tc.ec.net.launch.js')({
            //ec:          "net", // REM : "net" = default
            root_uri: testsuite_id,
            root_urn: "urn:ts:",
            agent:    agent
        });
        await new Promise((resolve, reject) => {
            agent.on('testbed_socket_connect', async () => {
                resolve();
            });
        });

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
                    thread: `${util.timestamp()} : TS-MOCHA : test : ping :  start`
                }),
                /** data */ {
                    param: {
                        host: applicant.host
                    }
                }, session)
        ); // test

        //after(function () {
        //
        //}); // after()

    }); // describe(ping)

    describe('portscan', function () {

        let portscan;

        //before(async function () {
        //
        //});

        test(
            `TODO should successfully make 'portscan' at applicant <${applicant.host}`,
            () => tc.portscan(agent.Token({
                    id:     undefined,
                    start:  undefined,
                    thread: `${util.timestamp()} : TS-MOCHA : test : portscan : start`
                }),
                /** data */ {
                    param: {
                        host: applicant.host,
                        bad:  bad_ports
                    }
                }, session)
        ); // test

        //after(function () {
        //
        //}); // after()

    }); // describe(portscan)

}); // describe('NET')