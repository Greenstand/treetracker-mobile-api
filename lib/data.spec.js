const dataModule = require('./data');
const { Pool, Client } = require('pg');
const conn = require('./../config');
const pool = new Pool({
  connectionString: conn.connectionString
});
const data = dataModule(pool);

const expect = require('chai').expect


describe('The data functions', function () {
  it('finds trees', function (done) {
    data.trees(function(data) {
      expect(data.length).to.not.equal(0);
      done();  
    });
  });

  it('finds trees for a user', function(done){
    data.treesForUser(1, function(data) {
      expect(data.length).to.not.equal(0);
      done();  
    });
  });

  it('creates a tree', function(done){
    data.createTree(1,
      {
        lat : 80,
        lon : 120,
        gps_accuracy : 1,
        note : 'my note',
        timestamp : 1536367800,
        image_url : 'http://www.myimage.org/'
      },
      function(data){
        expect(data.length).to.not.equal(0);
        done();
      });
  });

  it('creates a device', function(done){
    data.updateDevice(1, 
      {
        app_version: '1',
        app_build: 1,
        manufacturer: 'manufacturer',
        brand: 'brand',
        model: 'model',
        hardware: 'hardware',
        device: 'device',
        serial: 'serial'
      },
      function(data){
        expect(data.length).to.not.equal(0);
        done();
      });
  });
});
