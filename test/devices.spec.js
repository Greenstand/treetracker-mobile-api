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
