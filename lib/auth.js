const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');

// token is signed with RSA SHA256
// var cert = fs.readFileSync('private.key');  // get private key
const cert = "12piaspdfinpq293h[aosidfj[0q92u3[mpoaisdfja;oi3c;anjsdfn;lak sdf ;aslkdfsa";

function Auth(pool) {
  if(! (this instanceof Auth) ){
    return new Auth(pool);
  }
	this.pool = pool;
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
      const token = jwt.sign({ device_id: data['id'] }, cert);
      success(token);
    } else {
      failure('Authentication Failed');
    }
  });
  
}

module.exports = Auth;
