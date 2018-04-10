const express = require('express');
const bearerToken = require('express-bearer-token');
const bodyParser = require('body-parser');
const http = require('http');
const pg = require('pg');
const { Pool, Client } = require('pg');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const conn = require('./config');

const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");
// token is signed with RSA SHA256
// var cert = fs.readFileSync('private.key');  // get private key
var cert = "12piaspdfinpq293h[aosidfj[0q92u3[mpoaisdfja;oi3c;anjsdfn;lak sdf ;aslkdfsa";

app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.set('view engine','html');

const pool = new Pool({
  connectionString: conn.connectionString
});

pool.on('connect', (client) => {
  //console.log("connected", client);
})

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        
        user: "",
        pass: ""
    }
});

const token = (req, res) => {
  console.log(req.body);
  if (!req.body || (!req.body['client_id'] || !req.body['client_secret'])) {
    res.status(500).send('Server Error: No credential submitted');
    res.end();
    return;
  }
  const clientId = req.body['client_id'];
  const query = {
    text: `SELECT salt 
    FROM users
    WHERE email = $1`,
    values: [clientId]
  }

  pool.query(query)
  .then(data => {
    const salt = data.rows[0].salt;
    const clientSecretSaltyHash = bcrypt.hashSync(req.body['client_secret'], salt);
    const query = {
      text: `SELECT email
      FROM users
      WHERE email = $1
      AND password = $2`,
      values: [clientId, clientSecretSaltyHash]
    }
    pool.query(query)
      .then(data => {
        if (data.rows.length === 1) {
          console.log(data);
          const token = createToken(clientId);
          return res.status(200).json({"token": token});
        }
        return res.status(401).send('Authentication Failed');
      })
      .catch(e => console.error(e.stack));

  })
  .catch(e => console.error(e.stack));

};

const createToken = (client_id) => {
  return jwt.sign({ client_id: clientId }, cert);
}

const register = (req, res) => {
  if (!req.body || (!req.body['client_id'] || !req.body['client_secret'])) {
    return res.status(500, 'Server Error: No credential submitted');
  }

  const salt = bcrypt.genSaltSync(10);
  const clientSecretSaltyHash = bcrypt.hashSync(req.body['client_secret'], salt);
  console.log(clientSecretSaltyHash);
  const query = {
    text: `INSERT INTO users
          (first_name, last_name, organization, phone, email, password, salt)
           VALUES
          ($1, $2, $3, $4, $5, $6, $7)`,
    values: [req.body['first_name'], req.body['last_name'],
       req.body['organization'], req.body['phone'], 
       req.body['client_id'], clientSecretSaltyHash, salt ]
  }
  pool.query(query)
  .then(data => {
    res.status(201).json({"token": createToken(req.body['client_id']) } );
    res.end();
  })
  .catch(e => console.error(e.stack));

}

const forgot  = (req, res) => {
  console.log("reset");
  if (!req.body || (!req.body['client_id'] )) {
    return res.status(500, 'Server Error: No credential submitted');
  }
  
  var newpassword = randomstring.generate({
      length: 12,
      charset: 'alphabetic'
  });
  const salt = bcrypt.genSaltSync(10);
  const clientnewSecretSaltyHash = bcrypt.hashSync(newpassword, salt);
  console.log(clientnewSecretSaltyHash);
  
  const clientId = req.body['client_id'];
  const query = {
    text: `SELECT * 
    FROM users
    WHERE email = $1`,
    values: [clientId]
  }

  pool.query(query)
  .then(data => { 
    console.log(data);
    resultid = data.rows[0].id;
    resultemail = data.rows[0].email;


  
  
  console.log(resultid);


    const query = {
       text: `UPDATE  
               users SET password = $2
                WHERE id = $1`,
        values: [resultid, clientnewSecretSaltyHash]
    }
     pool.query(query)
      .then(data => {
        console.log(data);
     })
      .catch(e => console.error(e.stack));
  
  })
  .catch(e => console.error(e.stack));

  console.log("before");
  var mailOptions = {
    
    to: resultemail,
    subject: 'Password Reset - GreenStand', 
    html: 'Hello,<br>Try to login in again.<br>Your new password is: '+newpassword

  };
  console.log("sending");
  smtpTransport.sendMail(mailOptions, function(error, info){
    if(error){

        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
    res.status(200).json({
        message: 'Password Reset.'
    });
});


    

}


app.post('/auth/token', token);
app.post('/auth/register', register);
app.post('/auth/forgot', forgot);

// middleware layer that checks jwt authentication

app.use(bearerToken());
app.use((req, res, next)=>{
  console.log("Middleware");
  // check header or url parameters or post parameters for token
  var token = req.token;
  console.log(token);
  if(token){
    //Decode the token
    jwt.verify(token, cert, (err,decod)=>{
      if(err){
        console.log(err);
        res.status(403).json({
          message:"Wrong Token"
        });
      }
      else{
        //If decoded then call next() so that respective route is called.
        req.decoded=decod;
        console.log(decod);

        const query = {
          text: `SELECT id
          FROM users
          WHERE email = $1`,
          values: [decod['client_id']]
        }
        pool.query(query)
        .then(data => {
            if (data.rows.length === 1) {
              req.userId = data.rows[0].id;
              next();
            } else {
              res.status(401).send('Authentication Failed');
            }
        })
        .catch(e => console.error(e.stack));


      }
    });
  }
  else{
    res.status(403).json({
      message:"No Token"
    });
  }
});

app.get('/favicon.ico', function(req, res) {
    res.status(204);
    res.end();
});

app.post('/trees/create', fucntion(req, res){
    data.createTree( req.userId, req.body, function(data){
      res.status(201).json({
        data[0]
      });
    })
    .catch(e => console.error(e.stack));
});


app.get('/trees/details/user/:user_id', function(req, res){   
    
  data.treesForUser(req.params.user_id, function(data){
    res.status(200).json({              
      data: data.rows
    })
  })
    .catch(e => console.error(e.stack));

});

app.get('/trees', function(req, res){   
    
  data.trees(function(data){
    res.status(200).json({              
      data: data.rows
    })
  })
    .catch(e => console.error(e.stack));

});
  
app.get('*',function(req, res){    
    res.sendFile(path.join(__dirname,'index.html'));
});

app.listen(port,()=>{
    console.log('listening on port ' + port);
});
