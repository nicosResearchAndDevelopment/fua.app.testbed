#!/usr/bin/env node

const
    config         = require('../config/config.testbed.js'),
    {URL}          = require('url'),
    https          = require('https'),
    fetch          = require('node-fetch'),
    aboutURL       = new URL('/about', `${config.server.schema}://${config.server.hostname}:${config.server.port}`),
    requestOptions = {
        method:  'GET',
        headers: {
            'Accept': 'application/ld+json'
        },
        agent:   new https.Agent({
            rejectUnauthorized: false
        })
    };

(async function healthcheck() {
    const response = await fetch(aboutURL, requestOptions);
    if (!response.ok) throw new Error(`[${response.status}] ${response.statusText}`);
    const about = await response.json();
    if (!about.issuer) throw new Error(`no issuer specified`);
})().then(function healthy() {
    console.log('healthcheck passed');
    process.exit(0);
}).catch(function unhealthy(err) {
    console.error(err?.stack ?? err);
    process.exit(1);
});
