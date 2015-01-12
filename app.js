
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

// DB connection
var mysql = require('mysql');
var poolCluster = mysql.createPoolCluster();

dbconfig = {
	"host"			: "localhost",
	"database"		: "smartOrder",
	"user"			: "root",
	"password"		: "chang",
	"multipleStatements"	: true,
	"connectionLimit"	: 10,
	"waitForConnection"	: false
}
poolCluster.add('ORDER', dbconfig);
global.ORDER_Pool = poolCluster.of('ORDER');

// express
var app = express();


// all environments
app.set('port', process.env.PORT || 8010);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
//app.use(function(req, res, next){
//	console.log(req.ip);
//	console.log(req.url);
//	next();
//});
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// tablet
app.post('/insertOrder', routes.insertOrder);
app.post('/completeOrder', routes.completeOrder);

// mobile
app.get('/checkNewOrder', routes.checkNewOrder);
app.get('/dailyStat/:startDay/:endDay', routes.dailyStat);

// web
app.get('/', routes.index);
app.get('/menuList', routes.menuList);
app.get('/stat', routes.stat);

// mobile web
app.get('/m', routes.m);
app.get('/mMenuFinder', routes.mMenuFinder);
app.get('/mBusiness', routes.mBusiness);
app.get('/mGuideWay', routes.mGuideWay);
app.get('/mCheckTable', routes.mCheckTable);
app.get('/mBooking', routes.mBooking);

// menu
app.get('/menuFinder', routes.menuFinder);
app.get('/menuFinder/detail', routes.menuDetail);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});








