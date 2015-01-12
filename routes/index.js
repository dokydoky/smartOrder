
// tablet
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

// mobile
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

// web
exports.index = function(req, res){
  res.render('index');
};

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

exports.stat = function(req, res){
  //var selectQuery = "SELECT menu, count(*) AS count FROM orderList GROUP BY menu;";
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
};

// mobile web
exports.mMenuFinder = function(req, res){
  var category = req.param('category') || '';
  var selectQuery = "";

  if(category){
    selectQuery = "select m.m_id AS id, m.m_name AS krName, m.m_enName AS enName, m.m_price AS price, m.m_picture AS picture, m.m_compose AS compose, c.c_name AS category from menu m, category c where m.m_catID = c.c_id and c.c_name = '" + category + "'";
  } else{
    selectQuery = "select m.m_id AS id, m.m_name AS krName, m.m_enName AS enName, m.m_price AS price, m.m_picture AS picture, m.m_compose AS compose, c.c_name AS category from menu m, category c where m.m_catID = c.c_id";
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

exports.mBusiness = function(req, res){
  res.render('mBusiness');
}

exports.mGuideWay = function(req, res){
  res.render('mGuideWay');
}

exports.mCheckTable = function(req, res){
  res.render('mCheckTable');
}

exports.mBooking = function(req, res){
  res.render('mBooking');
}

exports.m = function(req, res){
  res.render('m');
};


// menu
exports.menuFinder = function(req, res){
  var category = req.param('category') || '';
  var selectQuery = "";

  if(category){
    selectQuery = "select m.m_id AS id, m.m_name AS krName, m.m_enName AS enName, m.m_price AS price, m.m_picture AS picture, m.m_compose AS compose, c.c_name AS category from menu m, category c where m.m_catID = c.c_id and c.c_name = '" + category + "'";
  } else{
    selectQuery = "select m.m_id AS id, m.m_name AS krName, m.m_enName AS enName, m.m_price AS price, m.m_picture AS picture, m.m_compose AS compose, c.c_name AS category from menu m, category c where m.m_catID = c.c_id";
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

  var selectQuery1 = "select m.m_name AS krName, m.m_enName AS enName, m.m_price AS price, m.m_compose AS compose, m.m_detail AS detail, i.i_picture AS ingre_picture, i.i_krName AS ingre_krName, i.i_enName AS ingre_enName, i.i_detail AS ingre_detail, i.i_addTitle AS ingre_addTitle, i.i_addDetail AS ingre_addDetail from menu m left outer join ingredient i ON m.m_id = i.i_menuID where m.m_id = " + menuID + ";";
  var selectQuery2 = "select s.s_name AS side_name, s.s_picture AS side_picture from menu m left outer join connectMenues c ON m.m_id = c.menuID left outer join sideMenu s ON c.sidemenuID = s.s_id where  m.m_id = " + menuID + ";";

  console.log(selectQuery1);
  console.log(selectQuery2);

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












