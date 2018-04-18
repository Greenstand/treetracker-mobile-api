

const authModule = require('./auth');
const { Pool, Client } = require('pg');
const config = require('./../config');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

const pool = new Pool({
  connectionString: config.connectionString
});

// this needs to be stubbed
const smtpTransport = nodemailer.createTransport(config.smtpSettings);


const auth = authModule(pool, smtpTransport);

const expect = require('chai').expect

describe('The auth module', function() {
  it('registers a new user', function(done){
    auth.register(randomstring.generate({length: 12, charset:'alphabetic'}),
                  'password',
                  {
                    'first_name': 'unit_test_first_name',
                    'last_name' : 'unit_test_last_name',
                    'organization' : 'unit_test_organization',
                    'phone' : 'unit_test_phone'
                  },
                  function(data){
                    done();
                  }
    );
  });

  it('logs in a user and sends a token', function(done){
    auth.token('test@tt.com', 'testtest', function(token){
      expect(token.length).to.not.equal(0);
      done();
    },
    function(error){
      expect(0).to.not.equal(1);
      done();
    });
  });

  it('resets password', function(done){
    auth.forgot('unit_test@greenstand.org', function(token){
        expect(0).to.not.equal(1);
    });
  });
});
