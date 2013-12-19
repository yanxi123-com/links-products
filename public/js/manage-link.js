'use strict';
$(function() {
    var $m = $('#main');
    
    $("#new-link").dialog({
        autoOpen : false,
        height : 220,
        width : 500,
        modal : true,
        buttons : {
            "确定" : function() {
                var button = this;
                var link = {
                    collection : $m.data('collection'),
                    collectionId : $m.data('collection-id'),
                    groupId : $('#newLinkAreaId').val(),
                    text : $('#newLinkText').val(),
                    url : $('#newLinkUrl').val(),
                    image : $('#newLinkImage').val()
                };
                $.ajax('/manage/operation', {
                    type : 'POST',
                    data : {
                        action : "addLink",
                        link : link
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
            "取消" : function() {
                $(this).dialog("close");
            }
        },
        close : function() {

        }
    });
    $('.new-link').click(function() {
        $('#newLinkText').val('');
        $('#newLinkUrl').val('');
        $('#newLinkImage').val('');
        $('#newLinkAreaId').val($(this).data('area-id'));
        $("#new-link").dialog("open");
    });

    $("#delete-link").dialog({
        resizable : false,
        autoOpen : false,
        height : 180,
        modal : true,
        buttons : {
            "删 除" : function() {
                var button = this;
                var link = {
                    collection : $m.data('collection'),
                    collectionId : $m.data('collection-id'),
                    groupId : $('#deleteAreaId').val(),
                    id : $('#deleteLinkId').val()
                };
                $.ajax('/manage/operation', {
                    type : 'POST',
                    data : {
                        action : "deleteLink",
                        link : link
                    },
                    dataType : 'json',
                    success : function(json) {
                        if (json.error) {
                            return alert(json.error);
                        }

                        $('li[data-link-id=' + link.id + ']').remove();
                        $(button).dialog("close");
                    }
                });
            },
            "取 消" : function() {
                $(this).dialog("close");
            }
        }
    });
    $('.delete-link').click(function() {
        var linkId = $(this).parent().data('link-id');
        var areaId = $(this).parent().data('area-id');
        $('#deleteLinkId').val(linkId);
        $('#deleteAreaId').val(areaId);
        $("#delete-link").dialog("open");
    });

    $("#change-link").dialog({
        autoOpen : false,
        height : 220,
        width : 500,
        modal : true,
        buttons : {
            "确定" : function() {
                var button = this;
                var link = {
                    collection : $m.data('collection'),
                    collectionId : $m.data('collection-id'),
                    groupId : $('#changeLinkAreaId').val(),
                    id : $('#changeLinkId').val(),
                    text : $('#changeLinkText').val(),
                    url : $('#changeLinkUrl').val(),
                    image : $('#changeLinkImage').val()
                };
                $.ajax('/manage/operation', {
                    type : 'POST',
                    data : {
                        action : "changeLink",
                        link : link
                    },
                    dataType : 'json',
                    success : function(json) {
                        if (json.error) {
                            return alert(json.error);
                        }
                        var $li = $('li[data-link-id=' + link.id + ']');
                        var $link = $li.find('.current-link');
                        var $image = $li.find('.link-image');
                        $link.html(link.text);
                        $link.attr('href', link.url);
                        $image.attr('src', '//img.qiri.com' + link.image);

                        $(button).dialog("close");
                    }
                });
            },
            "取消" : function() {
                $(this).dialog("close");
            }
        },
        close : function() {

        }
    });
    $('.change-link').click(function() {
        var $li = $(this).parent();
        var $link = $li.find('.current-link');
        var linkId = $li.data('link-id');
        var $image = $li.find('.link-image');
        var areaId = $li.data('area-id');
        $('#changeLinkAreaId').val(areaId);
        $('#changeLinkId').val(linkId);
        $('#changeLinkText').val($link.html());
        $('#changeLinkUrl').val($link.attr('href'));
        var src = $image.attr('src');
        if ($image.attr('src')) {
            var domain = '/img.qiri.com';
            if (src.indexOf(domain) > -1) {
                src = src.substring(src.indexOf(domain) + domain.length);
            }
        }
        $('#changeLinkImage').val(src);
        $("#change-link").dialog("open");
    });

    $('ul.links').sortable({
        stop : function(e, ui) {
            var $li = $(ui.item);
            var groupId = $li.data('area-id');
            var $ul = $li.parent();
            var linkIds = $.map($ul.children(), function(child) {
                return $(child).data('link-id');
            });
            var link = {
                collection : $m.data('collection'),
                collectionId : $m.data('collection-id'),
                groupId : groupId,
                ids : linkIds,
            };
            $.ajax('/manage/operation', {
                type : 'POST',
                data : {
                    action : "sortLink",
                    link : link
                },
                dataType : 'json',
                success : function(json) {
                }
            });
        }
    });

    $("#new-area").dialog({
        autoOpen : false,
        height : 220,
        width : 500,
        modal : true,
        buttons : {
            "确定" : function() {
                var button = this;
                var group = {
                    collection : $m.data('collection'),
                    collectionId : $m.data('collection-id'),
                    title : $('#newAreaTitle').val(),
                    type : $('input[name=newAreaType]:radio:checked').val()
                };
                $.ajax('/manage/operation', {
                    type : 'POST',
                    data : {
                        action : "addLinkGroup",
                        group : group
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
            "取消" : function() {
                $(this).dialog("close");
            }
        },
        close : function() {
        }
    });
    $('.new-area').click(function() {
        $('#newAreaTitle').val('');
        $("#new-area").dialog("open");
    });

    $("#change-area").dialog({
        autoOpen : false,
        height : 260,
        width : 500,
        modal : true,
        buttons : {
            "确定" : function() {
                var button = this;
                var group = {
                    collection : $m.data('collection'),
                    collectionId : $m.data('collection-id'),
                    id : $('#changeAreaId').val(),
                    title : $('#changeAreaTitle').val(),
                    type : $('input[name=changeAreaType]:radio:checked').val()
                };
                $.ajax('/manage/operation', {
                    type : 'POST',
                    data : {
                        action : "changeLinkGroup",
                        group : group
                    },
                    dataType : 'json',
                    success : function(json) {
                        if (json.error) {
                            return alert(json.error);
                        }

                        $('#title-' + group.id).html(group.title);
                        $('.change-area[data-area-id=' + group.id + ']').data('area-type', group.type);
                        $(button).dialog("close");
                    }
                });
            },
            "取消" : function() {
                $(this).dialog("close");
            }
        },
        close : function() {
        }
    });
    $('.change-area').click(function() {
        var areaId = $(this).data('area-id');
        var areaType = $(this).data('area-type');
        $('#changeAreaId').val(areaId);
        $('#changeAreaTitle').val($('#title-' + areaId).html());
        $("#change-area").dialog("open");
        $('#changeAreaType').html(areaType);
        $('input[name=changeAreaType]').attr('checked', false);
    });

    $("#delete-area").dialog({
        resizable : false,
        autoOpen : false,
        height : 180,
        modal : true,
        buttons : {
            "删 除" : function() {
                var button = this;
                var group = {
                    collection : $m.data('collection'),
                    collectionId : $m.data('collection-id'),
                    id : $('#deleteAreaId').val()
                };
                $.ajax('/manage/operation', {
                    type : 'POST',
                    data : {
                        action : "deleteLinkGroup",
                        group : group
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
    $('.delete-area').click(function() {
        var areaId = $(this).data('area-id');
        $('#deleteAreaId').val(areaId);

        $("#delete-area").dialog("open");
    });

    $('ul.areas').sortable({
        stop : function(e, ui) {
            var $node = ui.item.parent();
            var areaIds = $.map($node.children(), function(child) {
                return $(child).data('id');
            });
            var group = {
                collection : $m.data('collection'),
                collectionId : $m.data('collection-id'),
                ids : areaIds
            };
            $.ajax('/manage/operation', {
                type : 'POST',
                data : {
                    action : "sortLinkGroup",
                    group : group
                },
                dataType : 'json',
                success : function(json) {
                }
            });
        }
    });
});
