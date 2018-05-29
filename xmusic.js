define("js/common/dialog.js", function(t) {
	var i = t("js/common/music.js"),
		o = i.$,
		o = (t("js/common/music/lib/base.js"), i.$);
	doc = document, Tips = t("js/common/music/tips.js");
	var n = Tips.extend({
			attrs: {
				id: Tips.guid("divdialog_"),
				_dialog_tpl: function(t) {
					{
						var i, o = "";
						Array.prototype.join
					}
					return o += "", o += "iframe" != t.mode ? '\r\n	<div class="popup__hd">\r\n		<h2 class="popup__tit">' + (null == (i = t.title) ? "" : i) + '</h2>\r\n		<a href="javascript:;" class="popup__close" title="关闭"><i class="popup__icon_close"></i><i class="icon_txt">关闭</i></a>\r\n	</div>\r\n' : '\r\n	<div class="popup__hd">\r\n		<h2 class="popup__tit">' + (null == (i = t.title) ? "" : i) + '</h2>\r\n	</div>\r\n	<a href="javascript:;" class="popup__close" title="关闭"><i class="popup__icon_close"></i><i class="icon_txt">关闭</i></a>\r\n', o += '\r\n	<div class="popup__bd ' + (null == (i = t.popup__bd_class) ? "" : i) + '" id="dialogbox">\r\n		' + (null == (i = t.content) ? "" : i) + "\r\n	</div>\r\n", "iframe" != t.mode && "bigpage" != t.mode && (o += '\r\n	<div class="popup__ft">\r\n		' + (null == (i = t.outtips) ? "" : i) + "\r\n	</div>\r\n"), o += ""
				},
				_content_tpl: function(t) {
					{
						var i, o = "";
						Array.prototype.join
					}
					return o += '	<div class="popup__bd_inner">\r\n		<div class="popup__icon_tips ' + (null == (i = t.class_icon) ? "" : i) + '"></div>\r\n		<h3 class="popup__subtit ' + (null == (i = t.class_single) ? "" : i) + '">' + (null == (i = t.sub_title) ? "" : i) + '</h3>\r\n		<p class="popup__desc">' + (null == (i = t.desc) ? "" : i) + "</p>\r\n	</div>"
				},
				tpl_outtips: function(t) {
					{
						var i, o = "";
						Array.prototype.join
					}
					return o += '	<button style="display:' + (null == (i = t.button_display1) ? "" : i) + ';" class="' + (null == (i = t.button_class1) ? "" : i) + ' upload_btns__item js-button1">' + (null == (i = t.button_title1) ? "" : i) + '</button>\r\n	<button style="display:' + (null == (i = t.button_display2) ? "" : i) + ';" class="' + (null == (i = t.button_class2) ? "" : i) + ' upload_btns__item js-button2">' + (null == (i = t.button_title2) ? "" : i) + "</button>"
				},
				_timerScroll: null,
				_timerTips: null,
				objArg: null
			},
			initialize: function(t) {
				n.superclass.initialize.call(this, t), Tips.getElementInBody(this.get("id"))
			},
			show: function(t) {
				o("body").css({
					overflowY: "hidden"
				});
				var i = this,
					n = "mod_popup" + (t.dialogclass ? " " + t.dialogclass : "");
				Tips.getElementInBody(this.get("id"), {
					"class": n,
					"data-aria": "popup"
				});
				var s = {
					mode: "common",
					title: "",
					icon_type: 0,
					sub_title: "",
					desc: "",
					width: 520,
					button_info1: null,
					button_info2: null,
					url: "",
					objArg: null,
					timeout: null
				};
				o(".mod_popup_mask").length <= 0 ? o("body").append('<div class="mod_popup_mask"></div>') : o(".mod_popup_mask").show(), o.extend(s, t || {});
				var e = Tips.getElementInBody(i.get("id"));
				e.html(""), e.css({
					position: "fixed",
					zIndex: "100000",
					top: "-1000px",
					margin: "10px"
				});
				var l = {},
					c = "";
				if ("iframe" == s.mode) c = s.url ? '<iframe id="frame_tips" frameborder="0" width="100%" ' + (-1 != s.url.indexOf("aisee.qq.com") ? 'height="420px;" scrolling="auto"' : 'height="380px;" scrolling="no"') + ' src="about:blank;"></iframe>' : "", i.set("objArg", s.objArg);
				else if ("bigpage" == s.mode) c = s.desc;
				else {
					s.icon_type >= 0 && s.icon_type <= 2 && (l.class_icon = i.get("class_icon_list")[s.icon_type]), l.sub_title = s.sub_title || "", l.desc = s.desc || "", l.class_single = "", "" == l.desc && (l.class_single = " popup__subtit--single");
					for (var p = 1, u = ""; 3 > p; p++) u = "button_info" + p, s[u] ? (l["button_class" + p] = s[u].highlight ? "mod_btn_green" : "mod_btn", l["button_onclick" + p] = s[u].fn || "", l["button_title" + p] = s[u].title || "") : l["button_display" + p] = "none";
					c = s.content || i.get("_content_tpl")(l), l.close_func = s.close_func || ""
				}
				e.html(i.get("_dialog_tpl")({
					title: s.title,
					content: c,
					popup__bd_class: s.popup__bd_class || "",
					dialogclass: s.dialogclass,
					mode: s.mode,
					outtips: i.get("tpl_outtips")(l)
				})), e.off(), e.on("click", "a.popup__close ", function(t) {
					var n = l.close_func;
					o.isFunction(n) && n.call(this, t), i.hide()
				}), e.on("click", ".js-button1", function(t) {
					var i = l.button_onclick1;
					o.isFunction(i) && i.call(this, t)
				}), e.on("click", ".js-button2", function(t) {
					var i = l.button_onclick2;
					o.isFunction(i) && i.call(this, t)
				}), "iframe" == s.mode ? s.url ? (doc.getElementById("frame_tips").src = s.url, setTimeout(function() {
					var t = doc.getElementById("frame_tips");
					t.contentWindow ? t.contentWindow.focus() : t.contentDocument && t.contentDocument.documentElement && t.contentDocument.documentElement.focus()
				}, 0)) : e.css({
					width: s.width && s.width > 0 ? s.width : 420,
					height: s.height && s.height > 0 ? s.height : "auto"
				}) : ((!s.dialogclass || t.width) && e.css({
					width: s.width && s.width > 0 ? s.width : 420
				}), e.css({
					height: s.height && s.height > 0 ? s.height : "auto"
				}), e.show(), Tips.fix_elem(e)), s.timeout && (_timerTips = setTimeout(o.proxy(i.hide, i), s.timeout))
			},
			hide: function() {
				o("body").css({
					overflowY: "scroll"
				}), o(".mod_popup_mask").hide(), o("#frame_tips").blur().remove(), o("#" + this.get("id")).off().remove();
				var t = this.get("_timerScroll"),
					i = this.get("_timerTips");
				null != t && (clearTimeout(t), this.set("_timerScroll", null)), null != i && (clearTimeout(i), this.set("_timerTips", null))
			},
			onReady: function(t, i) {
				var n = o("#" + this.get("id")),
					s = o("#frame_tips");
				n.length < 1 || (t > 0 && (s.length > 0 && s.css({
					width: t + "px",
					height: i + "px"
				}), n.css({
					visibility: "visible",
					width: t + 2 + "px"
				}), o("#dialogbox").css({
					height: i + "px"
				})), Tips.fix_elem(n))
			},
			getID: function() {
				return this.get("id")
			},
			getArg: function() {
				return this.get("objArg")
			}
		}),
		s = new n;
	return window.dialog = s, {
		Dialog: n,
		dialog: s,
		show: o.proxy(s.show, s),
		hide: o.proxy(s.hide, s),
		onReady: o.proxy(s.onReady, s),
		id: o.proxy(s.getID, s)
	}
});