function Routes(pool) {
  if(! (this instanceof Routes) ){
    return new Routes(pool);
  }
	this.pool = pool;
}

Routes.prototype.trees = function(callback) {
  let query = {      
    text: 'SELECT * FROM trees'
  }
  this.pool.query(query)
    .then(callback);
}

module.exports = Routes;
