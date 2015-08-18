'use strict';

/* jshint unused:false */

var
	router = require('express').Router(),
	datasource = require('../db/datasource'),
	TimeUuid = require('cassandra-driver').types.TimeUuid
	;

router.post('/', function (req, res) {

  /* jshint maxcomplexity:10 */

	var itemData = {
		id: TimeUuid.now(),
		uid: req.param('uid') || '',
		sensor: req.param('sensor') || '',
		data: req.param('data') || {}
	};

	var query = 'INSERT INTO sensor_data (id,uid,sensor,data) VALUES (?,?,?,?)';

	datasource.getClient().then(function(client){

		console.log('Query: %s Values: %o', query, itemData);

		client.execute(query, itemData, {prepare: true}, function(err){
			if(err) {
				return res.status(400).send({errors: [err]});
			} else {
				res.status(201).send({data:itemData});
			}
		});
	});

});

module.exports = router;
