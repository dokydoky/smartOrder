var async = require('async');
var gcm = require('node-gcm');

/******************************************************************************
 * GCM Variables
 *****************************************************************************/
var server_access_key = 'AIzaSyDha-5O_Di0LdedsVCtu_tEkNqH2sAre6Y';
var sender = new gcm.Sender(server_access_key);
var registrationIds = [];
      
var registration_id = 'APA91bGCykEfZS49Wbu7UAEANAO-POU6eKE4LEAQtZq91ivd0qp1S_d9zPy3B51m1m6JNlxKU9pDT0X4RVDzqMAMg8ZupeqVe41VhZCn_oiNiwY6smIiGFyN-xlILzUxrEs4RttBw9ZlagmBsnPEg2SCC6BdxS1oUQ|';
// At least one required
registrationIds.push(registration_id);
      

/******************************************************************************
 * Common Functions 
 *****************************************************************************/

// getTimeStamp, leadingZeros : get current time
function getTimeStamp() {
  var d = new Date();
  var s =
    leadingZeros(d.getFullYear(), 4) + '-' +
    leadingZeros(d.getMonth() + 1, 2) + '-' +
    leadingZeros(d.getDate(), 2) + ' ' +
    leadingZeros(d.getHours(), 2) + ':' +
    leadingZeros(d.getMinutes(), 2) + ':' +
    leadingZeros(d.getSeconds(), 2);

  return s;
}

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}

// trim string
String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
String.prototype.ltrim=function(){return this.replace(/^\s+/,'');};
String.prototype.rtrim=function(){return this.replace(/\s+$/,'');};
String.prototype.fulltrim=function(){return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');};




/******************************************************************************
 * Tablet API Functions
 *****************************************************************************/

// menu
exports.menuFinder = function(req, res){
  var category = req.param('category') || '';
  var selectQuery = "";

  if(category){
    selectQuery = "select m.m_id AS id, m.m_name AS krName, m.m_enName AS enName, m_cookTime AS cookTime, m.m_price AS price, m.m_picture AS picture, m.m_compose AS compose, c.c_name AS category from menu m, category c where m.m_catID = c.c_id and c.c_name = '" + category + "'";
  } else{
    selectQuery = "select m.m_id AS id, m.m_name AS krName, m.m_enName AS enName, m_cookTime AS cookTime, m.m_price AS price, m.m_picture AS picture, m.m_compose AS compose, c.c_name AS category from menu m, category c where m.m_catID = c.c_id ORDER BY c.c_name";
  }

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(selectQuery, function(err, results){
      if(err){
        connection.release();
        res.json({result: 0, data: 'query getConnection Error'});
      } else{
        connection.release();
        res.json({result: 1, data: results});
      }
    });
  });
}

exports.menuDetail = function(req, res){
  var menuID = parseInt(req.param('id')) || '';

  if(!menuID){
    res.json({result: 0, data: 'id is mendatory'});
    return;
  }

  var selectQuery1 = "select m.m_name AS krName, m.m_enName AS enName, m.m_cookTime AS cookTime, m.m_price AS price, m.m_compose AS compose, m.m_detail AS detail, i.i_picture AS ingre_picture, i.i_krName AS ingre_krName, i.i_enName AS ingre_enName, i.i_detail AS ingre_detail, i.i_addTitle AS ingre_addTitle, i.i_addDetail AS ingre_addDetail from menu m left outer join ingredient i ON m.m_id = i.i_menuID where m.m_id = " + menuID + ";";
  var selectQuery2 = "select s.s_name AS side_name, s.s_picture AS side_picture from menu m left outer join connectMenues c ON m.m_id = c.menuID left outer join sideMenu s ON c.sidemenuID = s.s_id where  m.m_id = " + menuID + ";";

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(selectQuery1, function(err, result1){
      if(err){
        connection.release();
        res.json({result: 0, data: 'query getConnection Error'});
      } else{
        connection.query(selectQuery2, function(err, result2){
          if(err){
            connection.release();
            res.json({result: 0, data: 'query getConnection Error'});
          } else{
            connection.release();
            result1[0]['sideMenu'] = result2;
            res.json({result: 1, data: result1[0]});
          }
        });
      }
    });
  });
}

exports.getBestMenus = function(req, res){
  var queryGetBestMenus = "SELECT m.m_name AS name, sum(o.om_orderCount) AS sales " + 
                          "FROM orderMenuList o, menu m " + 
                          "WHERE o.m_id = m.m_id AND om_orderTime > (SELECT now() - INTERVAL 1 WEEK) " + 
                          "GROUP BY o.m_id " + 
                          "ORDER BY sales DESC " + 
                          "LIMIT 0,5;";

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(queryGetBestMenus, function(err, results){
      if(err){
        connection.release();
        res.json({result: 0, data: '[getBestMenus]: query getConnection Error'});
      } else{
        connection.release();
        res.json({result: 1, data: results});
      }
    });
  });
}

