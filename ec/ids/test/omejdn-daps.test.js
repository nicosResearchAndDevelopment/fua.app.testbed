const
    {describe, test, before} = require('mocha'),
    expect                   = require('expect'),
    path                     = require('path'),
    fs                       = require('fs/promises'),
    fetch                    = require('node-fetch'),
    http                     = require('http');

describe('ec/ids/omejdn-daps', function () {

    this.timeout(10e3);

    let agent;
    before('create a http agent without tls', async function () {
        agent = new http.Agent();
    });

    test('the "omejdn-daps" directory should exist', async function () {
        const stats = await fs.stat(path.join(__dirname, '../omejdn-daps'));
        expect(stats.isDirectory()).toBeTruthy();
    });

    test('the API should be accessible on port 4567', async function () {
        await fetch('http://localhost:4567', {agent});
    });

    test('the self-description should be available at /about', async function () {
        const
            response = await fetch('http://localhost:4567/about', {agent}),
            about    = await response.json();

        expect(about).toMatchObject({
            "version": "0.0.2",
            "license": "Apache2.0"
        });
    });

    test('the jwks should be available at /.well-known/jwks.json', async function () {
        const
            response = await fetch('http://localhost:4567/.well-known/jwks.json', {agent}),
            jwks     = await response.json();

        expect(jwks).toMatchObject({
            "keys": [{
                "kid": "default"
            }]
        });
    });

    test('the testClient should be able to retrieve a jwt at /token');

});
