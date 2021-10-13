const
    {describe, test, before, after} = require('mocha'),
    //
    util                            = require('@nrd/fua.core.util'),
    uuid                            = require('@nrd/fua.core.uuid'),
    //
    testsuite_id                    = "https://testsuite.nicos-rd.com/",
    tc_root_urn                     = `urn:ts:ec:ids:tc:`,
    tc_root_uri                     = `${testsuite_id}ec/ids/tc/`,
    //
    {TestsuiteAgent}                = require('../../src/agent.testsuite.js')// REM: as agent
    //Portscan                        = require('../../src/agent.testsuite.js')
;const Ping                         = require("../../src/tc/ec/net/tc/tc.ec.net.ping.js");

const
    bad       = {
        ports: [21]
    },
    applicant = {
        host: "127.0.0.1",
        port: 8080
    }
;
describe('NET', function () {

    this.timeout(0);

    let agent;

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
        agent      = await TestsuiteAgent({
            id:      testsuite_id,
            testbed: config.testbed
        });
        await new Promise((resolve, reject) => {
            agent.on('testbed_socket_connect', async () => {
                resolve();
            });
        });

    }); // before()

    describe('ping', function () {

        let ping;

        before(function () {
            const
                Ping = require('../../src/tc/ec/net/tc/tc.ec.net.ping.js')
            ;
            ping     = Ping({
                //ec:          "net", // REM : "net" = default
                tc_root_uri: tc_root_uri,
                tc_root_urn: tc_root_urn,
                agent:       agent
            });
        }); // before()

        test(
            `should successfully 'ping' applicant <${applicant.host}>`,
            () => ping(
                agent.Token({
                    id:     undefined,
                    start:  undefined,
                    thread: `${util.timestamp()} : TS-MOCHA : test :  start`
                }),
                /** data */ {
                    param: {
                        host: applicant.host
                    }
                })
        ); // test

    }); // describe(ping)

    describe('portscan', function () {

        let portscan;

        before(async function () {

            const
                Portscan = require('../../src/tc/ec/net/tc/tc.ec.net.portscan.js')
            ;
            portscan     = Portscan({
                //ec:          "net", // REM : "net" = default
                tc_root_uri: tc_root_uri,
                tc_root_urn: tc_root_urn,
                agent:       agent
            });

        });

        test(
            `TODO should successfully 'portscan' at applicant <${applicant.host}`,
            () => portscan(agent.Token({
                    id:     undefined,
                    start:  undefined,
                    thread: `${util.timestamp()} : TS-MOCHA : test :  start`
                }),
                /** data */ {
                    param: {
                        host: applicant.host,
                        bad:  bad.ports
                    }
                })
        ); // test

    }); // describe(portscan)

}); // describe('NET')