/* backup src
exports.insertOrder = function(req, res){
  var menu = req.body.menu;
  var tableName = parseInt(req.body.tableName);
  //var menuList = ['A', 'B', 'C', 'D', 'E'];

  //if( menuList.indexOf(menu) == -1 ){
  //  res.json({result: 0, data: 'invalid menu'});
  //  return;
  //}

  var insertQuery = "INSERT INTO orderList(menu, tableName) VALUES('" + menu + "', " + tableName + ");";

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(insertQuery, function(err, results){
      if(err){
        connection.release();
        res.json({result: 0, data: 'query getConnection Error'});
      } else{
        connection.release();
        res.json({result: 1, data: 'menu insert complete'});
      }
    });
  });
};
*/

function checkMenuOrderCount(menu, res){
  var menuName = Object.keys(menu);
  var menuLen = menuName.length;

  for(var i=0; i<menuLen; i++){
    if( menu[menuName[i]] <= 0 ){
      res.json({results: 0, data: 'invalid menu order count'});
      return false;
    }
  }

  return true;
}

function checkMenuNameAndPrice(menu, results, totalInput, res){
  var menuName = Object.keys(menu);
  var menuLen = menuName.length;
  var rowLen = results.length;
  var menuID = [];
  var menuPrice = {};

  // name check
  for(var i=0; i<menuLen; i++){
    for(var j=0; j<rowLen; j++){
      if( menuName[i].trim() == results[j].name.trim() ){
        menuID[i] = results[j].id;
        menuPrice[menuName[i]] = results[j].price;
        break;
      } else if( j == rowLen-1 ){
        res.json({results: 0, data: 'no matched menu name for : ' + menuName[i]});
        return false;
      }
    }
  }

  // price check
  var totalCalc = 0;
  for(var i=0; i<menuLen; i++){
    var name = menuName[i];
    totalCalc += menuPrice[name] * menu[name];	// price * count
  }

  if( totalCalc != totalInput ) {
    res.json({results: 0, data: 'total is wrong'});
    return false;
  }

  return menuID;
}

exports.insertOrder = function(req, res){
  var sitTime = getTimeStamp();			// current time
  var orderTime = getTimeStamp();
  var totalInput = req.body.total;		// integer
  var id = null; //req.body.id;			// string
  var numOfMember = req.body.numOfMember;	// integer
  var tableNum = req.body.tableNum;		// array
  //var employee = req.body.employee;		// string
  var menu = req.body.menu; 			// json

  var menuName = Object.keys(menu);
  var menuLen = menuName.length;
  var tableNumLen = tableNum.length;

  var connection;
  var menuID = [];
  var orderListID;

  // check menu order count > 0
  if( !checkMenuOrderCount(menu, res) ) return;

  async.waterfall([
    function(cb){
      ORDER_Pool.getConnection(cb);
    },
    function(conn, cb){
      connection = conn;
      var queryGetMenu = "SELECT m_id AS id, m_price AS price, m_name AS name FROM menu;";
      connection.query(queryGetMenu, cb);
    },
    function(results, info, cb){
      // check menu name and price
      menuID = checkMenuNameAndPrice(menu, results, totalInput, res);
      if( !menuID ){
        connection.release();
        return;
      }
      cb(null);
    },
    function(cb){
      // insert orderList
      var queryInsertOrderList = "INSERT INTO orderList(o_sitTime, o_total, o_memberID, o_peopleNum) " +
                                 "VALUES(now(), " + totalInput + ", " + id + ", " + numOfMember + ");";
      connection.query(queryInsertOrderList, cb)
    },
    function(info, tmp, cb){
      // get orderList id(AUTO_INCREMENT)
      var queryGetID = "SELECT LAST_INSERT_ID() AS id;";
      connection.query(queryGetID, cb);
    },
    function(id, info, cb){
      // insert menuOrderList
      orderListID = id[0].id;
      //var queryInsertMenuList = "INSERT INTO orderMenuList(m_id, om_orderCount, om_takeEmp, om_orderTime, o_id) VALUES";
      var queryInsertMenuList = "INSERT INTO orderMenuList(m_id, om_orderCount, om_orderTime, o_id) VALUES";

      for(var i=0; i<menuID.length; i++){
        //queryInsertMenuList += "(" + menuID[i] + ", " + menu[menuName[i]] + ", '" + employee + "', now(), " + orderListID + ")";
        queryInsertMenuList += "(" + menuID[i] + ", " + menu[menuName[i]] + ", now(), " + orderListID + ")";
        queryInsertMenuList += (i == menuID.length-1) ? ";" : ", ";
      }
      connection.query(queryInsertMenuList, cb)
    },
    function(info, tmp, cb){
      // insert tableList
      var queryInsertTableList = "INSERT INTO tableList(t_tableNum, o_id) VALUES";

      for(var i=0; i<tableNumLen; i++){
        queryInsertTableList += "(" + tableNum[i] + ", " + orderListID + ")";
        queryInsertTableList += (i == tableNumLen-1) ? ";" : ", ";
      }
      connection.query(queryInsertTableList, cb)
    },
    function(info, tmp, cb){
      // change table state
      //var queryUpdateState = "UPDATE tableStatus SET ts_status = 'order' WHERE ts_tableNum = ";
      var queryUpdateState = "UPDATE tableStatus SET ts_beforeStatus = ts_status, ts_status = 'order', ts_recentlyChange = now() " +
                             "WHERE ts_tableNum = ";

      for(var i=0; i<tableNumLen; i++){
        queryUpdateState += tableNum[i];
        queryUpdateState += (i == tableNumLen-1) ? ";" : " OR ts_tableNum = ";
      }
      connection.query(queryUpdateState, cb);
    },
    function(info, tmp, cb){
      // PUSH Alarm To Android

      // create message with object values
      var message = new gcm.Message({
          collapseKey: 'demo',
          delayWhileIdle: true,
          timeToLive: 3,
          data: {
              key1: '[주문]',
              key2: '새로운 주문'
          }
      });
      
      /**
       * Params: message-literal, registrationIds-array, No. of retries, callback-function
       **/
      sender.send(message, registrationIds, 4, cb);
    }
  ],
  function(err, results){
    if(err){
      connection.release();
      res.json({result: 0, data: 'insertOrder Error'});
    } else{
      connection.release();
      res.json({ result: 1, data: {orderID: orderListID, total: totalInput} });
    }
  });
};

