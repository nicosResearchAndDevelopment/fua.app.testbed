const
    fetch      = require('node-fetch'),
    FormData   = require('form-data'),
    multiparty = require('multiparty'),
    https      = require('https'),
    url        = require('url');

(async function Main() {

    const
        unsecured_agent                 = new https.Agent({rejectUnauthorized: false}),
        dat_request_url                 = 'https://daps.aisec.fraunhofer.de/v2/token',
        dat_request                     = {
            agent:   unsecured_agent,
            method:  'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body:    new url.URLSearchParams({
                grant_type:            'client_credentials',
                client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                client_assertion:      'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiIxNzo3QjpFRDoxODo3MzpFQjpEMDo0Nzo1QzpDMzoyNTo0OTo0NzowNDozRDpBMjo4Qjo3Mjo4NjpCRjprZXlpZDpDQjo4QzpDNzpCNjo4NTo3OTpBODoyMzpBNjpDQjoxNTpBQjoxNzo1MDoyRjpFNjo2NTo0Mzo1RDpFOCIsInN1YiI6IjE3OjdCOkVEOjE4OjczOkVCOkQwOjQ3OjVDOkMzOjI1OjQ5OjQ3OjA0OjNEOkEyOjhCOjcyOjg2OkJGOmtleWlkOkNCOjhDOkM3OkI2Ojg1Ojc5OkE4OjIzOkE2OkNCOjE1OkFCOjE3OjUwOjJGOkU2OjY1OjQzOjVEOkU4IiwiQGNvbnRleHQiOiJodHRwczovL3czaWQub3JnL2lkc2EvY29udGV4dHMvY29udGV4dC5qc29ubGQiLCJAdHlwZSI6ImlkczpEYXRSZXF1ZXN0VG9rZW4iLCJleHAiOjE2NTE4NDczOTcsImlhdCI6MTYyMDMxMTM5NywiYXVkIjoiaWRzYzpJRFNfQ09OTkVDVE9SU19BTEwiLCJuYmYiOjE2MjAzMTEzOTd9.dnk6tD-xj-cFxfNxVxrVf7SQ0oD0N4P5TPfrlc4sZ9Tj9Je2dWtcXhQ9t8kDo5OKouQc0vymuoSH4UeHpPdGp0SzB-BWhxTAgIFfXgb7QxBm9LktKG8RIKSHfqSEQc-YBGxyRoKmmcgTBkK4EMhb1jIYJSox2z-FUyWRbFe9VNkk6vV-gluKnEbgX9RNhUe3r2pkSeoa1jPchdBme5qDPa7xWOMSB9Cl_GeSYeWRN7EPI6Qj2iOoFs_mpsVKETI8tU5Ey6TyIujdAyVp1uWqd8ez7B7S6nMqnKN8RM9xS4bMc8ylZjyCWwbUnR4klK1H33rXnepyAyxjd65ZQwGATw',
                scope:                 'idsc:IDS_CONNECTOR_ATTRIBUTES_ALL'
            })
        },
        dat_response                    = await fetch(dat_request_url, dat_request),
        dat_result                      = await dat_response.json(),
        broker_request_url              = 'https://localhost:8443/infrastructure',
        broker_request                  = {
            agent:   unsecured_agent,
            method:  'POST',
            headers: {
                'Accept': 'multipart/mixed'
            },
            body:    new FormData()
        },
        broker_request_multipart_header = {
            '@context':            {
                'ids':  'https://w3id.org/idsa/core/',
                'idsc': 'https://w3id.org/idsa/code/',
                'xsd':  'http://www.w3.org/2001/XMLSchema#'
            },
            '@type':               'ids:DescriptionRequestMessage',
            '@id':                 'http://foo',
            'ids:issued':          {'@value': "3210-01-01T00:00:00Z", '@type': 'xsd:dateTimeStamp'},
            'ids:modelVersion':    'foo',
            'ids:senderAgent':     {'@id': "http://foo"},
            'ids:issuerConnector': {'@id': "http://foo"},
            'ids:securityToken':   {
                '@type':           'ids:DynamicAttributeToken',
                '@id':             'http://foo',
                'ids:tokenFormat': {
                    '@id': 'https://w3id.org/idsa/code/JWT'
                },
                'ids:tokenValue':  dat_result.access_token
            }
        };

    broker_request.body.append('header', JSON.stringify(broker_request_multipart_header));

    const
        broker_response      = await fetch(broker_request_url, broker_request),
        broker_result        = await new Promise((resolve, reject) => {
            const
                form   = new multiparty.Form({autoFields: true}),
                fields = {};
            form.on('field', (name, value) => fields[name] = value);
            form.on('error', reject);
            form.on('close', () => resolve(fields));
            form.parse(Object.assign(broker_response.body, {
                headers: Object.fromEntries(broker_response.headers.entries())
            }));
        }),
        broker_result_header = JSON.parse(broker_result.header);

    if (broker_result_header['@type'] === 'ids:RejectionMessage') {
        console.log('failure');
        // console.log(broker_result_header);
    } else {
        const
            broker_result_payload = JSON.parse(broker_result.payload);
        console.log('success');
        // console.log(broker_result_payload);
    }

})().catch(console.error);
