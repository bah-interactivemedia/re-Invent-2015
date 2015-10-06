/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'donorchooseaws.cn3nymplw1j0.us-west-2.rds.amazonaws.com',
    user     : 'root',
    password : 'password',
    database : 'donorsconnect'
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
    if (err) throw err;
    console.log('The solution is: ', rows[0].solution);
});

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
    });

    app.route('/getCitiesByState')
        .get(function(req, res){
            connection.query("SELECT DISTINCT school_city FROM projects WHERE school_state = 'VA' ORDER BY school_city ASC;",
                function(err, rows, fields) {
                    res.send(JSON.stringify(rows));
            });
        });

    app.route('/getTotalDonations')
        .get(function(req, res){
            connection.query("SELECT SUM(total_donations) as total_donations, SUM(total_price_excluding_optional_support) as total_requested_donations FROM projects;",
                function(err, rows, fields) {
                    res.send(JSON.stringify(rows));
            });
        });

    app.route('/getFundingByStateByResource')
        .get(function(req, res){
            connection.query("SELECT resource_type, SUM(total_donations) AS total_donations, SUM(total_price_excluding_optional_support) AS total_requested_donations FROM projects WHERE school_state = '"+ req.state + "' GROUP BY resource_type;",
                function(err, rows, fields) {
                    res.send(JSON.stringify(rows));
                });
        });

    app.route('/getFundingByStateBySubject')
        .get(function(req, res){
            console.log(req);
            connection.query("SELECT primary_focus_subject, SUM(total_donations) AS total_donations, SUM(total_price_excluding_optional_support) AS total_requested_donations FROM projects WHERE school_state = '"+ req.state + "' GROUP BY primary_focus_subject;",
                function(err, rows, fields) {
                    res.send(JSON.stringify(rows));
                });
        });
};