exports.addOrder = function(req, res){
  var orderID = req.body.orderID;
  var menu = req.body.menu; 			// json
  //var employee = req.body.employee;
  var totalInput = req.body.total;
  var totalAfterAdd;

  var employee = req.body.employee;		// string
  var menuName = Object.keys(menu);

  var connection;
  var menuID;

  // check menu order count > 0
  if( !checkMenuOrderCount(menu, res) ) return;

  async.waterfall([
    function(cb){
      ORDER_Pool.getConnection(cb);
    },
    function(conn, cb){
      connection = conn;
      var queryGetMenu = "SELECT m_id AS id, m_price AS price, m_name AS name FROM menu;";
      connection.query(queryGetMenu, cb);
    },
    function(results, info, cb){
      // check menu name and price
      menuID = checkMenuNameAndPrice(menu, results, totalInput, res);
      if( !menuID ){
        connection.release();
        return;
      }
      cb(null);
    },
    function(cb){
      // insert menuOrderList
      //var queryInsertMenuList = "INSERT INTO orderMenuList(m_id, om_orderCount, om_takeEmp, om_orderTime, o_id) VALUES";
      var queryInsertMenuList = "INSERT INTO orderMenuList(m_id, om_orderCount, om_orderTime, o_id) VALUES";

      for(var i=0; i<menuID.length; i++){
        //queryInsertMenuList += "(" + menuID[i] + ", " + menu[menuName[i]] + ", '" + employee + "', now(), " + orderID + ")";
        queryInsertMenuList += "(" + menuID[i] + ", " + menu[menuName[i]] + ", now(), " + orderID + ")";
        queryInsertMenuList += (i == menuID.length-1) ? ";" : ", ";
      }
      connection.query(queryInsertMenuList, cb)
    },
    function(info, tmp, cb){
      // get new Total
      var queryGetTotal = "SELECT sum(m.m_price) as total FROM orderMenuList o, menu m " + 
                          "WHERE o.m_id=m.m_id AND o.o_id=" + orderID + ";";
      connection.query(queryGetTotal, cb);
    },
    function(total, info, cb){
      // update new Total
      totalAfterAdd = total[0].total;
      var queryUpdateTotal = "UPDATE orderList SET o_total=" + totalAfterAdd + " WHERE o_id=" + orderID + ";";

      connection.query(queryUpdateTotal, cb)
    },
    function(info, tmp, cb){
      // get tableNum
      var queryGetTableNum = "SELECT t_tableNum AS tableNum FROM tableList WHERE o_id = " + orderID + ";";

      connection.query(queryGetTableNum, cb);
    },
    function(results, info, cb){
      // change table state
      //var queryUpdateState = "UPDATE tableStatus SET ts_status = 'add' WHERE ts_tableNum = ";
      var queryUpdateState = "UPDATE tableStatus SET ts_beforeStatus = ts_status, ts_status = 'add', ts_recentlyChange = now() " + 
                             "WHERE ts_tableNum = ";
      var tableNumLen = results.length;

      for(var i=0; i<tableNumLen; i++){
        queryUpdateState += results[i].tableNum;
        queryUpdateState += (i == tableNumLen-1) ? ";" : " OR ts_tableNum = ";
      }
      connection.query(queryUpdateState, cb);
    },
    function(info, tmp, cb){
      // PUSH Alarm To Android

      // create message with object values
      var message = new gcm.Message({
          collapseKey: 'demo',
          delayWhileIdle: true,
          timeToLive: 3,
          data: {
              key1: '[주문]',
              key2: '추가 주문'
          }
      });
      
      /**
       * Params: message-literal, registrationIds-array, No. of retries, callback-function
       **/
      sender.send(message, registrationIds, 4, cb);
    }
  ],
  function(err, results){
    if(err){
      connection.release();
      res.json({result: 0, data: 'addOrder Error'});
    } else{
      connection.release();
      res.json({ result: 1, data: {orderID: orderID, total: totalAfterAdd} });
    }
  });
};

