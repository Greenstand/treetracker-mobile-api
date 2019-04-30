const express = require('express');
const Sentry = require('@sentry/node');
const bearerToken = require('express-bearer-token');
const bodyParser = require('body-parser');
const http = require('http');
const pg = require('pg');
const { Pool, Client } = require('pg');
const path = require('path');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authModule = require('./lib/auth');
const Data = require('./lib/data');

const config = require('./config/config');
const pool = new Pool({
  connectionString: config.connectionString
});

pool.on('connect', (client) => {
  //console.log("connected", client);
})

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// this needs to be stubbed
// const smtpTransport = nodemailer.createTransport(config.smtpSettings);

const auth = authModule(pool, config.jwtCertificate);
const data = new Data(pool);

const app = express();
const port = process.env.NODE_PORT || 3005;

Sentry.init({ dsn: config.sentry_dsn });

app.use(Sentry.Handlers.requestHandler());
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + '\n');
});


app.set('view engine','html');

app.post('/auth/token', function(req, res){
  if (!req.body || (!req.body['client_id'] || !req.body['client_secret'] || !req.body['device_android_id'])) {
    console.log('ERROR: Authentication, no credentials submitted');
    res.status(406).send('Error: No credential submitted');
    res.end();
    return;
  }

  if(req.body['client_id'] != config.api_client_id || req.body['client_secret'] != config.api_client_secret){
    console.log('ERROR: Authentication, invalid credentials');
    res.status(401).send('Error: Invalid credentials');
    res.end();
    return;
  }

  auth.token(req.body['device_android_id'],
    function(token) {
      res.status(200).json({"token": token});
      return;
    },
    function(error) {
      console.log('ERROR: Authentication, error creating token for device');
      res.status(401).send('Authentication Failed');
      return;
    }
  )

});

// middleware layer that checks jwt authentication

app.use(bearerToken());
app.use((req, res, next)=>{
  // check header or url parameters or post parameters for token
  var token = req.token;
  if(token){
    //Decode the token
    jwt.verify(token, config.jwtCertificate, (err,decod)=>{
      if(err){
        console.log(err);
        console.log('ERROR: Authentication, token  not verified');
        res.status(403).json({
          message:"Wrong Token"
        });
      }
      else{
        //If decoded then call next() so that respective route is called.
        req.decoded=decod;

        const query = {
          text: `SELECT id
          FROM devices
          WHERE id = $1`,
          values: [decod['device_id']]
        }
        pool.query(query)
        .then(data => {
            if (data.rows.length === 1) {
              req.deviceId = data.rows[0].id;
              next();
            } else {
              console.log('ERROR: Authentication, token didn not match a device');
              res.status(401).send('Authentication Failed');
            }
        })
        .catch(e => console.error(e.stack));


      }
    });
  }
  else{
    console.log('ERROR: Authentication, no token supplied for protected path');
    res.status(403).json({
      message:"No Token"
    });
  }
});

app.get('/favicon.ico', function(req, res) {
    res.status(204);
    res.end();
});

app.put('/devices/', async (req, res) => {
  await data.updateDevice(req.deviceId, req.body)
  res.status(200).json({});
});

app.post('/planters/registration', async (req, res) => {
  const user = await data.findOrCreateUser(req.body.planter_identifier, req.body.first_name, req.body.last_name, req.body.organization);
  await data.createPlanterRegistration(user.id, req.deviceId, req.body);
  res.status(200).json({});
});

app.post('/trees/create', async (req, res) => {
    const user = await data.findUser(req.body.planter_identifier);
    const duplicate  = await data.checkForExistingTree(req.body.uuid);
    if(duplicate !== null){
      res.status(200).json({ duplicate });
    } else {
      const tree = await data.createTree( user.id, req.deviceId, req.body);
      res.status(201).json({ tree });
    }
});


app.get('/trees/details/user', async (req, res) => {

  const trees = await data.treesForUser(req.userId);
  res.status(200).json( trees );

});

app.get('/trees', async (req, res) => {

  const trees = await data.trees();
  res.status(200).json( trees );

});

app.get('*',function(req, res){
    res.sendFile(path.join(__dirname,'index.html'));
});

app.listen(port,()=>{
    console.log('listening on port ' + port);
});

module.exports = app;
