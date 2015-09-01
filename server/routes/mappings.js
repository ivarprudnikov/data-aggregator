'use strict';

var cfg = require('../conf/config');
var RouteErrors = require('./RouteErrorsService');

exports.init = function (app) {

  /**
   * CORS for api routes
   */
  app.use(cfg.routes.api.root + '/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, origin, content-type, accept');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, HEAD');
    next();
  });

  /**
   * Define all routes, register routers
   */
  app.use(cfg.routes.api.versionRoot + '/sensor', require('./sensor'));

  /**
   * 404 errors, unhandled routes
   */
  app.use(RouteErrors.sendNotFound());

  /**
   * Catch errors and respond with status 500
   */
  app.use(RouteErrors.catchServerErrors());

};