exports.finishClean = function(req, res){
  var orderID = req.body.orderID;
  var employee = req.body.employee;
  var connection;

  async.waterfall([
    function(cb){
      ORDER_Pool.getConnection(cb);
    },
    function(conn, cb){
      connection = conn;
      // set table state

//      var queryUpdateState = "UPDATE tableStatus SET ts_status = 'empty' " + 
//                             "WHERE ts_tableNum IN " + 
//                                 "( SELECT t_tableNum FROM tableList WHERE o_id = " + orderID + " );"

      var queryUpdateState = "UPDATE tableStatus SET ts_beforeStatus = ts_status, ts_status = 'empty', ts_recentlyChange = now() " + 
                             "WHERE ts_tableNum IN " + 
                                 "( SELECT t_tableNum FROM tableList WHERE o_id = " + orderID + " );"

      connection.query(queryUpdateState, cb);
    },
    function(info, tmp, cb){
      // insert tableClean
      var queryInsertClean = "INSERT INTO tableClean(t_empName, t_finishTime, o_id) " + 
                             "VALUES('" + employee + "', now(), " + orderID + ");";
      connection.query(queryGetMenu, cb);
    }
  ],
  function(err, results){
    if(err){
      connection.release();
      res.json( {results: 0, data: '[finishClean]: getConnection Error'} );
    } else{
      connection.release();
      res.json({results: 1, data: 'successfully updated'});
    }
  });
};

/* substitute with "finishCook, finishServe"
exports.completeOrder = function(req, res){
  var no = parseInt(req.body.no);
  var updateQuery = "UPDATE orderList SET checkVal = 1 where checkVal = 0 and no='" + no + "';";
  ORDER_Pool.getConnection(function(err, connection){
    connection.query(updateQuery, function(err, results){
      if(err){
        connection.release();
        res.json({result: 0, data: 'query getConnection Error'});
      } else{
        connection.release();
        res.json({result: 1, data: results});
      }
    });
  });
};
*/


/******************************************************************************
 * Mobile(Android) - kicken : API Functions
 *****************************************************************************/

/* checkNewOrder_old backup
exports.checkNewOrder = function(req, res){
  var selectQuery = "SELECT no, menu, tableName, time from orderList WHERE checkVal = 0";

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(selectQuery, function(err, results){
      if(err){
        connection.release();
        res.json({result: 0, data: 'query getConnection Error'});
      } else{
        connection.release();
        res.json({result: 1, data: results});
      }
    });
  });
};
*/

exports.getOrderList = function(req, res){
  var selectQuery = "SELECT o.om_id AS orderMenuID, group_concat(t.t_tableNum) AS tableNum, m.m_name AS name, " + 
                           //"o.om_orderCount AS count, o.om_orderTime AS orderTime, o.om_takeEmp AS takeEmp " +
                           "o.om_orderCount AS count, o.om_orderTime AS orderTime " +
                    "FROM tableList t " +
                    "LEFT JOIN orderMenuList o " +
                    "ON o.o_id = t.o_id " +
                    "LEFT JOIN menu m " +
                    "ON o.m_id = m.m_id " +
                    "WHERE o.om_IsCooked = 0 " +
                    "GROUP BY o.om_id;";

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(selectQuery, function(err, results){
      if(err){
        connection.release();
        res.json({result: 0, data: '[getOrderList] : query getConnection Error'});
      } else{
        connection.release();
        res.json({result: 1, data: results});
      }
    });
  });
};

