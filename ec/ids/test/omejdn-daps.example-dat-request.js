const
    DATAgent          = require('./omejdn-daps.example-dat-agent.js'),
    fetch             = require('node-fetch'),
    FormData          = require('form-data'),
    multiparty        = require('multiparty'),
    https             = require('https'),
    url               = require('url'),
    {generateKeyPair} = require('jose/util/generate_key_pair');

(async function Main() {

    const
        {publicKey, privateKey} = await generateKeyPair('RS256'),
        dat_agent               = new DATAgent({
            rejectUnauthorized:     false,
            dapsUrl:                'https://daps.aisec.fraunhofer.de/v2/token',
            subjectKeyIdentifier:   '17:7B:ED:18:73:EB:D0:47:5C:C3:25:49:47:04:3D:A2:8B:72:86:BF',
            authorityKeyIdentifier: 'keyid:CB:8C:C7:B6:85:79:A8:23:A6:CB:15:AB:17:50:2F:E6:65:43:5D:E8',
            clientPrivateKey:       privateKey
        }),
        dat                     = await dat_agent.getAccessToken();

    console.log(dat);

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
