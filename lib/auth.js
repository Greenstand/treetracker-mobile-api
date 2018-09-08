const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');


function Auth(pool, certificate) {
  if(! (this instanceof Auth) ){
    return new Auth(pool, certificate);
  }
  this.pool = pool;
  this.certificate = certificate;
}


Auth.prototype.token = function(deviceAndroidId, success, failure) {

  const query = {
    text: 'SELECT * FROM devices WHERE android_id = $1',
    values: [deviceAndroidId]
  }

  this.pool.query(query)
  .then(data => {
    if(data.rows.length == 0){
      const query = {
        text: `INSERT INTO devices 
        (android_id)
        VALUES
        ($1) RETURNING *`,
        values: [deviceAndroidId],
      }
      this.pool.query(query).then( data => {
        this.token(deviceAndroidId, success, failure);
      });
    }

    if (data.rows.length == 1) {
      console.log(data.rows[0]);
      row = data.rows[0]
      payload = { device_id: row['id'] };
      console.log(payload);
      const token = jwt.sign(payload, this.certificate);
      success(token);
    } else {
      failure('Authentication Failed');
    }
  });
  
}

module.exports = Auth;
