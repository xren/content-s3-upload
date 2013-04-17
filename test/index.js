var request = require('supertest');
var app = require('../app');

describe('GET /', function () {
    it('responds with a page', function (done) {
        this.timeout(180000);

        request(app)
            .get('/')
            .expect(200, done);
    });
});


