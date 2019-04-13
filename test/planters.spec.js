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
