# Data aggregator

Network application for data aggregation via HTTP REST based API endpoints.

## Internals

This server app is stateless - there is no session.

### Datasource

Application connects to configured Cassandra cluster, which is expected to be on localhost (127.0.0.1) unless 
additional configuration is supplied.

After app is started, it will connect to Cassandra and will execute `cql` script file that sets up keyspace and 
column families (tables).

## Running the app

### Prerequisites

- node.js
- cassandra

### Launching

- ensure you are in project dir
- ensure `cassandra` is running, by default it is expected to run locally
- run `npm install` to install dependencies
- run `npm start` to start the app

### Environmental variables - config

Expected environmental variables:

- `NODE_ENV` - development(default), test, production
- `APP_ENV_VAR_PREFIX` - `APP_`(default), can override to avoid environmental variable pollution, then every
subsequent variable will expect this prefix.
- `APP_NAME` - datadump(default), will be used as default db_collection_prefix
- `APP_PROTOCOL` - http(default)
- `APP_FQDN` - localhost(default)
- `APP_PORT` - 8080(default)
- `APP_DB_URI`
- `APP_DB_USER`
- `APP_DB_PASSWORD`
- `APP_DB_COLLECTION_PREFIX` - collections stored in mongo will have this prefix

For additional variables (change in time) look into `server/conf/config.js`

### Testing

- ensure you are in project dir
- run `npm install` to install dependencies
- run `npm test` to test the app

