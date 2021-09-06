const
    {describe, test, before} = require('mocha'),
    expect                   = require('expect'),
    path                     = require('path'),
    fs                       = require('fs/promises'),
    fetch                    = require('node-fetch'),
    https                    = require('https');

describe('ec/ids/metadata-broker', function () {

    this.timeout(10e3);

    let agent;
    before('create a https agent with tls that does not reject self signed certificates', async function () {
        agent = new https.Agent({rejectUnauthorized: false});
    });

    test('the "metadata-broker" directory should exist', async function () {
        const stats = await fs.stat(path.join(__dirname, '../metadata-broker'));
        expect(stats.isDirectory()).toBeTruthy();
    });

    test('the API should be accessible on port 8443', async function () {
        await fetch('https://localhost:8443', {agent});
    });

    test('the self-description should be available at /', async function () {
        const
            response = await fetch('https://localhost:8443/', {agent}),
            about    = await response.json();

        expect(about).toMatchObject({
            "@context": {
                "ids": "https://w3id.org/idsa/core/"
            },
            "@type":    "ids:Broker",
            "@id":      "https://localhost/"
        });
    });

});
