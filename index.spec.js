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
        console.log('planters/registration - sending token:');
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
          .send({
            deviceId: 'SDNE78DKJLS76F'
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

  describe('Trees Endpoints', () => {

    describe('GET /trees', () => {
      it('should return a list of trees', (done) => {
        request.get('/trees')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            expect(res.rows).to.not.equal(0);
            done();
          });
      });

      it('should not return an active property of false', (done) => {
        request.get('/trees')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            res.body.forEach(x => expect(x.active).to.not.equal(false));
            done();
          })
      });

    });

    describe('GET /trees/details/user', () => {
      it('should return detailed information about the user', (done) => {
        request.get('/trees/details/user')
          .send({ userId: 'asdf-asdf-asdf' })
          .set('Authorization', `Bearer ${authToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            expect(res.rows).to.not.equal(0);
            done();
          });
      });

      it('should not return an active property of false', (done) => {
        request.get('/trees/details/user')
          .send({ userId: 'asdf-asdf-asdf' })
          .set('Authorization', `Bearer ${authToken}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            res.body.forEach((x) => expect(x.active).to.not.equal(false));
            done();
          });
      });
    });

    describe('POST /trees/create', () => {
      it('should record a new tree', (done) => {
        request.post('/trees/create')
          .send({
            planter_identifier: 'asdf-asdf-asdf',
            lat: 80,
            lon: 120,
            gps_accuracy: 1,
            note: 'my note',
            timestamp: 1536367800,
            image_url: 'http://www.myimage.org/',
            sequence_id: 1,
            uuid: uuid()
          })
          .set('Authorization', `Bearer ${authToken}`)
          .set('Accept', 'application/json')
          .expect(201)
          .end((err, res) => {
            if (err) throw done(err);
            expect(res.rows).to.not.equal(0);
            done();
          });
      });

      it('should not record a duplicate new tree', (done) => {
        const treeUuid = uuid();
        const treeData = {
          planter_identifier: 'asdf-asdf-asdf',
          lat: 80,
          lon: 120,
          gps_accuracy: 1,
          note: 'my note',
          timestamp: 1536367800,
          image_url: 'http://www.myimage.org/',
          uuid: treeUuid
        };
        request.post('/trees/create')
          .send(treeData)
          .set('Authorization', `Bearer ${authToken}`)
          .set('Accept', 'application/json')
          .end((err, res) => {

          request.post('/trees/create')
            .send(treeData)
            .set('Authorization', `Bearer ${authToken}`)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {

              if (err) throw done(err);
              expect(res.rows).to.not.equal(0);
              done();

            });
          });
      });

      it('should allow a missing UUID for backwards compatibility', (done) => {
        request.post('/trees/create')
          .send({
            planter_identifier: 'asdf-asdf-asdf',
            lat: 80,
            lon: 120,
            gps_accuracy: 1,
            note: 'my note',
            timestamp: 1536367800,
            image_url: 'http://www.myimage.org/',
            sequence_id: 1
          })
          .set('Authorization', `Bearer ${authToken}`)
          .set('Accept', 'application/json')
          .expect(201)
          .end((err, res) => {
            if (err) throw done(err);
            expect(res.rows).to.not.equal(0);
            done();
          });
      });

      it('should allow a null UUID for backwards compatibility', (done) => {
        request.post('/trees/create')
          .send({
            planter_identifier: 'asdf-asdf-asdf',
            lat: 80,
            lon: 120,
            gps_accuracy: 1,
            note: 'my note',
            timestamp: 1536367800,
            image_url: 'http://www.myimage.org/',
            sequence_id: 1,
            uuid: null
          })
          .set('Authorization', `Bearer ${authToken}`)
          .set('Accept', 'application/json')
          .expect(201)
          .end((err, res) => {
            if (err) throw done(err);
            expect(res.rows).to.not.equal(0);
            done();
          });
      });

      it('should allow an empty UUID for backwards compatibility', (done) => {
        request.post('/trees/create')
          .send({
            planter_identifier: 'asdf-asdf-asdf',
            lat: 80,
            lon: 120,
            gps_accuracy: 1,
            note: 'my note',
            timestamp: 1536367800,
            image_url: 'http://www.myimage.org/',
            sequence_id: 1,
            uuid: ""
          })
          .set('Authorization', `Bearer ${authToken}`)
          .set('Accept', 'application/json')
          .expect(201)
          .end((err, res) => {
            if (err) throw done(err);
            expect(res.rows).to.not.equal(0);
            done();
          });
      });
    });


  });

});
