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
        joyo: function() {
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
				url: "http://s8.taobao.com/search?q=${keyword}&cat=0&pid=mm_16939787_0_0&mode=23&commend=1%2C2",
				charset: "GBK"
			});
		},
		tmall: function() {
			$form.attr('action', "http://www.tushucheng.com/book/3th-search.html");
            $q.attr("name", "keyword");
            resetParam({
				url: "http://s8.taobao.com/search?q=${keyword}&cat=0&pid=mm_16939787_0_0&mode=23&commend=1%2C2&tab=mall",
				charset: "GBK"
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
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-100604-11']);
_gaq.push(['_trackPageview']);
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();