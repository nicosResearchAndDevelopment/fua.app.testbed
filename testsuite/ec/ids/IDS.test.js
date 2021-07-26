const
    {describe, test, before, after} = require('mocha'),
    getDATfromDAPS                  = require('./test.getDATfromDAPS.js');

describe('IDS', function () {

    this.timeout(0);

    describe('getDATfromDAPS', function () {

        test(
            'basic test',
            () => getDATfromDAPS.basic({
                timeout:       180,
                daps_endpoint: 'http://localhost:8080/'
            })
        ); // test

    }); // describe

});