exports.finishCook = function(req, res){
  var orderMenuID = req.body.orderMenuID;
  var connection;

  async.waterfall([
    function(cb){
      ORDER_Pool.getConnection(cb);
    },
    function(conn, cb){
      connection = conn;
      var queryUpdateCookedState = "UPDATE orderMenuList SET om_IsCooked = 1 WHERE om_id = " + orderMenuID + ";";

      connection.query(queryUpdateCookedState, cb);
    },
    function(info, tmp, cb){
      // PUSH Alarm To Android

      // create message with object values
      var message = new gcm.Message({
          collapseKey: 'demo',
          delayWhileIdle: true,
          timeToLive: 3,
          data: {
              key1: '[주방]',
              key2: '조리완료'
          }
      });
      
      // Params: message-literal, registrationIds-array, No. of retries, callback-function
      sender.send(message, registrationIds, 4, cb);
    }
  ],
  function(err, results){
    if(err){
      connection.release();
      res.json({result: 0, data: '[finishCook] : query getConnection Error'});
    } else{
      connection.release();
      res.json({result: 1, data: '[finishCook] : success'});
    }
  });
};


/******************************************************************************
 * Mobile(Android) - hall : API Functions
 *****************************************************************************/

exports.getCookedList = function(req, res){
  var selectQuery = "SELECT o.om_id AS orderMenuID, group_concat(t.t_tableNum) AS tableNum, m.m_name AS name, " + 
                           //"o.om_orderCount AS count, o.om_orderTime AS orderTime, o.om_takeEmp AS takeEmp " +
                           "o.om_orderCount AS count, o.om_orderTime AS orderTime " +
                    "FROM tableList t " +
                    "LEFT JOIN orderMenuList o " +
                    "ON o.o_id = t.o_id " +
                    "LEFT JOIN menu m " +
                    "ON o.m_id = m.m_id " +
                    "WHERE o.om_IsCooked = 1 AND o.om_IsServed = 0 " +
                    "GROUP BY o.om_id;";

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(selectQuery, function(err, results){
      if(err){
        connection.release();
        console.log(err);
        res.json({result: 0, data: '[getOrderList] : query getConnection Error'});
      } else{
        connection.release();
        res.json({result: 1, data: results});
      }
    });
  });
};

exports.finishServe = function(req, res){
  var om_id = req.body.orderMenuID;
  var connection;
  var isSetTableState = false;

  async.waterfall([
    function(cb){
      ORDER_Pool.getConnection(cb);
    },
    function(conn, cb){
      connection = conn;
      var queryUpdateServeState = "UPDATE orderMenuList SET om_IsServed = 1 WHERE om_id = " + om_id + ";"
      connection.query(queryUpdateServeState, cb);
    },
    function(info, tmp, cb){
      var queryGetNotServedMenuCount = "SELECT count(*) AS cnt FROM orderMenuList " + 
                                       "WHERE o_id = (SELECT o_id FROM orderMenuList WHERE om_id = " + om_id + ") " + 
                                       "AND (om_IsCooked = 0 OR om_IsServed = 0);"
      connection.query(queryGetNotServedMenuCount, function(err, results){
        if(err){
          connection.release();
          res.json({result: 0, data: '[finishServe] Error'});
        } else{
          if( results[0].cnt == 0 ){	// every menu was cooked and served
            isSetTableState = true;

            // update table state = 'have'
            var queryUpdateState = "UPDATE tableStatus SET ts_beforeStatus = ts_status, ts_status = 'add', ts_recentlyChange = now() " + 
                                   "WHERE ts_tableNum IN " + 
                                       "(" +
                                           "SELECT t_tableNum as tableNum FROM tableList " + 
                                           "WHERE o_id = (SELECT o_id FROM orderMenuList WHERE om_id = " + om_id + ")" +
                                       ");";

/*
            var queryUpdateState = "UPDATE tableStatus SET ts_status = 'have' " + 
                                     "WHERE ts_tableNum IN " + 
                                         "(" +
                                             "SELECT t_tableNum as tableNum FROM tableList " + 
                                             "WHERE o_id = (SELECT o_id FROM orderMenuList WHERE om_id = " + om_id + ")" +
                                         ");";
*/
            connection.query(queryUpdateState, cb);
          } else{
            cb(null);
          }
        }
      });
    }
  ],
  function(err, results){
    if(err){
      connection.release();
      res.json({result: 0, data: '[finishServe] Error'});
    } else{
      connection.release();
      if( isSetTableState ){
          res.json({ result: 1, data: 'All menus are served' });
      } else{
          res.json({ result: 2, data: 'sucessfully updated' });
      }
    }
  });

};

