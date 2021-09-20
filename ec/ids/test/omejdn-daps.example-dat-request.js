const
    DATAgent   = require('./omejdn-daps.example-dat-agent.js'),
    fetch      = require('node-fetch'),
    http       = require('http'),
    FormData   = require('form-data'),
    multiparty = require('multiparty'),
    url        = require('url'),
    crypto     = require('crypto'),
    path       = require('path'),
    fs         = require('fs/promises'),
    certs      = require('../resources/cert/index.js'),
    config     = {
        // daps_url: 'http://localhost:4567'
        daps_url: 'https://localhost:8081'
    };

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
            dapsUrl:                config.daps_url,
            subjectKeyIdentifier:   'DD:CB:FD:0B:93:84:33:01:11:EB:5D:94:94:88:BE:78:7D:57:FC:4A',
            authorityKeyIdentifier: 'keyid:CB:8C:C7:B6:85:79:A8:23:A6:CB:15:AB:17:50:2F:E6:65:43:5D:E8',
            clientPrivateKey:       privateKey
        });

    // console.log(await dat_agent.getAccessToken());

    const
        test_request  = {
            method:  'POST',
            agent:   dat_agent,
            headers: {
                'Content-Type': 'text/plain'
            },
            body:    'Hello World!'
        },
        test_response = await fetch('http://localhost:8080/test', test_request);

    console.log(`[${test_response.status}] ${test_response.statusText}`);
    // console.log(await test_response.text());
    // debugger;

    // const
    //     test_request = http.request('http://localhost:8080/test', {
    //         method:  'POST',
    //         agent:   dat_agent,
    //         headers: {
    //             'Content-Type': 'text/plain'
    //         }
    //     });
    //
    // test_request.write('Hello World!');
    // test_request.end();
    // test_request.on('socket', () => test_request.end());

})().catch(console.error);
