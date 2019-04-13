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
          expect(res.trees).to.not.equal(0);
        }, done);
    });
  });

  describe('GET /trees/details/user', (done) => {
    request.get('/trees/details/user')
      .auth('Authorization', `bearer ${authToken}`)
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        expect(res.user).to.not.equal(0);
      }, done);
  });

  describe('POST /trees/create', (done) => {
    request.post('/trees/create')
      .auth('Authorization', `bearer ${authToken}`)
      .send({ uuid: 'asdf-asdf-asdf' })
      .expect(201)
      .end((err, res) => {
        if (err) throw err;
        expect(res.data).to.not.equal(0);
      }, done)
  });
});
