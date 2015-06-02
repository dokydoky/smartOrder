// 캘린더 전역 변수  //
var id_value = null;
var date_value01 = null;
var date_value02 = null;


function positionInfo(object) {
  var p_elm = object;

  this.getElementLeft = getElementLeft;
  function getElementLeft() {
    var x = 0;
    var elm;
    if(typeof(p_elm) == "object"){
      elm = p_elm;
    } else {
      elm = document.getElementById(p_elm);
    }
    while (elm != null) {
      x+= elm.offsetLeft;
      elm = elm.offsetParent;
    }
    return parseInt(x);
  }
  this.getElementWidth = getElementWidth;
  function getElementWidth(){
    var elm;
    if(typeof(p_elm) == "object"){
      elm = p_elm;
    } else {
      elm = document.getElementById(p_elm);
    }
    return parseInt(elm.offsetWidth);
  }

  this.getElementRight = getElementRight;
  function getElementRight(){
    return getElementLeft(p_elm) + getElementWidth(p_elm);
  }

  this.getElementTop = getElementTop;
  function getElementTop() {
    var y = 0;
    var elm;
    if(typeof(p_elm) == "object"){
      elm = p_elm;
    } else {
      elm = document.getElementById(p_elm);
    }
    while (elm != null) {
      y+= elm.offsetTop;
      elm = elm.offsetParent;
    }
    return parseInt(y);
  }
this.getElementHeight = getElementHeight;
  function getElementHeight(){
    var elm;
    if(typeof(p_elm) == "object"){
      elm = p_elm;
    } else {
      elm = document.getElementById(p_elm);
    }
    return parseInt(elm.offsetHeight);
  }

  this.getElementBottom = getElementBottom;
  function getElementBottom(){
    return getElementTop(p_elm) + getElementHeight(p_elm);
  }
}
function CalendarControl() {

  var calendarId = 'CalendarControl';
  var currentYear = 0;
  var currentMonth = 0;
  var currentDay = 0;

  var selectedYear = 0;
  var selectedMonth = 0;
  var selectedDay = 0;

  var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  var dateField = null;

  function getProperty(p_property){
    var p_elm = calendarId;
    var elm = null;

    if(typeof(p_elm) == "object"){
      elm = p_elm;
    } else {
      elm = document.getElementById(p_elm);
    }
    if (elm != null){
      if(elm.style){
        elm = elm.style;
        if(elm[p_property]){
          return elm[p_property];
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
  }
  function setElementProperty(p_property, p_value, p_elmId){
    var p_elm = p_elmId;
    var elm = null;

    if(typeof(p_elm) == "object"){
      elm = p_elm;
    } else {
      elm = document.getElementById(p_elm);
    }
    if((elm != null) && (elm.style != null)){
      elm = elm.style;
      elm[ p_property ] = p_value;
    }
  }

  function setProperty(p_property, p_value) {
    setElementProperty(p_property, p_value, calendarId);
  }

  function getDaysInMonth(year, month) {
    return [31,((!(year % 4 ) && ( (year % 100 ) || !( year % 400 ) ))?29:28),31,30,31,30,31,31,30,31,30,31][month-1];
  }
  function getDayOfWeek(year, month, day) {
    var date = new Date(year,month-1,day)
    return date.getDay();
  }

  this.clearDate = clearDate;
  function clearDate() {
    dateField.value = '';
    hide();
  }

  this.setDate = setDate;
  function setDate(year, month, day) {
    if (dateField) {
      if (month < 10) {month = "0" + month;}
      if (day < 10) {day = "0" + day;}

      dateString = year+"-"+month+"-"+day;
      date_value = dateString;
      dateField.value = dateString;
      hide();

      value_function(date_value, id_value);
    }
    return;
  }
  this.changeMonth = changeMonth;
  function changeMonth(change) {
    currentMonth += change;
    currentDay = 0;
    if(currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    } else if(currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }

    calendar = document.getElementById(calendarId);
    calendar.innerHTML = calendarDrawTable();
  }

  this.changeYear = changeYear;
  function changeYear(change) {
    currentYear += change;
    currentDay = 0;
    calendar = document.getElementById(calendarId);
    calendar.innerHTML = calendarDrawTable();
  }

  function getCurrentYear() {
    var year = new Date().getYear();
    if(year < 1900) year += 1900;
    return year;
  }
  function getCurrentMonth() {
    return new Date().getMonth() + 1;
  }

  function getCurrentDay() {
    return new Date().getDate();
  }

  function calendarDrawTable() {

    var dayOfMonth = 1;
    var validDay = 0;
    var startDayOfWeek = getDayOfWeek(currentYear, currentMonth, dayOfMonth);
    var daysInMonth = getDaysInMonth(currentYear, currentMonth);
    var css_class = null; //CSS class for each day
    var table = "<table cellspacing='0' cellpadding='0' border='0'>";
    table = table + "<tr class='header'>";
    table = table + "  <td colspan='2' class='previous'><a href='javascript:changeCalendarControlMonth(-1);'>&lt;</a> <a href='javascript:changeCalendarControlYear(-1);'>&laquo;</a></td>";
    table = table + "  <td colspan='3' class='title'>" + currentYear +"/" + months[currentMonth-1] + "</td>";
    table = table + "  <td colspan='2' class='next'><a href='javascript:changeCalendarControlYear(1);'>&raquo;</a> <a href='javascript:changeCalendarControlMonth(1);'>&gt;</a></td>";
    table = table + "</tr>";
    table = table + "<tr><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr>";

    for(var week=0; week < 6; week++) {
      table = table + "<tr>";
      for(var dayOfWeek=0; dayOfWeek < 7; dayOfWeek++) {
        if(week == 0 && startDayOfWeek == dayOfWeek) {
          validDay = 1;
        } else if (validDay == 1 && dayOfMonth > daysInMonth) {
          validDay = 0;
        }

        if(validDay) {
          if (dayOfMonth == selectedDay && currentYear == selectedYear && currentMonth == selectedMonth) {
            css_class = 'current';
          } else if (dayOfWeek == 0 || dayOfWeek == 6) {
            css_class = 'weekend';
          } else {
            css_class = 'weekday';
          }

          table = table + "<td><a class='"+css_class+"' href=\"javascript:setCalendarControlDate("+currentYear+","+currentMonth+","+dayOfMonth+")\">"+dayOfMonth+"</a></td>";
          dayOfMonth++;
        } else {
          table = table + "<td class='empty'>&nbsp;</td>";
        }
      }
      table = table + "</tr>";
    }

    table = table + "<tr class='header'><th colspan='7' style='padding: 3px;'><a href='javascript:clearCalendarControl();'>Clear</a> | <a href='javascript:hideCalendarControl();'>Close</a></td></tr>";
    table = table + "</table>";

    return table;
  }
  this.show = show;
  function show(field) {

    // If the calendar is visible and associated with
    // this field do not do anything.
    if (dateField == field) {

      return;
    } else {
      dateField = field;
    }
    if(dateField) {
      try {
        var dateString = new String(dateField.value);
        var dateParts = dateString.split("/");

        selectedMonth = parseInt(dateParts[0],10);
        selectedDay = parseInt(dateParts[1],10);
        selectedYear = parseInt(dateParts[2],10);

      } catch(e) {}
    }

    if (!(selectedYear && selectedMonth && selectedDay)) {
      selectedMonth = getCurrentMonth();
      selectedDay = getCurrentDay();
      selectedYear = getCurrentYear();
    }

    currentMonth = selectedMonth;
    currentDay = selectedDay;
    currentYear = selectedYear;

    if(document.getElementById){

      calendar = document.getElementById(calendarId);
      calendar.innerHTML = calendarDrawTable(currentYear, currentMonth);

      setElementProperty('display', 'block', 'CalendarControlIFrame');
      setProperty('display', 'block');

      var fieldPos = new positionInfo(dateField);
      var calendarPos = new positionInfo(calendarId);

      var x = fieldPos.getElementLeft();
      var y = fieldPos.getElementBottom();

      setProperty('left', x + "px");
      setProperty('top', y + "px");
      setElementProperty('left', x + "px", 'CalendarControlIFrame');
      setElementProperty('top', y + "px", 'CalendarControlIFrame');
      setElementProperty('width', calendarPos.getElementWidth() + "px", 'CalendarControlIFrame');
      setElementProperty('height', calendarPos.getElementHeight() + "px", 'CalendarControlIFrame');
    }
  }
  this.hide = hide;
  function hide() {
    if(dateField) {
      setProperty('display', 'none');
      setElementProperty('display', 'none', 'CalendarControlIFrame');
      dateField = null;
    }
  }

  this.visible = visible;
  function visible() {
    return dateField
  }
}
var calendarControl = new CalendarControl();

function showCalendarControl(textField, click_id) {
  id_value = click_id; // 전역변수 id_value
  calendarControl.show(textField);
}

function clearCalendarControl() {
  calendarControl.clearDate();
}

function hideCalendarControl(flag) {
  if (calendarControl.visible()) {
    if (flag) {
      calendarControl.hide();
    } else {
      window.setTimeout('hideCalendarControl(true)',200);
    }
  }
}

function setCalendarControlDate(year, month, day) {
  calendarControl.setDate(year, month, day);
}

function changeCalendarControlYear(change) {
  calendarControl.changeYear(change);
}

function changeCalendarControlMonth(change) {
  calendarControl.changeMonth(change);
}
function test(value){
        var url_value = value;
        $.ajax({
                        type : "GET",
                        url: url_value,
            async: false,
            dataType:'json',
            success: response_json
            });
        }
function response_json(json) {
            var isNull = null;
            var information = null;
            var information = json.data;
            var count = "";
            var information_value1 = "";
            var information_value2 = "";
            var information_value3 = "";
            var information_count = information.length;
            var total = null;

        for(var i=0; i<information_count; i++){

        //내용물이 null값인지 아닌지 확인
        if(information[i].name==isNull){
                        information[i].name="";
        }
        if(information[i].sales==isNull){
            information[i].sales="";
        }
        if(information[i].category==isNull){
                information[i].category="";
        }

        count += (i+1) + '</br>';
        information_value1 += information[i].category + '</br>';
        information_value2 += information[i].name + '</br>';
        information_value3 += information[i].sales + '</br>';
        }

        $(".count").html('').append(count);
        $(".information_value1").html('').append(information_value1);
        $(".information_value2").html('').append(information_value2);
        $(".information_value3").html('').append(information_value3);
        }

function value_function(date_value, id_value){
 if(id_value == "view_date1"){
 date_value01 = date_value;
 }
 if(id_value == "view_date2"){
 date_value02 = date_value;
 test('bestMenuCount/' + date_value01 + '/' + date_value02 );

 }
}

document.write("<iframe id='CalendarControlIFrame' src='javascript:false;' frameBorder='0' scrolling='no'></iframe>");
document.write("<div id='CalendarControl'></div>");
