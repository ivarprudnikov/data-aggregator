'use strict';

var cassandra = require('cassandra-driver');
var config = require('../conf/config');
var extend = require('../util/extend');
var path = require('path');
var fs = require('fs');
var promise = require('q');

/**
 * Cassandra driver wrapper
 * Initiates connection, stores client instance, updates schema
 *
 * @param {*} overrides
 * @constructor
 */
function Cassandra(overrides){

  /* jshint maxcomplexity:10 */

  if( !(this instanceof Cassandra) ){
    throw new Error('Must be called with `new` operator');
  }

  overrides = overrides || {};
  var options = extend({}, config.db, overrides);

  /**
   * If schema name is set then in test env it is gonna be updated
   * @type {null|*|test_schema}
   */
  this.schemaName = options.schemaName || null;
  this.schemaEncoding = 'utf8';

  console.log('Starting db connection to : ', options.contactPoints);

  /**
   * http://docs.datastax.com/en/developer/nodejs-driver/2.0/common/drivers/reference/clientOptions.html
   * @type {{}}
   * @private
   */
  this._clientOptions = {};

  if(options.contactPoints){
    this._clientOptions.contactPoints = options.contactPoints;
  }
  if(options.keyspace != null){
    this._clientOptions.keyspace = options.keyspace;
  }
  if(options.protocol != null){
    this._clientOptions.protocolOptions = this._clientOptions.protocolOptions || {};
    this._clientOptions.protocolOptions.port = options.protocol;
  }

  this._client = null;
  this._initializing = null;

  this._init();
}

/**
 * @private
 */
Cassandra.prototype._init = function(){

  var self = this;
  var deferred = promise.defer();

  if(self._client || self._initializing){
    throw new Error('Connection already present or in progress');
  }

  self._initializing = self._executeSchemaQueries().then(function(){

    self._client = new cassandra.Client( self._clientOptions );
    self._client.on('log', function(level, className, message, furtherInfo) {
      console.log('log event: %s -- %s', level, message);
    });

    checkConnectionAndResolve();
  });

  function checkConnectionAndResolve(){
    self._client.connect(function(err, result) {
      if(err){
        console.log('connection failed, will retry in 5s');
        setTimeout(function(){
          checkConnectionAndResolve.call(this);
        },5000);
      } else {
        console.log('[%d] Connected to cassandra',process.pid, 'to keyspace', self._clientOptions.keyspace);
        deferred.resolve();
      }
    });
  }

};

/**
 * @returns {promise}
 */
Cassandra.prototype.getClient = function(){

  var deferred = promise.defer();
  var self = this;

  if(self._client === null){
    self._initializing.then(function(){
      if(!self._client){
        deferred.reject('could not obtain client after initialization');
      } else {
        deferred.resolve(self._client);
      }
    });
  } else {
    deferred.resolve(self._client);
  }

  return deferred.promise;
};

Cassandra.prototype.disconnect = function(cb){
  if(this._client)
    return this._client.shutdown(cb);

  cb();
};

/**
 * Parse schema file and execute queries one by one
 * against connected Cassandra cluster.
 * Shut down afterwards and reinitialize client
 * with test keyspace name, so that queries work.
 * @private
 * returns {promise}
 */
Cassandra.prototype._executeSchemaQueries = function(){

  var self = this;
  var deferred = promise.defer();
  var schemaFile;
  var cass;

  console.log('Executing schema queries');

  if(self.schemaName){

    schemaFile = path.join( __dirname, '../db/', self.schemaName );

    cass = new cassandra.Client({
      contactPoints: self._clientOptions.contactPoints,
      keyspace: null
    });

    connectAndExecute();

  } else {
    deferred.resolve();
  }

  function connectAndExecute(){
    cass.connect(function(err, result) {
      if(err){
        console.log('connection failed, will retry in 5s');

        setTimeout(function(){
          connectAndExecute.call(this);
        },5000);

      } else {
        console.log('Executing commands from', schemaFile);

        // parse contents
        var text = fs.readFileSync(schemaFile, {encoding: self.schemaEncoding});

        // remove new lines
        var trimmed_text = text.replace(/(\r\n|\n|\r)/gm,'');

        // split queries as does not work when batched
        var queries = trimmed_text.split(';');

        self._executeManyWithClient(queries,cass).then(function(){
          cass.shutdown(function(){
            deferred.resolve();
          });
        }).done();
      }
    });
  }

  return deferred.promise;
};

/**
 * @private
 * returns {promise}
 */
Cassandra.prototype._executeManyWithClient = function(queries, client){

  var tasks = [];

  queries.forEach(function(query,idx){

    if(!query || !query.trim()){
      return promise(function(){ return true; });
    }

    var fn = function(){

      var deferred = promise.defer();

      console.log('executing query', query);

      client.execute( query, null, null, function(err, res){
        if(err){
          deferred.reject(err);
        } else {
          deferred.resolve(res);
        }
      });
      return deferred.promise;
    }

    tasks.push(fn);

  });


  var result = promise(function(){
    return true;
  });

  tasks.forEach(function (f) {
    result = result.then(f);
  });

  return result;
};

/**
 * Drop all data in keyspace
 * @returns {promise}
 */
Cassandra.prototype.truncateData = function(){

  var self = this;
  var queries = [
    'TRUNCATE sensor_data'
  ];

  return self.getClient().then(function(client){
    return self._executeManyWithClient(queries,client);
  });
};

/**
 * export singleton
 * @type {Cassandra}
 */
exports = module.exports = new Cassandra();
