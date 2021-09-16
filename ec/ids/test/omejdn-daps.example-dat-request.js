const
    DATAgent   = require('./omejdn-daps.example-dat-agent.js'),
    fetch      = require('node-fetch'),
    FormData   = require('form-data'),
    multiparty = require('multiparty'),
    url        = require('url'),
    crypto     = require('crypto'),
    path       = require('path'),
    fs         = require('fs/promises'),
    certs      = require('../resources/cert/index.js');

(async function Main() {

    // NOTE use the setup.omejdn-daps script to add the client:
    // node ./setup.omejdn-daps.js add-client
    //   --privateKey ../../resources/cert/client.key
    //   --SKI DD:CB:FD:0B:93:84:33:01:11:EB:5D:94:94:88:BE:78:7D:57:FC:4A
    //   --AKI keyid:CB:8C:C7:B6:85:79:A8:23:A6:CB:15:AB:17:50:2F:E6:65:43:5D:E8
    //   --redirectUri http://localhost:8080

    const
        privateKey = crypto.createPrivateKey(certs.client.private),
        dat_agent  = new DATAgent({
            rejectUnauthorized:     false,
            dapsUrl:                'http://localhost:4567',
            subjectKeyIdentifier:   'DD:CB:FD:0B:93:84:33:01:11:EB:5D:94:94:88:BE:78:7D:57:FC:4A',
            authorityKeyIdentifier: 'keyid:CB:8C:C7:B6:85:79:A8:23:A6:CB:15:AB:17:50:2F:E6:65:43:5D:E8',
            clientPrivateKey:       privateKey
        }),
        dat        = await dat_agent.getAccessToken();

    // console.log(dat);

    const
        test_request  = {
            method:  'POST',
            agent:   dat_agent,
            headers: {
                'Content-Type': 'application/json'
            },
            body:    JSON.stringify({
                access_token: dat
            })
        },
        test_response = await fetch('http://localhost:8080/test', test_request);

    console.log(await test_response.text());
    // debugger;

    // const
    //     broker_request_url              = 'https://localhost:8443/infrastructure',
    //     broker_request                  = {
    //         agent:   unsecured_agent,
    //         method:  'POST',
    //         headers: {
    //             'Accept': 'multipart/mixed'
    //         },
    //         body:    new FormData()
    //     },
    //     broker_request_multipart_header = {
    //         '@context':            {
    //             'ids':  'https://w3id.org/idsa/core/',
    //             'idsc': 'https://w3id.org/idsa/code/',
    //             'xsd':  'http://www.w3.org/2001/XMLSchema#'
    //         },
    //         '@type':               'ids:DescriptionRequestMessage',
    //         '@id':                 'http://foo',
    //         'ids:issued':          {'@value': "3210-01-01T00:00:00Z", '@type': 'xsd:dateTimeStamp'},
    //         'ids:modelVersion':    'foo',
    //         'ids:senderAgent':     {'@id': "http://foo"},
    //         'ids:issuerConnector': {'@id': "http://foo"},
    //         'ids:securityToken':   {
    //             '@type':           'ids:DynamicAttributeToken',
    //             '@id':             'http://foo',
    //             'ids:tokenFormat': {
    //                 '@id': 'https://w3id.org/idsa/code/JWT'
    //             },
    //             'ids:tokenValue':  dat_result.access_token
    //         }
    //     };
    //
    // broker_request.body.append('header', JSON.stringify(broker_request_multipart_header));
    //
    // const
    //     broker_response      = await fetch(broker_request_url, broker_request),
    //     broker_result        = await new Promise((resolve, reject) => {
    //         const
    //             form   = new multiparty.Form({autoFields: true}),
    //             fields = {};
    //         form.on('field', (name, value) => fields[name] = value);
    //         form.on('error', reject);
    //         form.on('close', () => resolve(fields));
    //         form.parse(Object.assign(broker_response.body, {
    //             headers: Object.fromEntries(broker_response.headers.entries())
    //         }));
    //     }),
    //     broker_result_header = JSON.parse(broker_result.header);
    //
    // if (broker_result_header['@type'] === 'ids:RejectionMessage') {
    //     console.log('failure');
    //     // console.log(broker_result_header);
    // } else {
    //     const
    //         broker_result_payload = JSON.parse(broker_result.payload);
    //     console.log('success');
    //     // console.log(broker_result_payload);
    // }

})().catch(console.error);
