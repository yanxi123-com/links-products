'use strict';
$(function() {
    $("#change-page").dialog({
        resizable : false,
        autoOpen : false,
        height : 220,
        width : 500,
        modal : true,
        buttons : {
            "确定" : function() {
                var button = this;
                var page = {
                    id : $('#pageId').val(),
                    name: $('#changePageName').val(),
                    title : $('#changePageTitle').val()
                };
                $.ajax('/manage/operation', {
                    type : 'POST',
                    data : {
                        action : "changePage",
                        page : page
                    },
                    dataType : 'json',
                    success : function(json) {
                        if (json.error) {
                            return alert(json.error);
                        }
                        $(button).dialog("close");
                        location = document.location;
                    }
                });
            },
            "取 消" : function() {
                $(this).dialog("close");
            }
        }
    });
    $('.change-page').click(function() {
        $("#change-page").dialog("open");
    });
});
