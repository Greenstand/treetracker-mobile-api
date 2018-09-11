const dataModule = require('./data');
const { Pool, Client } = require('pg');
const conn = require('./../config');
const pool = new Pool({
  connectionString: conn.connectionString
});
const data = dataModule(pool);

const expect = require('chai').expect
const uuidv1 = require('uuid/v1');



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

  it('creates a user', function(done){
    data.findOrCreateUser(uuidv1().substring(0,30), function(data){
      expect(data.length).to.not.equal(0);
      done();  
    });
  });

  it('creates a user with phone number', function(done){
    data.findOrCreateUser('1234567654', function(data){ // TODO: wipe testing database
      expect(data.length).to.not.equal(0);
      done();  
    });
  });

  it('finds a user', function(done){
    data.findOrCreateUser('085739203636', function(data){
      expect(data.length).to.not.equal(0);
      done();  
    });
  });


  it('creates a tree', function(done){
    data.createTree(
        1,
        1,
      {
        lat : 80,
        lon : 120,
        gps_accuracy : 1,
        note : 'my note',
        timestamp : 1536367800,
        image_url : 'http://www.myimage.org/',
        sequence_id : 1
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
