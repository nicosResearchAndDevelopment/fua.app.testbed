const
    {describe, test, before, after} = require('mocha'),
    getDATfromDAPS                  = require('./getDATfromDAPS.js');

describe('IDS', function () {

    this.timeout(0);

    test('getDATfromDAPS', () => getDATfromDAPS({
        timeout:       180,
        daps_endpoint: 'http://localhost:8080/'
    }));

});