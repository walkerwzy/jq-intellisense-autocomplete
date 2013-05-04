//----------------------------------------------------------------------------------------------------
// [作    者] walkerwang
// [邮    箱] walkerwzy@gmail.com
// [作者博客] http://walkerwang.cnblogs.com
// [更新日期] 2013-3-11
// [版 本 号] ver0.1.1
// [使用说明]
// $(element).dragable(options)
// options.namespace(string):命名空间，有默认值
// options.outer(boolean)：是否允许弹窗超出屏幕范围，默认不允许
// options.offset({left:0,right:0,top:0,bottom:0})：元素与窗体四边的边距，outer=true时才生效
// options.handler(string/dom/jQuery object):拖动手柄，即元素内的某个元素点击才会触发拖动事件，默认为null，支持css选择器、DOM元素，jQuery对象
//=====================================================================================
(function ($) {
    $.fn.dragable = function (conf) {
        var options = $.extend(true, {}, $.fn.dragable.defaults, conf),
		el = options.namespace + "_onmove",
        outer = options.namespace + "_outer";
        $(this).each(function (i, m) {
            var t = $(this), o = $(this);
            if (options.handler) o = $(options.handler, this);
            o.die('mousedown').live('mousedown', function (e) {
                t.data('position', { offset: o.offset(), eventx: e.pageX, eventy: e.pageY }).addClass(el);
                if (options.outer) t.addClass(outer);
            }).css('cursor', 'move');;
        });
        $("*").die("mousemove").die("mouseup")
		.live('mousemove', function (e) {
		    var m = $("." + el);
		    if (m.length == 0) return;
		    var mdata = m.data('position'), x, y;
		    if (m.is('.' + outer)) {
		        x = e.pageX - (mdata.eventx - mdata.offset.left);
		        y = e.pageY - (mdata.eventy - mdata.offset.top);
		    }
		    else {
		        x = Math.max(0 + options.offset.left, e.pageX - (mdata.eventx - mdata.offset.left)),
                y = Math.max(0 + options.offset.top, e.pageY - (mdata.eventy - mdata.offset.top)),
                wx = $(window).width() - m.width() - options.offset.right,
                wy = $(window).height() - m.height() - options.offset.bottom;
		        if (x > wx) x = wx;
		        if (y > wy) y = wy;
		    }
		    m.css({ position: 'absolute', left: x, top: y, margin: 0 });
		})
		.live('mouseup', function (e) {
		    $("." + el).removeClass(el);
		});
    };
    $.fn.dragable.defaults = {
        namespace: "mydragableplug",
        offset: { top: 0, bottom: 0, left: 0, right: 0 },
        handler: null,
        outer: false
    };
})(jQuery);