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
app.get('/menuFinder', routes.menuFinder);
app.get('/menuFinder/detail', routes.menuDetail);
app.get('/getBestMenus', routes.getBestMenus);
app.post('/insertOrder', routes.insertOrder);
app.post('/addOrder', routes.addOrder);
app.post('/finishClean', routes.finishClean);
//app.post('/completeOrder', routes.completeOrder);
app.post('/callEmployee', routes.callEmployee);

// mobile(kicken)
//app.get('/checkNewOrder', routes.checkNewOrder);
app.get('/getOrderList', routes.getOrderList);
app.post('/finishCook', routes.finishCook);

// mobile(hall)
app.get('/getCookedList', routes.getCookedList);
app.post('/finishServe', routes.finishServe);
app.get('/tableState', routes.tableState);

// web
app.get('/', routes.index);
//app.get('/menuList', routes.menuList);
app.get('/stat', routes.stat);
//:category([a-z_A-Z]+)
app.get('/bestMenuCount/:start/:finish', routes.bestMenuCount);
app.get('/salesYear/:yy', routes.salesYear);
app.get('/salesMonth/:yy/:mm', routes.salesMonth);
app.get('/employStat/:start/:finish', routes.employStat);

// mobile web
app.get('/mProject', routes.mProject);			//프로젝트 소개
app.get('/mMain', routes.mMain);			//메인 페이지
app.get('/mTest', routes.mTest);			//테스트용
app.get('/mMenuFinder', routes.mMenuFinder);		//메뉴
app.get('/mBusiness', routes.mBusiness);		//영업안내
app.get('/mGuideWayStart', routes.mGuideWayStart);      //길 안내 메인
app.get('/mGuideWayLocation', routes.mGuideWayLocation);//길 안내 Google Maps
app.get('/mGuideWay', routes.mGuideWay);		//길 안내
app.get('/mCheckTable', routes.mCheckTable);		//매장 현황
app.get('/mBooking', routes.mBooking);			//예약 -보류-
app.get('/mAvgStar', routes.mAvgStar);	                //별점 평가
app.get('/mWebPos', routes.mWebPos);            	//Pos :: 결제 페이지
//app.get('/mMenuFinder/detail', routes.mMenuDetail);

// payment
app.get('/chargeList/:tableNum', routes.chargeList);
app.post('/charge', routes.charge);

// like
app.post('/like', routes.like);
app.get('/getLikeCnt', routes.getLikeCnt);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// menu give Star
app.post('/putStar', routes.putStar);








