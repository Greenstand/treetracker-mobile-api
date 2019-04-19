const supertest = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const uuid = require('uuid');

const app = require('./index.js');
const request = supertest(app);


var authToken = 'hello';

describe('API', () => {
  before((done) => {
    // Get Auth Token to test endpoints
    request.post('/auth/token')
      .send({ "device_android_id": "SDNE78DKJLS76F", 
        "client_id" : "9995c56e-0192-4ba2-b91e-d77fb14ec887",
        "client_secret" : "096c03d5-6cb3-4fc7-90dc-883ecec90b84" 
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        authToken = res.body.token;
        done();
      });
  });

  after(() => {
    //app.close(); // so that mocha will exit  
    //this only works when app = server.app.listen()
  });

  describe('Planters Endpoints', () => {
   
    describe('POST /planter/registration', () => {
      it('should register a planter', (done) => {
        console.log('sending token:');
        console.log(authToken);
        request.post('/planters/registration')
          .send({
            planter_identifier: 'asdf-asdf-asdf',
            first_name: 'George Washington',
            last_name: 'Carver',
            organization: 'NAACP'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            expect(res.data).to.not.equal(0);
            done();
          });
      });
    });
  });

  describe('Devices Endpoints', () => {

    describe('PUT /devices/', () => {
      it('should add device to the list of devices', (done) => {
        request.put('/devices/')
          .auth('Authorization', `bearer ${authToken}`)
          .send({ device_id: 'SDNE78DKJLS76F' })
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            expect(res.data).to.not.equal(0);
          }, done);
      });
    });
  });

  describe('Trees Endpoints', () => {

    describe('GET /trees', () => {
      it('should return a list of trees', (done) => {
        request.get('/trees')
          .auth('Authorization', `bearer ${authToken}`)
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            expect(res.rows).to.not.equal(0);
          }, done);
      });

      it('should not return an active property of false', (done) => {
        request.get('/trees')
          .auth('Authorization', `bearer ${authToken}`)
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            res.rows.forEach(x => expect(x.active).to.not.equal(false));
          }, done)
      });
    });

    describe('GET /trees/details/user', () => {
      it('should return detailed information about the user', (done) => {
        request.get('/trees/details/user')
          .auth('Authorization', `bearer ${authToken}`)
          .send({ userId: 'asdf-asdf-asdf' })
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            expect(res.rows).to.not.equal(0);
          }, done);
      });

      it('should not return an active property of false', (done) => {
        request.get('/trees/details/user')
          .auth('Authorization', `bearer ${authToken}`)
          .send({ userId: 'asdf-asdf-asdf' })
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            res.rows.forEach((x) => expect(x.active).to.not.equal(false));
          });
      });
    });

    describe('POST /trees/create', () => {
      it('should record a new tree', (done) => {
        request.post('/trees/create')
          .auth('Authorization', `bearer ${authToken}`)
          .send({ uuid: 'asdf-asdf-asdf' })
          .set('Accept', 'application/json')
          .expect(201)
          .end((err, res) => {
            if (err) throw err;
            expect(res.data).to.not.equal(0);
          }, done);
      });
    });
  });

});

