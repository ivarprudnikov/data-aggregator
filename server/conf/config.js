'use strict';

var environment = (process.env.NODE_ENV || 'development');

function envVar(variable){
  return process.env[appEnvVarPrefix + variable + '']
}

var appEnvVarPrefix = (process.env.APP_ENV_VAR_PREFIX || 'APP_');
var appName = (envVar('NAME') || 'datadump');
var protocol = (envVar('PROTOCOL') || 'http');
var fqdn = (envVar('FQDN') || 'localhost');
var port = (envVar('PORT') || process.env.PORT || '8080');

// database
var dbContactPoints;
var _dbContactPoints = (envVar('DB_CONTACT_POINTS') || '127.0.0.1');
if(_dbContactPoints.indexOf(',')){
  dbContactPoints = _dbContactPoints.split(',')
} else {
  dbContactPoints = [_dbContactPoints];
}
var dbKeyspace = (envVar('DB_KEYSPACE') || 'datadump');
var dbSchema = (envVar('DB_SCHEMA') || 'schema.txt');
var dbProtocol = (envVar('DB_PROTOCOL') || null);


function appUrl(){
  var url = protocol + '://' + fqdn;
  if(port !== '80'){
    url += (':' + port);
  }
  return url;
}


var cfg = {

  app: {
    name : appName
  },

  db: {
    contactPoints: dbContactPoints,
    keyspace: dbKeyspace,
    protocol: dbProtocol,
	  schemaName: dbSchema
  },

  port : port,

  staticFilesDir : '/client',

  expires : {
    year : 86400000 * 365
  },

  routes: {
    app : {
      url : appUrl()
    },
    api : {
      root : '/api',
      versionRoot : '/api/v1'
    }
  }

};

module.exports = cfg;