exports.tableState = function(req, res){
  var selectQuery = "SELECT ts_tableNum AS tableNum, ts_status AS state FROM tableStatus;";

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(selectQuery, function(err, results){
      if(err){
        connection.release();
        res.json({result: 0, data: '[tableState]: query getConnection Error'});
      } else{
        connection.release();
        res.json({result: 1, data: results});
      }
    });
  });
};

/*
exports.dailyStat = function(req, res){
  var startDay = req.param('startDay');
  var endDay = req.param('endDay');
  var selectQuery = "SELECT menu, count(*) AS count FROM orderList WHERE time >= '" + startDay + 
			"' and time <= '" + endDay + "' GROUP BY menu;";

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(selectQuery, function(err, results){
      if(err){
        connection.release();
        res.json({result: 0, data: 'query getConnection Error'});
      } else{
        connection.release();
        res.json({result: 1, data: results});
      }
    });
  });
};
*/






/******************************************************************************
 * Web(PC) Views
 *****************************************************************************/

exports.index = function(req, res){
  res.render('index');
};

/*
exports.menuList = function(req, res){
  var selectQuery = "SELECT no, menu, tableName, DATE_FORMAT(time, '%Y-%m-%d %h:%m:%s') AS time, checkVal from orderList";

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(selectQuery, function(err, results){
      if(err){
        connection.release();
        res.send('query getConnection Error');
      } else{
        connection.release();
        res.render('menuList', {results:results});
      }
    });
  });
};
*/

exports.stat = function(req, res){
  //var selectQuery = "SELECT menu, count(*) AS count FROM orderList GROUP BY menu;";

/*
  var selectQuery = "SELECT DATE_FORMAT(time, '%Y-%m-%d') AS day, menu, count(*) AS count from orderList GROUP BY day, menu";

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(selectQuery, function(err, results){
      if(err){
        connection.release();
        res.send('query getConnection Error');
      } else{
        connection.release();
        res.render('stat', {results:results});
      }
    });
  });
*/

  res.render('stat');
};

exports.bestMenuCount = function(req, res){
  var start = req.param('start');
  var finish = req.param('finish');
  var queryBestMenuCount = "SELECT m.m_name AS name, sum(o.om_orderCount) AS sales, c.c_name AS category " + 
                           "FROM orderMenuList o " + 
                           "LEFT JOIN menu m ON o.m_id = m.m_id " + 
                           "LEFT JOIN category c ON m.m_catID = c.c_id " + 
                           "WHERE o.om_orderTime >= date('" + start + "') AND " + 
                                 "o.om_orderTime < date('" + finish + "')+INTERVAL 1 DAY " + 
                           "GROUP BY o.m_id " + 
                           "ORDER BY sales DESC;";

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(queryBestMenuCount, function(err, results){
      if(err){
        connection.release();
        console.log(err);
        res.json({result: 0, data: '[bestMenuCount] : Error'});
      } else{
        connection.release();
        res.json({result: 1, data: results});
      }
    });
  });
};

exports.salesYear = function(req, res){
  var year = req.param('yy');
  var querySalesYear = "SELECT DATE_FORMAT(o_sitTime, '%Y-%m') AS month, sum(o_total) AS total " + 
                       "FROM orderList " + 
                       "WHERE YEAR(o_sitTime) = " + year + " " + 
                       "GROUP BY MONTH(o_sitTime) " + 
                       "ORDER BY MONTH(o_sitTime);"

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(querySalesYear, function(err, results){
      if(err){
        connection.release();
        res.json({result: 0, data: '[salesYear] : Error'});
      } else{
        connection.release();
        res.json({result: 1, data: results});
      }
    });
  });
};

exports.salesMonth = function(req, res){
  var year = req.param('yy');
  var month = req.param('mm');
  var querySalesMonth = "SELECT DATE_FORMAT(o_sitTime, '%Y-%m-%d') AS day, sum(o_total) AS total " + 
                        "FROM orderList " + 
                        "WHERE DATE_FORMAT(o_sitTime, '%Y-%m') = '" + year + "-" + month + "' " + 
                        "GROUP BY DAYOFMONTH(o_sitTime) " + 
                        "ORDER BY DAYOFMONTH(o_sitTime);"

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(querySalesMonth, function(err, results){
      if(err){
        connection.release();
        res.json({result: 0, data: '[salesMonth] : Error'});
      } else{
        connection.release();
        res.json({result: 1, data: results});
      }
    });
  });
};

