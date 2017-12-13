const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const pg = require('pg');
const { Pool, Client } = require('pg');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const conn = require('./config');

app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.set('view engine','html');

const pool = new Pool({
  connectionString: conn.connectionString
});

pool.on('connect', (client) => {
  console.log("connected", client);
})

const auth = require('./auth');

app.post('/auth/token', auth.token);
app.post('/auth/register', auth.register);

  app.post('/trees/create', (req, res)=>{
    
    let user_id = req.body.user_id;
    let lat = req.body.lat;
    let lon = req.body.lon;
    let gps_accuracy = req.body.gps_accuracy;
    let note = req.body.note;
    let timestamp = req.body.timestamp;
    let image_url = req.body.image_url;
    
    const query = {
        text: `INSERT INTO 
               datapoints(user_id,lat, lon, 
                            gps_accuracy,note, 
                            timestamp, image_url) 
                VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        values: [user_id, lat, lon, gps_accuracy, note, timestamp, image_url],
      }
      
      pool.query(query)
      .then(res => console.log(res.rows[0]))
      .catch(e => console.error(e.stack));
    res.end();
});

app.get('/favicon.ico', function(req, res) {
    res.status(204);
});

app.get('/trees/details/user/:user_id', function(req, res){   
    
    let query = {      
        
        text: 'SELECT * FROM datapoints WHERE user_id = $1',
        values: [req.params.user_id]
      }
      pool.query(query)
      .then(function(data){
          res.status(200).json({              
              data: data.rows
          })
      })
      .catch(e => console.error(e.stack));

});

app.get('/trees', function(req, res){   
    
    let query = {      
        
        text: 'SELECT * FROM trees'
      }
      
      pool.query(query)
      .then(function(data){
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
