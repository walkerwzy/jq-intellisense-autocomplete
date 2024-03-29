﻿//====================================================================================================
// [插件名称] jQuery Intellisense AutoComplete
//----------------------------------------------------------------------------------------------------
//[使用方法]
//              场景1：$(obj).autoCmpt({url:"ajaxHandler.ashx?act=gethos"});url为你自定义的ajax处理程序页面地址
//          插件自动拼接当前文本框值得到如下url：ajaxHandler.ashx?act=gethos&key=***&pid=null 【注】pid为保留字
//
//              场景2：假如需要接别的参数，请在参数内予以指定，比如需要接一个ID为txtPro的值作为参数，则写成：
//          $(obj).autoCmpt({url:"ajaxHandler.ashx?act=gethos&proid="+$("#txtPro").val()});//假定proid=5，则：
//          同样，插件会向如下url发出请求ajaxHandler.ashx?act=gethos&proid=5&key=***&pid=null
//
//              场景3：如果出提示前，必须要依赖txtPro元素的有实际值，场景2可能会送个空值过去，则：
//          $(obj).autoCmpt({url:"ajaxHandler.ashx?act=gethos",parentID:"txtPro"});
//          此时，插件会判断拥有ID的元素是否为空值，为空则不发出请求。
//          如果符合条件，比如值为5，插件会生成如下url:
//          ajaxHandler.ashx?act=gethos&key=***&pid=5【pid用在此】
//
//          【注1】：本插件取该元素的qid属性传入。qid在选定智能提示结果的时候赋值
//          【修改：】传入hidden属性（一个form表单元素），可直接将qid赋值给hidden属性所代表的对象
//              $(obj).autoCmpt({url:url,hidden:$("#hiduid")});
//              此时传递到后台的仍然是qid，要取hidden元素的值请自行request，本插件只保证了hidden元素的值与qid一致
//
//           【注2】写后台事件的时候，根据情况可能需要分别判断一下key和pid是否送了值过来
//
//           【注3】后台传回的数据请用多维数组的方式传回：
//            [
//                ["id1","name1","pingying","pid1"],
//                ["id2","name2","pingying","pid2"],
//                ["id3","name3","pingying","pid3"],
//                ["id4","name4","pingying","pid4"]
//            ]
//           【注4】之前Url传参的关键字参数v在这一版已经改成了key，如果用此版升级老版请注意
//[源码下载]
//----------------------------------------------------------------------------------------------------
// [作    者] walkerwang
// [邮    箱] walkerwzy@gmail.com
// [作者博客] http://walkerwang.cnblogs.com
// [更新日期] 2013-03-30
// [版 本 号] ver0.5.1
// 修订历史：
// 0.4.3
// 重复注册事件bug的修复
// 0.5.1
// 大量修改了代码
// 每个元素拥有自己的最后一次查询结果的缓存
// 一行显示多个结果时强制截断过长的字符，用title显示全部字符
//====================================================================================================
(function ($) {
    $.ajaxSetup({ cache: false });
    $.fn.autoCmpt = function (option) {
        var options = $.extend({}, $.fn.autoCmpt.defaults, option);

        var p = null; //智能提示框
        if ($("#suggest").length < 1) p = $("<div/>", { "id": "suggest" }).appendTo("body"); //生成提示框
        else p = $("#suggest");

        $(this).each(function () {
            $(this).live("focusin", function () {
                $(this).trigger("keyup");
                if (options.multi) $(this).addClass("autoCmpt-multi");
                if ($(options.hidden).length > 0) $(this).data("hid", $(options.hidden));
            })
                //.val('')//避免刷新页面时出现旧值
                .attr('autocomplete', 'off')
                .addClass("txt_auto")
                .live("focusout", function () {
                    if (!p.data("show")) $("#suggest").hide(); //清除提示框
                    if ($.trim($(this).val()) == "") setValue($(this), "", -1);
                })
                .live("keyup", function (event) {
                    var obj = $(this);
                    var k = event.keyCode;
                    if ($("#suggest").is(":hidden")) {
                        if ((k >= 65 && k <= 90) || k == 8 || k == 32 || (k >= 48 && k <= 57) || k == 186 || k == 222 || k == 40 || k == 46) {
                            getSuggest(this);
                            return;
                        }
                        if ((typeof (k) == "undefined")) {
                            getSuggest(this, true);
                            return;
                        }
                    } else {
                        //37:left,39:right;40:down,38:up,27:esc,9:tab
                        if (k == 39) k = 40;
                        if (k == 37) k = 38;
                        if (k == 9) k = 27;
                        var curobj, o, v;
                        switch (k) {
                            case 40:
                                //down
                                o = $(".highlight");
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
                            case 38:
                                //up
                                o = $(".highlight");
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
                            case 27:
                                //escape
                                obj.val("");
                                $("#suggest").hide();
                                break;
                            case 13:
                                //enter
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
        });
        function setValue(obj, v, id) {
            if (v == "更多...") return;
            obj.val(v).attr("qid", id);
            //obj.data("hid")指向了关联的hidden元素
            if (obj.data("hid") != undefined) obj.data("hid").val(id);
        }

        /*
        * obj:当前文本框
        * clear:表示要不要在提示前保留obj的各种值属性，比如qid
        */
        function getSuggest(obj, clear) {
            var t = $(obj);
            if (!clear) {
                t.attr("qid", -1);//一得到焦点qid和关联hidden元素就清零，不太适用，暂时关闭
                if (t.data("hid") != undefined) t.data("hid").val(-1);
            }
            if (t.data("xmlhttp")) t.data("xmlhttp").abort(); //假如有之前的请求存在，则手动停止它
            var o = t.offset(),
                h = t.height(),
                v = t.val().replace(/[\s',，|\\\/。;；]/, ''), //去无意义字符
                pev = null;
            if (!options.emptyRequest && v == '') return; //请求关键词为空是否阻止提交
            if (options.parentID != 'null') {//设置为依赖父ID，则强制检测和更改URL
                var pe = $("#" + options.parentID);
                pev = pe.val();
                if (!options.usePrentValue) pev = pe.attr("qid") || -1; //如果设置为不使用元素value（默认），则取其qid值，无值则设为-1;
                if (pev == '' || pev == -1) return; //要求父ID，父ID为空，则拒绝提交
            }
            //判断该元素的请求是否与上次相同，如果是则从缓存里取出内容
            var cachedData = t.data('caches');
            if (typeof cachedData != 'undefined' && cachedData.datas && cachedData.query == v) {
                appendElements(cachedData.datas);
                $(".autoCmpt-q-last").removeClass("autoCmpt-q-last");
                //标识是最后一个发出请求的元素
                t.addClass("autoCmpt-q-last");
                p.css({ left: o.left, top: o.top + h }).width(options.width).show();
                return;
            }
            var url = options.url;
            //如果服务器接的参数名不是key和pid，请于此处更改
            var x = $.get(encodeURI(url), { key: v, pid: pev }, function (data) {
                t.removeData("xmlhttp"); //清除ajax请求的xmlHttpRequest对象
                t.addClass("autoCmpt-q-last"); //标识是最后一个发出请求的元素
                var d = eval(data);
                if (d.length < 1) {
                    $("#suggest").hide();
                    return;
                }
                t.data('caches', { datas: d, query: v });
                appendElements(d);
                //标识是最后一个发出请求的元素
                $(".autoCmpt-q-last").removeClass("autoCmpt-q-last");
                t.addClass("autoCmpt-q-last");
                p.css({ left: o.left, top: o.top + h }).width(options.width).show();
            });
            t.data("xmlhttp", x); //保存当前ajax请求的xmlHttpRequest对象
        }

        $("#moreSuggest").die("mouseup").live("mouseup", function () {
            var d = $("#moreSuggest").data("datas");
            if (d == undefined) return;
            appendElements(d);
            $(".autoCmpt-q-last").eq(0).focus();
        });

        //生成提示元素的公用方法
        function appendElements(datas) {
            if (!$.isArray(datas)) return;
            var left = 0,
                n = 10,
                multiColumn = $(".autoCmpt-q-last").hasClass("autoCmpt-multi"),
                length = datas.length;
            if (multiColumn) {
                n = 32;
            }
            p.empty();
            for (var i = 0; i < n && i < length; i++) {
                p.append("<p sid=\"" + datas[i][0] + "\" pid=\"" + datas[i][3] + "\"><span class=\"inputcode\">" + datas[i][2] + "</span><span class=\"sname\">" + datas[i][1] + "</span></p>");
            }
            if (length > n) {
                p.append("<p id=\"moreSuggest\" sid=\"-1\">更多...</p>");
                $("#moreSuggest").data("datas", datas.slice(n - 1));
            }
            if (multiColumn && length > 10) {
                p.find("p").addClass("narrow")
                 .find(".inputcode").hide()
                 .end()
                 .find(".sname").attr('title', function () { return $(this).text(); })
            }
            else {
                $(".narrow").removeClass("narrow");
                p.find(".inputcode").show();
            }
            p.prepend("<div class='sugtips'>输入中文/拼音首字母或方向键选择</div>")
             .show();
        }

        $("#suggest p").die("mouseover").live("mouseover", function () {
            $(".highlight").removeClass("highlight");
            $(this).addClass("highlight");
            p.data("show", true); //避免触发源失焦造成提示窗口消失
        })
        .die("mouseout").live("mouseout", function () {
            $(this).removeClass("highlight");
            p.data("show", false);
        })
        .die("click").live("click", function () {
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
    };
})(jQuery);