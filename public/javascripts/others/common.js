function opnLogin() {
    lyPopGet.lyEngine({
        //pop_membership_join_login.aspx
        obj: '/popup/pop_membership_join_login.aspx?dt='+(new Date()).getTime()+' #pop_wrap2'
			, container: 'lyContainer'
			, anchor: this.id
			, closeClass: 'close'
			, width: 340
			, height: 480
			, overlayColor: '#000'
			, overlayOpacity: 80
			, overlayClose: false
			, callbackSt: function () {
			    formUi.init();
			    $('#chk').click(function () {
			        $(this).parent.removeClass('act');
			    });

			    if (getCookie("SavedId") != "") {
			        $('#userid').val(getCookie("SavedId"));
			        $("#userid").addClass("act");
			        $("#userpw").addClass("act");
			        $("#userpw").focus();
			        $("#chk1").parent().addClass("act");
			        $("#chk1").prop("checked", true);
			    }
			    lyPopUi.commonLogin('#pop_wrap2', '#userid', '#userpw'); // 로그인 팝업 UI(공통)
			},
        callbackEd: function () {
            // ...
        }
    }) // (e) lyEngine
}

//메인 (fnva_agreement)
function opnMain() {
    /*var currentTime = new Date();
    var month = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();
    if (month < 10) {
        month = "0" + month;
    }
    var today = year + "" + month + "" + day;
    if (today < 20140415) {*/
        lyPopGet.lyEngine({
            obj: '/popup/pop_main.aspx #pop_wrap'
			    , container: 'lyContainer'
			    , anchor: this.id
			    , closeClass: 'close'
			    , width: 1040
			    , height: 629
			    , overlayColor: '#000'
			    , overlayOpacity: 80
			    , overlayClose: true
                , conx: 1040
                , minx: 1040
                , cony: 629
			    , callbackSt: function () {
			    },
            callbackEd: function () {
                // ...
            }
        }) // (e) lyEngine
    /*}*/
}

function getCookie(Name) {
    var search = Name + "="
    if (document.cookie.length > 0) {  //  쿠키가  설정되어  있다면
        offset = document.cookie.indexOf(search)
        if (offset != -1) {  //  쿠키가  존재하면
            offset += search.length
            //  set  index  of  beginning  of  value
            end = document.cookie.indexOf(";", offset)
            //  쿠키 값의  마지막  위치  인덱스  번호  설정
            if (end == -1)
                end = document.cookie.length
            return unescape(document.cookie.substring(offset, end))
        }
    }
    return "";
}

function alertLogin() {
    if(confirm('로그인 후 이용하실 수 있습니다.\n로그인 하시겠습니까?')){
        opnLogin();
    }
}


//회원약관 (fnva_agreement)
function popAgreement(){
    lyPopGet.lyEngine({
        obj: '/popup/pop_mobile_member_conditions.aspx #pop_wrap2'
			, container: 'lyContainer'
			, anchor: this.id
			, closeClass: 'close'
			, width: 680
			, height: 540
			, overlayColor: '#000'
			, overlayOpacity: 80
			, overlayClose: false
			, callbackSt: function () {
			},
        callbackEd: function () {
            // ...
        }
    }) // (e) lyEngine
}

//개인정보취급방침 (fnav_privacy)
function popPrivacy() {
    lyPopGet.lyEngine({
        obj: '/popup/pop_mobile_personal_info.aspx #pop_wrap2'
			, container: 'lyContainer'
			, anchor: this.id
			, closeClass: 'close'
			, width: 580
			, height: 640
			, overlayColor: '#000'
			, overlayOpacity: 80
			, overlayClose: false
			, callbackSt: function () {
			},
        callbackEd: function () {
            // ...
        }
    }) // (e) lyEngine
}

function alertFBByNonMember(url, rtn) {
    alert('부메랑클럽 가입을 위해서는 본인인증 후, 추가정보 입력과정이 필요합니다.');
    location.href = rtn;
}

function alertFBByNonBoomerang(url, rtn) {
    alert('부메랑클럽 회원만 이용이 가능합니다.\n부메랑클럽 가입을 위해서는 본인인증 후, 추가정보 입력과정이 필요합니다.');
    location.href = rtn;
}