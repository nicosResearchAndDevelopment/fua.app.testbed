const
    {describe, test, before} = require('mocha'),
    expect                   = require('expect'),
    path                     = require('path'),
    fs                       = require('fs/promises'),
    fetch                    = require('node-fetch'),
    FormData                 = require('form-data'),
    multiparty               = require('multiparty'),
    https                    = require('https'),
    {URLSearchParams}        = require('url');

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
            url      = 'https://localhost:8443/',
            response = await fetch(url, {agent}),
            about    = await response.json();

        expect(about).toMatchObject({
            "@context": {
                "ids": "https://w3id.org/idsa/core/"
            },
            "@type":    "ids:Broker",
            "@id":      "https://localhost/"
        });
    });

    test('the self-description should be retrievable with a post request at /infrastructure', async function () {
        const
            dat_url      = 'https://daps.aisec.fraunhofer.de/v2/token',
            dat_request  = {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body:    new URLSearchParams({
                    grant_type:            'client_credentials',
                    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                    client_assertion:      'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiIxNzo3QjpFRDoxODo3MzpFQjpEMDo0Nzo1QzpDMzoyNTo0OTo0NzowNDozRDpBMjo4Qjo3Mjo4NjpCRjprZXlpZDpDQjo4QzpDNzpCNjo4NTo3OTpBODoyMzpBNjpDQjoxNTpBQjoxNzo1MDoyRjpFNjo2NTo0Mzo1RDpFOCIsInN1YiI6IjE3OjdCOkVEOjE4OjczOkVCOkQwOjQ3OjVDOkMzOjI1OjQ5OjQ3OjA0OjNEOkEyOjhCOjcyOjg2OkJGOmtleWlkOkNCOjhDOkM3OkI2Ojg1Ojc5OkE4OjIzOkE2OkNCOjE1OkFCOjE3OjUwOjJGOkU2OjY1OjQzOjVEOkU4IiwiQGNvbnRleHQiOiJodHRwczovL3czaWQub3JnL2lkc2EvY29udGV4dHMvY29udGV4dC5qc29ubGQiLCJAdHlwZSI6ImlkczpEYXRSZXF1ZXN0VG9rZW4iLCJleHAiOjE2NTE4NDczOTcsImlhdCI6MTYyMDMxMTM5NywiYXVkIjoiaWRzYzpJRFNfQ09OTkVDVE9SU19BTEwiLCJuYmYiOjE2MjAzMTEzOTd9.dnk6tD-xj-cFxfNxVxrVf7SQ0oD0N4P5TPfrlc4sZ9Tj9Je2dWtcXhQ9t8kDo5OKouQc0vymuoSH4UeHpPdGp0SzB-BWhxTAgIFfXgb7QxBm9LktKG8RIKSHfqSEQc-YBGxyRoKmmcgTBkK4EMhb1jIYJSox2z-FUyWRbFe9VNkk6vV-gluKnEbgX9RNhUe3r2pkSeoa1jPchdBme5qDPa7xWOMSB9Cl_GeSYeWRN7EPI6Qj2iOoFs_mpsVKETI8tU5Ey6TyIujdAyVp1uWqd8ez7B7S6nMqnKN8RM9xS4bMc8ylZjyCWwbUnR4klK1H33rXnepyAyxjd65ZQwGATw',
                    scope:                 'idsc:IDS_CONNECTOR_ATTRIBUTES_ALL'
                }),
                agent
            },
            dat_response = await fetch(dat_url, dat_request),
            dat_result   = await dat_response.json(),
            // dat        = 'eyJ0eXAiOiJKV1QiLCJraWQiOiJkZWZhdWx0IiwiYWxnIjoiUlMyNTYifQ.eyJzY29wZXMiOltdLCJhdWQiOiJpZHNjOklEU19DT05ORUNUT1JTX0FMTCIsImlzcyI6Imh0dHBzOi8vZGFwcy5haXNlYy5mcmF1bmhvZmVyLmRlIiwic3ViIjoiMTc6N0I6RUQ6MTg6NzM6RUI6RDA6NDc6NUM6QzM6MjU6NDk6NDc6MDQ6M0Q6QTI6OEI6NzI6ODY6QkY6a2V5aWQ6Q0I6OEM6Qzc6QjY6ODU6Nzk6QTg6MjM6QTY6Q0I6MTU6QUI6MTc6NTA6MkY6RTY6NjU6NDM6NUQ6RTgiLCJuYmYiOjE2MDEwMTY3ODQsImlhdCI6MTYwMTAxNjc4NCwianRpIjoiTVRrNE9UWTFOVGt5TmpFNU5qVXhOelkyTWc9PSIsImV4cCI6MTYwMTAyMDM4NH0.i2vaw7HCuPES5aT5hnvyq88mnXA-zihpfBf5foeJR35aZ8PA-eiTg70Po3vWIHI_OPDZpFvE5aKKHSYZNuzunogCM146jQpAa9_kdnnbwl08-k6v9Z2aAoMlg3Rm8WG5pS5dZPOz_4iClZU1KKNDTkEcoGtCPpIeG-_SAMUPGirWjYPX3vamqlTn-JtuzRyXypDnwIqAw00qudOFrQ0qEZQoKFBaSd_lIrO3sr29vY4h87QQ9uducLAgaxe8etpzYMsBWEeZEciwJ5d1i-spateHAniM_y9vnRAwRKJ9APVSqU80uHA0DWASQwzaGkLd7HCJ3yTEAB1TZZO-SOLXPg',
            dat          = dat_result.access_token;

        // console.log(dat_result);
        // debugger;

        const
            url        = 'https://localhost:8443/infrastructure',
            method     = 'post',
            headers    = {
                'Accept': 'multipart/mixed'
            },
            body       = new FormData(),
            bodyHeader = {
                "@context":            {
                    "ids":  "https://w3id.org/idsa/core/",
                    "idsc": "https://w3id.org/idsa/code/",
                    "xsd":  "http://www.w3.org/2001/XMLSchema#"
                },
                "@type":               "ids:DescriptionRequestMessage",
                "@id":                 "http://industrialdataspace.org/1a421b8c-3407-44a8-aeb9-253f145c869a",
                "ids:issued":          {"@value": new Date().toISOString(), "@type": "xsd:dateTimeStamp"},
                "ids:modelVersion":    "4.0.0",
                "ids:senderAgent":     {"@id": "https://localhost/agent"},
                "ids:issuerConnector": {"@id": "https://localhost/59a68243"},
                "ids:securityToken":   {
                    "@type":           "ids:DynamicAttributeToken",
                    "@id":             "https://w3id.org/idsa/autogen/dynamicAttributeToken/2bd53efc-5995-d75590476820",
                    "ids:tokenFormat": {
                        "@id": "https://w3id.org/idsa/code/JWT"
                    },
                    "ids:tokenValue":  dat
                }
            };

        body.append('header', JSON.stringify(bodyHeader));

        const
            response     = await fetch(url, {method, headers, body, agent}),
            result       = await new Promise((resolve, reject) => {
                const
                    form   = new multiparty.Form({autoFields: true}),
                    fields = {};
                form.on('field', (name, value) => fields[name] = value);
                form.on('error', reject);
                form.on('close', () => resolve(fields));
                form.parse(Object.assign(response.body, {
                    headers: Object.fromEntries(response.headers.entries())
                }));
            }),
            resultHeader = JSON.parse(result.header);

        // console.log(resultHeader);
        expect(resultHeader['@type']).not.toBe('ids:RejectionMessage');

        const about = JSON.parse(result.payload);
        // console.log(about);
        expect(about).toMatchObject({
            "@context": {
                "ids": "https://w3id.org/idsa/core/"
            },
            "@type":    "ids:Broker",
            "@id":      "https://localhost/"
        });
    });

});
