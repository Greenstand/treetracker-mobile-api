const routes = require('./routes');
const { Pool, Client } = require('pg');
const conn = require('./../config');
const pool = new Pool({
  connectionString: conn.connectionString
});
const api = routes(pool);

const expect = require('chai').expect


describe('The data functions', function () {
  it('finds trees', function (done) {
    api.trees(function(data) {
      expect(data.length).to.not.equal(0);
      done();  
    });
  });
});
