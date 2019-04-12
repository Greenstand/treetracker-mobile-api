describe('Trees Endpoints', () => {
  describe('GET /trees', () => {
    it('should return a list of trees', (done) => {
      request.get('/trees')
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
        }, done);
    });
  });

  describe('GET /trees/details/user', (done) => {
    request.get('/trees/details/user')
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
      }, done);
  });

  describe('POST /trees/create', (done) => {
    request.post('/trees/create')
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
      }, done)
  });

});