exports.employStat = function(req, res){
  var start = req.param('start');
  var finish = req.param('finish');
  var queryEmployStat = "SELECT t_empName AS name, count(t_id) AS cnt " + 
                        "FROM tableClean " + 
                        "WHERE t_finishTime >= date('" + start + "') AND " + 
                              "t_finishTime < date('" + finish + "')+INTERVAL 1 DAY " + 
                        "GROUP BY t_empName;";

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(queryEmployStat, function(err, results){
      if(err){
        connection.release();
        res.json({result: 0, data: '[bestMenuCount] : Error'});
      } else{
        connection.release();
        res.json({result: 1, data: results});
      }
    });
  });
};




/******************************************************************************
 * Web(Mobile) Views
 *****************************************************************************/

exports.mMenuFinder = function(req, res){
  var category = req.param('category') || '';
  var selectQuery = "";

  if(category){
    selectQuery = "SELECT m.m_id AS id, m.m_name AS krName, m.m_enName AS enName, m_cookTime AS cookTime, " +
                         "m.m_price AS price, m.m_picture AS picture, m.m_compose AS compose, c.c_name AS category " + 
                  "FROM menu m, category c " + 
                  "WHERE m.m_catID = c.c_id AND c.c_name = '" + category + "'";
  } else{
    selectQuery = "SELECT m.m_id AS id, m.m_name AS krName, m.m_enName AS enName, m_cookTime AS cookTime, " + 
                         "m.m_price AS price, m.m_picture AS picture, m.m_compose AS compose, c.c_name AS category " +
                  "FROM menu m, category c WHERE m.m_catID = c.c_id " + 
                  "ORDER BY c.c_name";
  }

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(selectQuery, function(err, results){
      if(err){
        connection.release();
        res.send('query getConnection Error');
      } else{
        connection.release();
        res.render('mMenuFinder', {results:results});
      }
    });
  });
}

/*
exports.mMenuDetail = function(req, res){
  var menuID = parseInt(req.param('id')) || '';

  if(!menuID){
    res.json({result: 0, data: 'id is mendatory'});
    return;
  }

  var selectQuery1 = "select m.m_name AS krName, m.m_enName AS enName, m.m_price AS price, m.m_compose AS compose, m.m_detail AS detail, i.i_picture AS ingre_picture, i.i_krName AS ingre_krName, i.i_enName AS ingre_enName, i.i_detail AS ingre_detail, i.i_addTitle AS ingre_addTitle, i.i_addDetail AS ingre_addDetail from menu m left outer join ingredient i ON m.m_id = i.i_menuID where m.m_id = " + menuID + ";";
  var selectQuery2 = "select s.s_name AS side_name, s.s_picture AS side_picture from menu m left outer join connectMenues c ON m.m_id = c.menuID left outer join sideMenu s ON c.sidemenuID = s.s_id where  m.m_id = " + menuID + ";";

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(selectQuery1, function(err, result1){
      if(err){
        connection.release();
        res.json({result: 0, data: 'query getConnection Error'});
      } else{
        connection.query(selectQuery2, function(err, result2){
          if(err){
            connection.release();
            res.json({result: 0, data: 'query getConnection Error'});
          } else{
            connection.release();
            result1[0]['sideMenu'] = result2;
            res.json({result: 1, data: result1[0]});
          }
        });
      }
    });
  });
}
*/

exports.mBusiness = function(req, res){
  res.render('mBusiness');
}

exports.mGuideWay = function(req, res){
  var classify = req.param('classify') || '';
  var selectQuery;

  if(classify){
    selectQuery = "SELECT st_name AS name, st_location AS location, st_phoneNum AS phoneNum, st_class AS classify FROM stores " +
                  "WHERE st_class = '" + classify + "';";
  } else{
    selectQuery = "SELECT st_name AS name, st_location AS location, st_phoneNum AS phoneNum, st_class AS classify FROM stores;";
  }

  ORDER_Pool.getConnection(function(err, connection){
    connection.query(selectQuery, function(err, results){
      if(err){
        connection.release();
        res.send('[mGuideWay] : query getConnection Error');
      } else{
        connection.release();
        res.render('mGuideWay', {results:results});
      }
    });
  });
}

