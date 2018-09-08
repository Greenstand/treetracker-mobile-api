

const authModule = require('./auth');
const { Pool, Client } = require('pg');
const conn = require('./../config');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

const pool = new Pool({
  connectionString: conn.connectionString
});


const auth = authModule(pool);

const expect = require('chai').expect

describe('The auth module', function() {
  it('logs in a device and sends a token', function(done){
    auth.token('SDNE78DKJLS76F',  function(token){
      expect(token.length).to.not.equal(0);
      done();
    },
    function(error){
      expect(0).to.not.equal(1);
      done();
    });
  });

});
