const routes = require('./data');
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

  it('finds trees for a user', function(done){
    api.treesForUser(1, function(data) {
      expect(data.length).to.not.equal(0);
      done();  
    });
  });

  it('creates a tree', function(done){
    api.createTree(1,
      {
        lat : 80,
        lon : 120,
        gps_accuracy : 1,
        note : 'my note',
        timestamp : null,
        image_url : 'http://www.myimage.org/'
      },
      function(data){
        expect(data.length).to.not.equal(0);
        done();
      });
  });
});
