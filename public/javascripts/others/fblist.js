$(document).ready(function () {

    getFb = function () {
        var getFbUrl = "https://graph.facebook.com/koreaoutback/posts?limit=15&" + fbAccessToken;
        var profilePictureUrl = "";
        //console.log('getFbUrl: ' + getFbUrl);

        $.ajax({
            url: "https://graph.facebook.com/koreaoutback/picture",
            dataType: 'jsonp',
            type: "GET",
            success: function (pPicture) {
                profilePictureUrl = pPicture.data.url;
            }
        });
        $.ajax({
            url: getFbUrl,
            dataType: 'jsonp',
            type: "GET",
            success: function (posts) {
                //console.log('success');
                if (posts.paging == undefined) {
                    $("<p class='id-time'>데이터가 없습니다.</p>").appendTo("#fbcontents");
                } else {
                    var html = "";
                    var i = 0;
                    $.each(posts.data, function (idx, data) {
                        var contents = data.message;
                        var link = data.link;
                        var created_time = data.created_time;
                        var user_name = data.from.name;
                        var imgurl = ""

                        //link = link.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi,'<a href="$1" target="_blank" rel="nofollow">$1<\/a>');
                        if (i > 2) {
                            return false;
                        }
                        if (contents == undefined) {
                            contents = data.description;
                        }
                        if (contents == undefined) {
                            return true;
                        }
                        if (link == undefined) {
                            link = "http://www.facebook.com/koreaoutback";
                        }
                        if (contents.length > 80) {
                            contents = contents.substring(0, 60) + "...";
                        }
                        /* 디자인 적용 시작*/
                        html = html + ""

							    + "<li>"
								    + "<a href='" + link + "' target='parent' title='새창으로 열기'>"
									    + contents
								    + "</a>"
							    + "</li>";


                        /* 디자인 적용  끝*/
                        //$("#twitter").children("dd").last().addClass("last");
                        i = i + 1;
                    });
                    $("#fbcontents").html(html);
                }
            },
            error: function () {
                //console.log('error');                    
            },
            complete: function () {
                //console.log('completed');                    
            }
        });



    };

    getFbAccessToken = function () {
        var tkurl = '/inc/common/getAT.asp';
        var xhr;
        $.ajax({
            url: tkurl,
            dataType: 'text',
            type: "GET",
            success: function (data) {

                fbAccessToken = data;
                getFb();
            }
        });
        /*
        xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onreadystatechange = function () {
        if (this.status == 200 && this.readyState == 4) {
        //alert("XMLHttpRequest:::"+this.responseText);
        fbAccessToken = this.responseText;
        getFb();
        }
        };
        xhr.send();
        */

    }


});
$(function () {
    getFbAccessToken();

});