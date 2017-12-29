const fs = require('fs');
const {pool, pg} = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// token is signed with RSA SHA256
var cert = fs.readFileSync('private.key');  // get private key

const token = (req, res) => {
  if (!req.body || (!req.body['client_id'] || !req.body['client_secret'])) {
    return res.status(500, 'Server Error: No credential submitted');
  }
  const clientId = req.body['client_id'];
  const salt = bcrypt.genSaltSync(10);
  const clientSecretSaltyHash = bcrypt.hash(req.body['client_secret'], salt);
  const query = {
    text: `SELECT email, password
          FROM users
          WHERE email = $1
          AND password = $2`,
    values: [clientId, clientSecretSaltyHash]
  }
  pool.query(query)
  .then(data => {
    if (data.rows.length === 1) {
      console.log(data);
      const token = jwt.sign({ email: clientId }, cert, { algorithm: 'RS256'});
      return res.status(200).json({"token": token});
    }
    return res.status(401).send('Authentication Failed');
  })
  .catch(e => console.error(e.stack));
  
};

const register = (email, password) => {
  if (!req.body || (!req.body['client_id'] || !req.body['client_secret'])) {
    return res.status(500, 'Server Error: No credential submitted');
  }

  // insert into users(first_name, last_name, email, password) values
}

module.exports = {
  token: token,
  register: register
}
