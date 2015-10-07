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

var wit = require('node-wit');

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

    app.route('/getCitiesByState/:state')
        .get(function(req, res){
            connection.query("SELECT DISTINCT school_city FROM projects WHERE school_state = '"+ req.params.state + "' ORDER BY school_city ASC;",
                function(err, rows, fields) {
                    res.send(rows);
            });
        });

    app.route('/getTotalDonations')
        .get(function(req, res){
            connection.query("SELECT SUM(total_donations) as total_donations, SUM(total_price_excluding_optional_support) as total_requested_donations FROM projects;",
                function(err, rows, fields) {
                    res.send(rows);
            });
        });

    /**** STATE ROUTES ****/

    app.route('/getFundingByResource/:state')
        .get(function(req, res){
            connection.query("SELECT resource_type, SUM(total_donations) AS total_donations, SUM(total_price_excluding_optional_support) AS total_requested_donations FROM projects WHERE school_state = '"+ req.params.state + "' GROUP BY resource_type ORDER BY resource_type;",
                function(err, rows, fields) {
                    var resource = [];
                    var totalDonations = [];
                    var totalRequestedDonations = [];

                    for (var i = 0; i < rows.length; i++){
                        resource.push(rows[i]["resource_type"]);
                        totalDonations.push(Math.round(rows[i]["total_donations"]));
                        totalRequestedDonations.push(Math.round(rows[i]["total_requested_donations"]));
                    }

                    var response = new Object();
                    response.categories = resource;
                    response.donations = totalDonations;
                    response.requestedDonations = totalRequestedDonations;

                    res.send(response);
                });
        });

    app.route('/getFundingBySubject/:state')
        .get(function(req, res){
            connection.query("SELECT primary_focus_area, SUM(total_donations) AS total_donations, SUM(total_price_excluding_optional_support) AS total_requested_donations FROM projects WHERE school_state = '"+ req.params.state + "' GROUP BY primary_focus_area ORDER BY primary_focus_area;",
                function(err, rows, fields) {
                    var subject = [];
                    var totalDonations = [];
                    var totalRequestedDonations = [];

                    for (var i = 0; i < rows.length; i++){
                        subject.push(rows[i]["primary_focus_area"]);
                        totalDonations.push(Math.round(rows[i]["total_donations"]));
                        totalRequestedDonations.push(Math.round(rows[i]["total_requested_donations"]));
                    }

                    var response = new Object();
                    response.categories = subject;
                    response.donations = totalDonations;
                    response.requestedDonations = totalRequestedDonations;

                    res.send(response);
                });
        });

    /**** CITY ROUTES ****/

    app.route('/getFundingByResource/:state/:city')
        .get(function(req, res){
            connection.query("SELECT resource_type, SUM(total_donations) AS total_donations, SUM(total_price_excluding_optional_support) AS total_requested_donations FROM projects WHERE school_state = '"+ req.params.state + "' AND school_city = '"+ req.params.city + "' GROUP BY resource_type ORDER BY resource_type;",
                function(err, rows, fields) {
                    var resource = [];
                    var totalDonations = [];
                    var totalRequestedDonations = [];
                    var maxDonated = rows[0]["total_donations"];
                    var maxRequested = rows[0]["total_requested_donations"];

                    for (var i = 0; i < rows.length; i++){
                        resource.push(rows[i]["resource_type"]);
                        totalDonations.push(Math.round(rows[i]["total_donations"]));
                        totalRequestedDonations.push(Math.round(rows[i]["total_requested_donations"]));
                    }

                    var response = new Object();
                    response.categories = resource;
                    response.donations = totalDonations;
                    response.requestedDonations = totalRequestedDonations;

                    res.send(response);
                });
        });

    app.route('/getFundingBySubject/:state/:city')
        .get(function(req, res){
            connection.query("SELECT primary_focus_area, SUM(total_donations) AS total_donations, SUM(total_price_excluding_optional_support) AS total_requested_donations FROM projects WHERE school_state = '"+ req.params.state + "' AND school_city = '"+ req.params.city + "' GROUP BY primary_focus_area ORDER BY primary_focus_area;",
                function(err, rows, fields) {
                    var subject = [];
                    var totalDonations = [];
                    var totalRequestedDonations = [];

                    for (var i = 0; i < rows.length; i++){
                        subject.push(rows[i]["primary_focus_area"]);
                        totalDonations.push(Math.round(rows[i]["total_donations"]));
                        totalRequestedDonations.push(Math.round(rows[i]["total_requested_donations"]));
                    }

                    var response = new Object();
                    response.categories = subject;
                    response.donations = totalDonations;
                    response.requestedDonations = totalRequestedDonations;

                    res.send(response);
                });
        });

    /**** WIT ****/

    app.route('/witcall')
        .post(function(req,res){
          console.log("Sending text & audio to Wit.AI");

          wit.captureTextIntent("E5YTJGTEAX5GJH6WHT42AFK6JYZYREDP", req.body.input, function (err, res) {
              console.log("Response from Wit for text input: ");
              if (err) console.log("Error: ", err);
              var results = JSON.stringify(res, null, " ");

              var witIntent = res.outcomes[0].intent;
              console.log("intent: "+ witIntent);

              console.log(JSON.stringify(res.outcomes[0].entities));

              // Metrics
              var state = req.body.state;
              var city = req.body.city;

              var barChart = {};
              var lineGraph = {};

              // Bar chart
              connection.query("SELECT SUM(total_donations) as total_donations, SUM(total_price_excluding_optional_support) as total_requested_donations FROM projects WHERE school_state = '" + state + "' AND school_city = " + city + " AND primary_focus_area = '" + witIntent + "'"+
               "UNION"+
               "SELECT SUM(total_donations) as total_donations, SUM(total_price_excluding_optional_support) as total_requested_donations FROM projects WHERE school_state = '" + state + "' AND primary_focus_area = '" + witIntent + "'"+
               "UNION"+
               "SELECT SUM(total_donations) as total_donations, SUM(total_price_excluding_optional_support) as total_requested_donations FROM projects WHERE primary_focus_area = '" + witIntent + "';",
                  function(err, rows, fields) {
                      var totalDonations = [];
                      var totalRequestedDonations = [];

                      for (var i = 0; i < rows.length; i++){
                          totalDonations.push(Math.round(rows[i]["total_donations"]));
                          totalRequestedDonations.push(Math.round(rows[i]["total_requested_donations"]));
                      }

                      barChart.donations = totalDonations;
                      barChart.requestedDonations = totalRequestedDonations;
                  });

              // Line chart
              connection.query("SELECT SUM(total_donations) as total_donations, SUM(total_price_excluding_optional_support) as total_requested_donations, year(date_posted) as projectYear FROM projects WHERE school_state = '"+ state + "' AND school_city = '"+ city + "' GROUP BY year(date_posted);",
                  function(err, rows, fields) {
                      var year = [];
                      var totalDonations = [];
                      var totalRequestedDonations = [];

                      for (var i = 0; i < rows.length; i++) {
                          year.push(rows[i]["projectYear"]);
                          totalDonations.push(Math.round(rows[i]["total_donations"]));
                          totalRequestedDonations.push(Math.round(rows[i]["total_requested_donations"]));
                      }

                      lineGraph.years = year;
                      lineGraph.donations = totalDonations;
                      lineGraph.requestedDonations = totalRequestedDonations;
                  });

              var response = {};

              response.barChart = barChart;
              response.lineGraph = lineGraph;
          });

            res.send(response);
        });
};
