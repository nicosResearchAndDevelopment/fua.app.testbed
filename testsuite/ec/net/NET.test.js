const
    {describe, test, before, after} = require('mocha'),
    ping                            = require('./tests.ping.js');

describe('NET', function () {

    this.timeout(0);

    describe('ping', function () {

        test(
            'should successfully ping to www.google.com',
            () => ping.successful({
                address: 'www.google.com'
            })
        ); // test

        test(
            'should not successfully ping to www.google-marzipan.com',
            () => ping.unsuccessful({
                address: 'www.google-marzipan.com'
            })
        ); // test

    }); // describe

}); // describe