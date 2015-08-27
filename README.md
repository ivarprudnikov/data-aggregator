# Data aggregator

Network application for data aggregation via HTTP REST based API endpoints and its storage in Cassandra.

## API

`api/v1/sensor` - `POST` - Payload will be stored in database, eg:

```
{
  "uid": "12345",
  "sensor": "arduinoBot",
  "data": {
    "temp": 19,
    "speed": 2,
    "battery": "67",
    "turnedOn": "2015-08-27T22:53:11.940Z"
  }
}
```

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
- `APP_DB_CONTACT_POINTS` - 127.0.0.1(default), multiple can be joined via comma(,)
- `APP_DB_KEYSPACE` - datadump(default), test_datadump(default in test env) - will be used when creating cass client instance
- `APP_DB_SCHEMA` - schema.txt(default), test_schema.txt(default in test env) - file name expected to be in `server/db`
which will be used by naked client against cassandra as list of commands.
- `APP_DB_PROTOCOL` - null(default) which falls back to 9200 in client module.

For additional variables (change in time) look into `server/conf/config.js`

### Testing

- ensure you are in project dir
- run `npm install` to install dependencies
- run `npm test` to test the app

