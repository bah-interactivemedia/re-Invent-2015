/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/things', require('./api/thing'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });

  app.route('/testdata')
    .get(function(req, res){
      res.setHeader('Content-Type', 'application/json');
      var testData = [{
                      name: 'Allocated Budget',
                      data: [43000, 19000, 60000, 35000, 17000],
                      pointPlacement: 'on'
                  }, {
                      name: 'Actual Spending',
                      data: [50000, 39000, 42000, 31000, 26000],
                      pointPlacement: 'on'
                  }];
      res.send(JSON.stringify(testData));
    })
};
