function Data(pool) {
  if(! (this instanceof Data) ){
    return new Data(pool);
  }
	this.pool = pool;
}

Data.prototype.trees = function(callback) {
  let query = {      
    text: 'SELECT * FROM trees'
  }
  this.pool.query(query)
    .then(callback);
}

Data.prototype.treesForUser = function(userId, callback){
  let query = {      
    text: 'SELECT * FROM trees WHERE user_id = $1',
    values: [userId]
  }
  this.pool.query(query)
    .then(callback);
}

Data.prototype.createTree = function(userId, body, callback){
  let lat = body.lat;
  let lon = body.lon;
  let gpsAccuracy = body.gps_accuracy;
  let note = body.note; // first note
  let timestamp = body.timestamp;
  let imageUrl = body.image_url; // first image

  const query = {
    text: `INSERT INTO 
    trees(user_id, lat, lon, 
      gps_accuracy,
      time_created,
      image_url) 
    VALUES($1, $2, $3, $4, to_timestamp($5), $6 ) RETURNING *`,
    values: [userId, lat, lon, gpsAccuracy, timestamp, imageUrl],
  }
  console.log(query);

  this.pool.query(query)
    .then(callback);
}

module.exports = Data;
