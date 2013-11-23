/* avoid be iframed */
//top.location == self.location || (top.location = self.location);

$(function(){
    var $q = $('#q');
    var $form = $('#J_TSearchForm');
    
    var resetParam = function(paraMap) {
        $form.find("input[type=hidden]").remove();
		
		paraMap = paraMap || {};
		$.each(paraMap, function(key, value) {
			$form.append('<input type="hidden" name="' + key + '" value="' + value + '"/>');
		});
    };
    
    var searchHandlers = {
        amazon: function() {
            $form.attr('action', "http://www.amazon.cn/s/ref=nb_sb_noss");
            $q.attr("name", "field-keywords");
            resetParam({
				url: "search-alias=aps",
				tag: "qiri-23"
			});
        },
		taobao: function() {
			$form.attr('action', "http://www.tushucheng.com/book/3th-search.html");
            $q.attr("name", "keyword");
            resetParam({
				url: "http://s8.taobao.com/search?q=${keyword}&cat=0&pid=mm_16939787_3205606_14630046&mode=23&commend=1%2C2",
				charset: "GBK"
			});
		},
        lefeng: function() {
            $form.attr('action', "http://www.tushucheng.com/book/3th-search.html");
            $q.attr("name", "keyword");
            resetParam({
                url: "http://track.lefeng.com/track.jsp?aid=1581482&cid2=qiri-search&url=http://search.lefeng.com/search/search?key=${keyword}",
                charset: "UTF-8"
            });
        }
    };
    
    $form.submit(function(){
        var handler = searchHandlers[$(this).attr("name")];
        handler && handler();
    });
    
    $('#J_TSearchTabs li').click(function(){
		if($(this).attr('name') == "nosearch") {
			return;
		}
	
        $(this).addClass("tsearch-tabs-active").siblings(".tsearch-tabs-active").removeClass("tsearch-tabs-active");
        $q.focus();
        $form.attr("name", $(this).attr("name"));
        return false;
    });
});


/* GA */
(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments);
    }, i[r].l = 1 * new Date();
    a = s.createElement(o), m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
ga('create', 'UA-100604-11', 'qiri.com');
ga('send', 'pageview');

/* taobao */
(function(win,doc){
    var s = doc.createElement("script"), h = doc.getElementsByTagName("head")[0];
    if (!win.alimamatk_show) {
        s.charset = "gbk";
        s.async = true;
        s.src = "http://a.alimama.cn/tkapi.js";
        h.insertBefore(s, h.firstChild);
    };
    var o = {
        pid: "mm_16939787_3205606_11328124",/*推广单元ID，用于区分不同的推广渠道*/
        appkey: "",/*通过TOP平台申请的appkey，设置后引导成交会关联appkey*/
        unid: "qiri"/*自定义统计字段*/
    };
    win.alimamatk_onload = win.alimamatk_onload || [];
    win.alimamatk_onload.push(o);
})(window,document);
