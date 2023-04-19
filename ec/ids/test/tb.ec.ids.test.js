const
    {describe, test, before} = require('mocha'),
    expect                   = require('expect'),
    https                    = require('https'),
    {Ecosystem, TestToken}   = require('@nrd/fua.module.testing'),
    DAPSClient               = require('@nrd/fua.ids.client.daps'),
    ecIDS                    = require('../src/tb.ec.ids.js'),
    aliceCerts               = require('../cert/alice/index.js');

describe('tb.ec.ids', function () {

    this.timeout('10s');

    before('initialized ids ecosystem', async function () {
        await ecIDS.initialize();
        expect(ecIDS).toBeInstanceOf(Ecosystem);
    });

    describe('tm', function () {

        test('develop', async function () {
            const token = TestToken.from({
                ecosystem:  'urn:tb:ec:ids',
                testMethod: 'urn:tb:ec:ids:tm:develop'
            });

            expect(token).toBeInstanceOf(TestToken);
            await ecIDS.launch(token);
            console.log(token.toJSON());
        });

        describe('DAPSInteraction', function () {

            let dapsClient;

            before('initialized daps client', function () {
                dapsClient = new DAPSClient({
                    SKIAKI:       aliceCerts.connector.meta.SKIAKI,
                    privateKey:   aliceCerts.connector.privateKey,
                    dapsUrl:      'https://nrd-daps.nicos-rd.com:8083/',
                    requestAgent: new https.Agent({
                        key:                aliceCerts.server.key,
                        cert:               aliceCerts.server.cert,
                        ca:                 aliceCerts.server.ca,
                        rejectUnauthorized: true
                    })
                });
            });

            test('captureDAT', async function () {
                const token = TestToken.from({
                    ecosystem:  'urn:tb:ec:ids',
                    testMethod: 'urn:tb:ec:ids:tm:DAPSInteraction:captureDAT',
                    param:      {
                        sub: aliceCerts.connector.meta.SKIAKI
                    }
                });

                const [dat] = await Promise.all([
                    dapsClient.fetchDat(),
                    ecIDS.launch(token)
                ]);

                expect(typeof dat).toBe('string');
                expect(token.result.token).toBe(dat);

                console.log(token.toJSON());
            });

        });

    });

    describe('tc', function () {

        describe('DAPSInteraction', function () {

            let dapsClient;

            before('initialized daps client', function () {
                dapsClient = new DAPSClient({
                    SKIAKI:       aliceCerts.connector.meta.SKIAKI,
                    privateKey:   aliceCerts.connector.privateKey,
                    dapsUrl:      'https://nrd-daps.nicos-rd.com:8083/',
                    requestAgent: new https.Agent({
                        key:                aliceCerts.server.key,
                        cert:               aliceCerts.server.cert,
                        ca:                 aliceCerts.server.ca,
                        rejectUnauthorized: true
                    })
                });
            });

            test('ReceiveDATfromDAPS', async function () {
                const token = TestToken.from({
                    ecosystem: 'urn:tb:ec:ids',
                    testCase:  'urn:tb:ec:ids:tc:DAPSInteraction:ReceiveDATfromDAPS',
                    param:     {
                        connector: {
                            clientId: aliceCerts.connector.meta.SKIAKI
                        }
                    }
                });

                const [dat] = await Promise.all([
                    dapsClient.fetchDat(),
                    ecIDS.launch(token)
                ]);

                expect(typeof dat).toBe('string');
                expect(token.validation.datReceived).toBe(true);
                expect(token.tokens[0].result.token).toBe(dat);

                console.log(token.toJSON());
            });

        });

    });

    describe('tp', function () {

    });

});
