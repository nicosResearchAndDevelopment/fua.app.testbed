const
    {describe, test, before, after} = require('mocha'),
    GET                             = require('./ts.http.test.GET.js');

describe('HTTP', function () {

    this.timeout(0);

    describe('GET', function () {

        test(
            `should successfully 'GET' to www.google.com`,
            () => GET.successful({
                'timeout':  -1,
                'endpoint': 'https://www.google.com'
            })
        ); // test

        test(
            `should not successfully 'GET' to www.google-marzipan.com`,
            () => GET.unsuccessful({
                'timeout':  -1,
                'endpoint': 'https://www.google-marzipan.com'
            })
        ); // test

    }); // describe('GET)

}); // describe('HTTP')