exports.mCheckTable = function(req, res){
  var emptyTable = 0;
  var connection;

  async.waterfall([
    function(cb){
      ORDER_Pool.getConnection(cb);
    },
    function(conn, cb){
      connection = conn;
      var queryGetEmptyCnt = "SELECT COUNT(*) AS emptyCnt FROM tableStatus WHERE ts_status = 'empty';";
      connection.query(queryGetEmptyCnt, cb);
    },
    function(result, info, cb){
      emptyTable = result[0].emptyCnt;
      var queryGetTableState = 
          "SELECT ts_tableNum AS tableNum, ts_status AS state, " + 
            "CASE ts_status " +
              "WHEN 'order' " +
                "THEN " + 
                  "IF( TIMEDIFF(ts_recentlyChange+INTERVAL 70 MINUTE, now()) > 0, " +
                    "TIMEDIFF(ts_recentlyChange+INTERVAL 70 MINUTE, now()), SEC_TO_TIME(3600) ) " +
          
              "WHEN 'have' " +
                "THEN " +
                  "IF( STRCMP(ts_beforeStatus, 'order'), " +
                    "IF( TIMEDIFF(ts_recentlyChange+INTERVAL 50 MINUTE, now()) > 0, " +
                      "TIMEDIFF(ts_recentlyChange+INTERVAL 50 MINUTE, now()), SEC_TO_TIME(1800) ), " +
                    "IF( TIMEDIFF(ts_recentlyChange+INTERVAL 30 MINUTE, now()) > 0, " +
                      "TIMEDIFF(ts_recentlyChange+INTERVAL 30 MINUTE, now()), SEC_TO_TIME(1800) ) " +
                  ") " +
          
              "WHEN 'add' " +
                "THEN " +
                  "IF( TIMEDIFF(ts_recentlyChange+INTERVAL 40 MINUTE, now()) > 0, " +
                    "TIMEDIFF(ts_recentlyChange+INTERVAL 40 MINUTE, now()), SEC_TO_TIME(2400) ) " +
          
              "WHEN 'clean' " +
                "THEN " +
                  "IF( TIMEDIFF(ts_recentlyChange+INTERVAL 5 MINUTE, now()) > 0, " +
                    "TIMEDIFF(ts_recentlyChange+INTERVAL 5 MINUTE, now()), SEC_TO_TIME(300) ) " +
          
              "WHEN 'empty' " +
                "THEN SEC_TO_TIME(0) " +
          
              "END AS waitTime " +
          "FROM tableStatus " +
          "ORDER BY waitTime;";

      connection.query(queryGetTableState, cb);
    }
  ],
  function(err, results){
    if(err){
      connection.release();
      res.send('[mCheckTable]: Error');
    } else{
      connection.release();
      //res.json({emptyTable: emptyTable, tableState: results});
      res.render('mCheckTable', {emptyTable: emptyTable, tableState: results});
    }
  });

}

exports.mBooking = function(req, res){
  res.render('mBooking');
}

exports.mTest = function(req, res){
  res.render('mTest');
}
// 15.02.02 임승한 추가
exports.mMain = function(req, res){
  res.render('mMain');
}
// 15.02.09 임승한 추가
exports.mProject = function(req, res){
  res.render('mProject');
}
exports.mGuideWayStart = function(req, res){
  res.render('mGuideWayStart');
}
exports.mGuideWayLocation = function(req, res){
  res.render('mGuideWayLocation');
}






/******************************************************************************
 * payment
 *****************************************************************************/

exports.charge = function(req, res){
  var orderID = req.body.orderID;
  var cardPayment = req.body.cardPayment;
  var cashPayment = req.body.cashPayment;

  var connection;

  async.waterfall([
    function(cb){
      ORDER_Pool.getConnection(cb);
    },
    function(conn, cb){
      connection = conn;
      // check total = cardPayment + cashPayment
      var queryGetTotal = "SELECT o_total AS total FROM orderList WHERE o_id = " + orderID + ";"
      connection.query(queryGetTotal, function(err, results){
        if(err){
          connection.release();
          res.json({result: 0, data: '[charge]: Error'});
          return;
        } else{
          if( results[0].total == cashPayment + cardPayment ){
            cb(null);
          } else{
            connection.release();
            res.json({result: 0, data: '[charge]: total(' + results[0].total + ') is not equal with cash+card'});
            return;
          }
        }
      });
    },
    function(cb){
      var queryUpdatePayment = "UPDATE orderList " + 
                               "SET o_cardPayment = " + cardPayment + ", o_cashPayment = " + cashPayment + 
                               "WHERE o_id = " + orderID + ";";

      connection.query(queryUpdatePayment, cb);
    },
    function(info, tmp, cb){
      var queryUpdateState = "UPDATE tableStatus SET ts_beforeStatus = ts_status, ts_status = 'empty', ts_recentlyChange = now() " +
                             "WHERE ts_tableNum IN (SELECT t_tableNum FROM tableList WHERE o_id = " + orderID + ");";

      connection.query(queryUpdateState, cb);
    }
  ],
  function(err, results){
    if(err){
      connection.release();
      res.json({result: 0, data: '[charge]: Error'});
    } else{
      connection.release();
      res.json({result: 1, data: '[charge]: Success'});
    }
  });

}































