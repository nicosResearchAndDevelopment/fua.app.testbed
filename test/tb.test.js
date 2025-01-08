const
  { describe, test, before } = require('mocha'),
  expect = require('expect'),
  errors = require('@fua/core.errors'),
  DAPSClient = require('@fua/client.daps'),
  alice = require('./alice/index.js');

describe('fua.app.testbed', function () {

  test('develop', async function () {
    // TODO
  });

  describe.skip('metadata-broker', function () {

    this.timeout('10s');

    const dapsUrl = 'https://daps.tb.nicos-rd.com/';
    let dapsClient = null;
    let aliceDat = '';
    const brokerUrl = 'https://mdb.tb.nicos-rd.com/';

    before('request a valid dat', async function () {
      dapsClient = new DAPSClient({
        dapsUrl: dapsUrl,
        SKIAKI: alice.client.meta.SKIAKI,
        privateKey: alice.client.privateKey
      });
      aliceDat = await dapsClient.getDat();
      await dapsClient.validateDat(aliceDat);
    });

    test('GET / for the self-description', async function () {
      const response = await fetch(new URL('/', brokerUrl), {
        method: 'GET'
      });
      if (!response.ok) throw new errors.http.ResponseError(response);
      const data = await response.json();
      console.log(data);
    });

    test('GET /connectors/', async function () {
      const response = await fetch(new URL('/connectors/', brokerUrl), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${aliceDat}`
        }
      });
      if (!response.ok) throw new errors.http.ResponseError(response);
      const data = await response.json();
      console.log(data);
    });

    test('GET /catalog/', async function () {
      const response = await fetch(new URL('/catalog/', brokerUrl), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${aliceDat}`
        }
      });
      if (!response.ok) throw new errors.http.ResponseError(response);
      const data = await response.json();
      console.log(data);
    });

    test('POST /infrastructure/', async function () {
      const response = await fetch(new URL('/infrastructure/', brokerUrl), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aliceDat}`
        }
      });
      if (!response.ok) throw new errors.http.ResponseError(response);
      const data = await response.json();
      console.log(data);
    });

  });

});
