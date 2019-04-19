const supertest = require('supertest');
const chai = require('chai');
const uuid = require('uuid');

const app = require('./index.js');
const request = supertest(app);


let authToken;

describe('Planters Endpoints', () => {
  beforeEach(() => {
    // Get Auth Token to test endpoints
    request.post('/auth/token')
      .send({ "device_android_id": "SDNE78DKJLS76F" })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        authToken = res.token;
      });
  });

  describe('POST /planter/registration', () => {
    it('should register a planter', (done) => {
      request.post('/planters/registration')
        .auth('Authorization', `bearer ${authToken}`)
        .send({
          planter_identifier: 'asdf-asdf-asdf',
          first_name: 'George Washington',
          last_name: 'Carver',
          organization: 'NAACP'
        })
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.data).to.not.equal(0);
        }, done);
    });
  });
});

describe('Devices Endpoints', () => {
  beforeEach(() => {
    // Get Auth Token to test endpoints
    request.post('/auth/token')
      .send({ "device_android_id": "SDNE78DKJLS76F" })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        authToken = res.token;
      });
  });

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
  beforeEach(() => {
    // Get Auth Token to test endpoints
    request.post('/auth/token')
      .send({ "device_android_id": "SDNE78DKJLS76F" })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        authToken = res.token;
      });
  })

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

