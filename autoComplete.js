//====================================================================================================
// [插件名称] jQuery Intellisense AutoComplete
//----------------------------------------------------------------------------------------------------
//[使用方法]
//              场景1：$(obj).autoCmpt({url:"ajaxHandler.ashx?act=gethos"});url为你自定义的ajax处理程序页面地址
//          插件自动拼接当前文本框值得到如下url：ajaxHandler.ashx?act=gethos&v=***&pid=null 【注】pid为保留字
//
//              场景2：假如需要接别的参数，请在参数内予以指定，比如需要接一个ID为txtPro的值作为参数，则写成：
//          $(obj).autoCmpt({url:"ajaxHandler.ashx?act=gethos&proid="+$("#txtPro").val()});//假定proid=5，则：
//          同样，插件会向如下url发出请求ajaxHandler.ashx?act=gethos&proid=5&v=***&pid=null
//
//              场景3：如果出提示前，必须要依赖txtPro元素的有实际值，场景2可能会送个空值过去，则：
//          $(obj).autoCmpt({url:"ajaxHandler.ashx?act=gethos",parentID:"txtPro"});
//          此时，插件会判断拥有ID的元素是否为空值，为空则不发出请求。
//          如果符合条件，比如值为5，插件会生成如下url:
//          ajaxHandler.ashx?act=gethos&v=***&pid=5【pid用在此】
//
//          【注1】：本插件取该元素的qid属性传入。qid在选定智能提示结果的时候赋值
//          【修改：】传入hidden属性（一个form表单元素），可直接将qid赋值给hidden属性所代表的对象
//              $(obj).autoCmpt({url:url,hidden:$("#hiduid")});
//
//           【注2】写后台事件的时候，根据情况可能需要分别判断一下v和pid是否送了值过来
//
//           【注3】后台传回的数据请用多维数组的方式传回：
//            [
//                ["id1","name1","pingying","pid1"],
//                ["id2","name2","pingying","pid2"],
//                ["id3","name3","pingying","pid3"],
//                ["id4","name4","pingying","pid4"]
//            ]
//[源码下载]
//----------------------------------------------------------------------------------------------------
// [作    者] walkerwang
// [邮    箱] walkerwzy@gmail.com
// [作者博客] http://walkerwang.cnblogs.com
// [更新日期] 2011-09-02
// [版 本 号] ver0.4.1
//====================================================================================================
(function ($) {
    $.fn.autoCmpt = function (options) {
        var options = $.extend({}, $.fn.autoCmpt.defaults, options);

        var lastquery = ""; //上次请求的内容
        var cache_name = new Array(); //浏览器数据缓存
        var cache_length;

        var p = null; //智能提示对象
        if ($("#suggest").length < 1) p = $("<div/>", { "id": "suggest" }).appendTo("body"); //生成提示框
        else p = $("#suggest");

        $(this).live("focusin", function () { $(this).trigger("keyup"); if (options.multi) $(this).addClass("autoCmpt-multi"); if ($(options.hidden).length > 0) $(this).data("hid", $(options.hidden)); })
        //.val('')//避免刷新页面时出现旧值
		.attr('autocomplete', 'off')
        .live("focusout", function () {
            if (!p.data("show")) $("#suggest").hide(); //清除提示框
            if ($.trim($(this).val()) == "") setValue($(this), "", -1);
        })
        .live("keyup", function (event) {
            var obj = $(this);
            var k = event.keyCode;
            if ($("#suggest").is(":hidden")) {
                if ((k >= 65 && k <= 90) || k == 8 || k == 32 || (k >= 48 && k <= 57) || k == 186 || k == 222 || k == 40 || k == 46 || (typeof (k) == "undefined")) {
                    getSuggest(this);
                    return;
                }
            }
            else {
                //37:left,39:right;40:down,38:up,27:esc,9:tab
                if (k == 39) k = 40;
                if (k == 37) k = 38;
                if (k == 9) k = 27;
                var curobj;
                switch (k) {
                    case 40: //down
                        var o = $(".highlight");
                        var v;
                        if (o.length == 0) {
                            curobj = $("#suggest p:first");
                            v = curobj.addClass("highlight").find(".sname").html();
                        } else {
                            curobj = o.eq(0).removeClass("highlight").next("p");
                            v = curobj.addClass("highlight").find(".sname").html();
                            if (v == null) {
                                curobj = $("#suggest p:first");
                                v = curobj.addClass("highlight").find(".sname").html();
                                $("#moreSuggest").removeClass("highlight");
                            }
                        }
                        id = curobj.attr("sid");
                        setValue(obj, v, id);
                        break;
                    case 38: //up
                        var o = $(".highlight");
                        var v;
                        if (o.length == 0) {
                            curobj = $("#suggest p:last");
                            v = curobj.addClass("highlight").find(".sname").html();
                        } else {
                            curobj = o.filter(":last").removeClass("highlight").prev("p");
                            v = curobj.addClass("highlight").find(".sname").html();
                        }
                        if (v == null) {
                            curobj = $("#suggest p:last").removeClass("highlight").prev("p");
                            v = curobj.addClass("highlight").find(".sname").html();
                        }
                        id = curobj.attr("sid");
                        setValue(obj, v, id);
                        break;
                    case 27: //escape
                        obj.val("");
                        $("#suggest").hide();
                        break;
                    case 13: //enter
                        //$("#btn_Query").click();
                        //return false;
                        break;
                    default:
                        if ((k >= 65 && k <= 90) || k == 8 || k == 32 || (k >= 48 && k <= 57) || k == 186 || k == 222 || k == 40) {
                            getSuggest(this);
                        }
                        break;
                }

            }
        });
        function setValue(obj, v, id) {
            if (v == "更多...") return;
            obj.val(v).attr("qid", id);
            if (obj.data("hid") != undefined) obj.data("hid").val(id);
        }

        function getSuggest(obj) {
            var t = $(obj);
            t.attr("qid", -1);
            if (t.data("hid") != undefined) t.data("hid").val(-1);
            if (t.data("xmlhttp")) t.data("xmlhttp").abort(); //假如有之前的请求存在，则手动停止它
            var o = t.offset();
            var h = t.height();
            var v = t.val().replace(/[\s',，|\\\/。;；]/, ''); //去无意义字符
            if (!options.emptyRequest && v == '') return; //请求关键词为空是否阻止提交
            if (options.parentID != 'null') {//设置为依赖父ID，则强制检测和更改URL
                var pe = $("#" + options.parentID);
                var pev = pe.val();
                if (!options.usePrentValue) pev = pe.attr("qid") || -1; //如果设置为不使用元素value（默认），则取其qid值，无值则设为-1;
                if (pev == '' || pev == -1) return; //要求父ID，父ID为空，则拒绝提交
            }
            //if (t.is(".autoCmpt-q-last") && v == lastquery) { p.show(); return; } //与最后一次请求的发起者和内容相同，直接显示内容
            $(".autoCmpt-q-last").removeClass("autoCmpt-q-last");
            var url = options.url;
            var x = $.get(encodeURI(url), { t: new Date().getMilliseconds(), v: v, pid: pev }, function (data) {
                t.removeData("xmlhttp"); //清除ajax请求的xmlHttpRequest对象
                t.addClass("autoCmpt-q-last"); //标识是最后一个发出请求的元素
                var names = eval(data);
                var l = $(names).length;
                if (l < 1) {
                    $("#suggest").hide();
                    return;
                }
                cache_name = names;
                cache_length = l;
                appendElements(l, names);
                lastquery = v;
                p.css({ left: o.left, top: o.top + h }).width(options.width).show();
            });
            t.data("xmlhttp", x); //保存当前ajax请求的xmlHttpRequest对象
        }

        $("#moreSuggest").live("mouseup", function () {
            var d = $("#moreSuggest").data("datas");
            if (d == undefined) return;
            appendElements(d.length, d.names);
            $(".autoCmpt-q-last").eq(0).focus();
        });

        //生成提示元素的公用方法
        function appendElements(lengh, names) {
            var left = 0;
            var n = 10;
            var multiColumn = $(".autoCmpt-q-last").hasClass("autoCmpt-multi");
            if (multiColumn) {
                n = 32;
            }
            p.empty();
            for (var i = 0; i < n && i < lengh; i++) {
                p.append("<p sid=\"" + $(names)[i][0] + "\" pid=\"" + $(names)[i][3] + "\"><span class=\"inputcode\">" + $(names)[i][2] + "</span><span class=\"sname\">" + $(names)[i][1] + "</span></p>");
            }
            if (lengh > n) {
                left = lengh - n;
                p.append("<p id=\"moreSuggest\" sid=\"-1\">更多...</p>");
                $("#moreSuggest").data("datas", { length: left, names: names.slice(9) });
            }
            if (multiColumn && lengh > 10) {
                p.find("p").addClass("narrow");
                p.find(".inputcode").hide();
            }
            else {
                $(".narrow").removeClass("narrow");
                p.find(".inputcode").show();
            }
            p.prepend("<div class='sugtips'>输入中文/拼音首字母或方向键选择</div>");
            p.show();
        }

        $("#suggest p").live("mouseover", function () {
            $(".highlight").removeClass("highlight");
            $(this).addClass("highlight");
            p.data("show", true); //避免触发源失焦造成提示窗口消失
        })
        .live("mouseout", function () {
            $(this).removeClass("highlight");
            p.data("show", false);
        })
        .live("click", function () {
            var obj = $(".autoCmpt-q-last");
            var v = $(this).find(".sname").html();
            var id = $(this).attr("sid");
            setValue(obj, v, id);
            p.data("show", false);
            p.hide();
        });


    };

    //默认值
    $.fn.autoCmpt.defaults = {
        url: "ajaxHandler.ashx?act=hos", //ajax请求的地址
        emptyRequest: true, //是否允许关键词为空也提交
        parentID: 'null', //给定父元素ID，则建立了强关联，该父元素无值则不会提交
        usePrentValue: false, //如果上面给定了parentID，此项默认使用其qid值，否则使用其value值
        multi: false, //是否一列提示多个
        hidden: "", //关联的表单控件，如hidden或textbox，含有val属性即可，可以是DOM元素，或jQuery对象
        width: 224//默认宽度
    }
})(jQuery);