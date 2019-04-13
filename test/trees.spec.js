let authToken;

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
