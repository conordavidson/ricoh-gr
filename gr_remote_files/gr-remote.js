/*! Copyright (c) 2015 RICOH IMAGING COMPANY, LTD. */

"use strict";

/*--------------------------------------------------------------------------*/
/**
 * 繝�ヰ繝�げ逕ｨ繧ｪ繝励す繝ｧ繝ｳ
 */
(function(){
//	$.grist.args.debugMode = "on";
//	$.grist.args.developMode = "on";
})();

/**
 * 蝓ｺ譛ｬ諠��ｱ
 */
(function(){
	$.gr.appInfo("GR Remote", "1.2.1");
})();

/**
 * 莠呈鋤蟇ｾ蠢�
 */
(function(){
	// 繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺ｮ菫晏ｮ�
	if ($.gr.lastAppVersion < "1.2.0") {
		(function(){
			function attachPrefix(name) {
				var orgPrefix = $.grist.localStorage.prefix,
					opt;

				$.grist.localStorage.prefix = "";
				opt = $.grist.localStorage(name);
				$.grist.localStorage(name, null);
				$.grist.localStorage.prefix = orgPrefix;

				if (opt != null) $.grist.localStorage(name, opt);
			}

			attachPrefix("lastAppVersion:v1", null);
			attachPrefix("options.dlMethod");
			attachPrefix("options.dlSize");
			attachPrefix("options.lvTouch");
			attachPrefix("options.viewDNG");
			attachPrefix("options.viewJPG");
			attachPrefix("options.viewMOV");
			attachPrefix("fileCache:v1");
			attachPrefix("fileCache:v1.length");
		})();
	}
})();

/*--------------------------------------------------------------------------*/
/**
 * 繝輔ぃ繧､繝ｫ諠��ｱ縺ｮ邂｡逅�
 */
(function(){
	var FILE_CACHE_LIMIT = 10000,
		MAX_ITEMS_IN_PAGE = 100;

	$.extend($.gr, {
		// 繧ｫ繝｡繝ｩ繝輔ぃ繧､繝ｫ荳隕ｧ
		_fileCache: $.grist.Cache("fileCache:v1", FILE_CACHE_LIMIT),
		_fileList: [],
		fileListLoaded: false,

		// 繝薙Η繝ｼ繧｢逕ｻ蜒丈ｸ隕ｧ
		viewerFileFilter: ["jpg", "dng", "mov"],
		viewerFileList: [],
		viewerFileSort: { folder: {}, date: {} },

		// 繝薙Η繝ｼ繧｢繝壹�繧ｸ
		activeViewerPage: "100RICOH[0]",
		viewerPages: [],
		viewerPageFiles: {},
		_folderNames: {
			today: "Today's Shots"
		},

		// 繝壹�繧ｸ逡ｪ蜿ｷ縺九ｉ繝壹�繧ｸ蜷榊叙蠕�
		getViewerPageTitle: function(viewerPage){
			var title, folder, nth, count;

			if (!/(.*)\[(.*)\]/.test(viewerPage)) return "";

			folder = RegExp.$1;
			nth = parseInt(RegExp.$2) + 1;
			count = 1;

			$.each(this.viewerFileSort, function(){
				if (this[folder] != undefined) {
					count = Math.ceil(this[folder].length / MAX_ITEMS_IN_PAGE);
					return false;
				}
			});

			title = this._folderNames[folder] || folder;
			if (count > 1) {
				title += " (" + nth + "/" + count + ")";
			}

			return title;
		},

		// 繝薙Η繝ｼ繧｢逕ｻ蜒丈ｸ隕ｧ菴懈�
		_buildViewerFileList: function(){
			var self = this,
				fileList = $.extend(true, [], self._fileList),
				pid = 0;

			// 繝輔ぃ繧､繝ｫ荳隕ｧ縺ｮ繧ｽ繝ｼ繝�
			fileList.sort(function(a, b){
				return a.fn < b.fn ? -1 : 1;
			});

			// 繝薙Η繝ｼ繧｢蜈ｨ逕ｻ蜒丈ｸ隕ｧ菴懈�
			this.viewerFileList = $.map(fileList, function(file){
				var ext = file.fn.replace(/.*\./, "").toLowerCase();

				if ($.inArray(ext, self.viewerFileFilter) == -1) return null;

				file = $.extend({}, file)
				file.pid = pid++;
				file.date = $.grist.util.fromLocalISOTime(file.date);

				return file;
			});

			// 繝輔か繝ｫ繝蛻･逕ｻ蜒丈ｸ隕ｧ菴懈�
			this.viewerFileSort.folder = (function(fileList){
				var sortedList = {};

				$.each(fileList, function(i, file){
					var dir = file.fn.split("/").slice(-2)[0];

					if (dir != "") {
						sortedList[dir] = sortedList[dir] || [];
						sortedList[dir].push(file);
					}
				});

				return sortedList;
			})(this.viewerFileList);

			// 譌･莉伜挨逕ｻ蜒丈ｸ隕ｧ菴懈�
			this.viewerFileSort.date = (function(fileList){
				var sortedList = { today: [] },
					today = new Date();

				$.each(fileList, function(i, file){
					if (file.date.toDateString() == today.toDateString()) {
						sortedList["today"].push(file);
					}
				});

				return sortedList;
			})(this.viewerFileList);
		},

		// 繝薙Η繝ｼ繧｢繝壹�繧ｸ菴懈�
		_buildViewerPages: function(){
			var self = this;

			this.viewerPages = [];
			this.viewerPageFiles = {};

			// 隕丞ｮ壽椢謨ｰ縺斐→縺ｫ繝輔か繝ｫ繝蛻�牡
			$.map(["date", "folder"], function(order){
				$.each(self.viewerFileSort[order], function(dir, files){
					var numPages = Math.ceil(files.length / MAX_ITEMS_IN_PAGE),
						i;

					// 譌･莉倥ヵ繧ｩ繝ｫ繝縺ｫ隧ｲ蠖薙ヵ繧｡繧､繝ｫ縺後↑縺��ｴ蜷医ｒ閠��
					if (numPages == 0) numPages = 1;

					for (i = 0; i < numPages; i++) {
						var viewerPage = dir + "[" + i + "]";

						self.viewerPages.push(viewerPage);
						self.viewerPageFiles[viewerPage] = files.slice(i * MAX_ITEMS_IN_PAGE, (i + 1) * MAX_ITEMS_IN_PAGE);
					}
				});
			});
		},

		// 繝輔ぃ繧､繝ｫ荳隕ｧ縺ｮ繧ｯ繝ｪ繧｢
		clearFileList: function(){
			var self = this;

			self.viewerFileList = [];
			$.each(self.viewerFileSort, function(order){
				self.viewerFileSort[order] = {};
			});
			this.viewerPages = [];
			this.viewerPageFiles = {};

			this.fileListLoaded = false;
		},

		// 繝輔ぃ繧､繝ｫ荳隕ｧ縺ｮ譖ｴ譁ｰ
		refreshFileList: function(){
			var self = this,
				cacheActive = $.grist.cam.state() == "online";

			// 繧ｭ繝｣繝�す繝･貂医∩繝輔ぃ繧､繝ｫ諠��ｱ縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ
			if (cacheActive) {
				this._fileCache.load();
			}

			return $.Deferred().resolve()
				.then(function(){
					return $.gr.getFileList();
				})
				.then(function(fileList){
					return $.Deferred(function(dfd){
						var promises = [];

						$.each(fileList, function(i, file){
							var cache;

							if (file.class == "extended") {
								if (cacheActive) {
									self._fileCache.put([file.fn, file.date], file);
								}
								return;
							}

							if (cacheActive) {
								cache = self._fileCache.get([file.fn, file.date]);
								if (cache != undefined) {
									fileList[i] = cache;
									return;
								}
							}

							promises.push($.gr.appendFileInfo(file).done(function(){
								if (cacheActive) {
									self._fileCache.put([file.fn, file.date], file);
								}
							}));
						});

						$.when.apply($, promises)
							.done(function(){
								dfd.resolve(fileList);
							})
							.fail(function(){
								dfd.reject();
							});
					});
				})
				.then(function(fileList){
					var modified = JSON.stringify(fileList) != JSON.stringify(self._fileList);

					$.grist.log("list: modified=" + modified);

					if (modified) {
						self._fileList = $.extend(true, [], fileList);
						if (cacheActive) {
							self._fileCache.save();
						}

						// @todo localDebug譎ゅ↓蝠城｡後↓縺ｪ繧�
						// self._buildViewerFileList();
					}
					self._buildViewerFileList();
					self._buildViewerPages();

					if (!self.fileListLoaded) {
						self.fileListLoaded = true;
						modified = true;
					}

					return modified;
				})
				.fail(function(){
					self.clearFileList();
				});
		}
	});
})();

/**
 * 逕ｻ蜒上ム繧ｦ繝ｳ繝ｭ繝ｼ繝峨Μ繝ｳ繧ｯ縺ｮ邂｡逅�
 */
(function(){
	$.extend($.gr, {
		activeDlSize: "view"
	});

	$.fn.extend({
		grDownload: function(state){
			var dlType = $.grist.opts.galleryAction == "select" ? "direct" : "page",
				dlAttr = $.grist.opts.dlMethod == "direct" ? "" : null;

			this.each(function(){
				var orgHref = $(this).data("orgHref.download") || $(this).attr("href"),
					newHref, fn;

				if (state == "on") {
					fn = $.gr.getImageParams(orgHref).fn,
					newHref = $.gr.getDownloadURL({ fn: fn, size: $.gr.activeDlSize }, dlType);

					$(this)
						.addClass("gr-download")
						.attr({ href: newHref, target: "_blank", download: dlAttr })
						.data("orgHref.download", orgHref);
				} else {
					$(this)
						.removeClass("gr-download")
						.attr({ href: orgHref, target: null, download: null })
						.removeData("orgHref.download");
				}
			});

			return this;
		}
	});
})();

/**
 * 繧ｫ繝｡繝ｩ諠��ｱ縺ｮ邂｡逅�
 */
(function(){
	$.extend($.gr, {
		_defaultInfo: {
			model: "Unknown",
			version: 0.00
		},
		_info: null,

		getGRInfo: function(){
			return $.grist.opts.grSysInfo == "manual" ? {
					model: $.grist.opts.grModel,
					version: $.grist.opts.grVersion
				} : this._info || this._defaultInfo;
		},

		clearGRInfo: function(){
			this._info = this._defaultInfo;
		},

		refreshGRInfo: function(){
			var self = this;

			this.clearGRInfo();

			return $.gr.getData("constants/device").done(function(data){
				self._info = { model: data.model, version: Number(data.firmwareVersion) };
			})
		}
	});
})();

/**
 * 繧｢繝励Μ蜍穂ｽ懊Δ繝ｼ繝峨�邂｡逅�
 */
(function(){
	$.extend($.gr, {
		refreshSettings: function(){
			var standalone, landscape, mini,
				grInfo, restrictWiFiChannel;

			$.gr.viewerFileFilter = $.map(["viewJPG", "viewDNG", "viewMOV"], function(ext){
				return $.grist.opts[ext] || null;
			});

			$.grist.debugMode = $.grist.opts.debugMode == "on";
			$.grist.simulationEnabled = $.grist.opts.apiSimulation == "on";

			standalone = navigator.standalone || $.grist.opts.standaloneMode == "on";
			$("body")[standalone ? "addClass" : "removeClass"]("gr-state-standalone");

			// 讓ｪ蜷代″繝ｬ繧､繧｢繧ｦ繝亥愛螳夲ｼ育判髱｢蟷�′480px繧医ｊ蟆上＆縺��ｴ蜷医�縺ｿ譛牙柑��
			landscape =
				Math.abs(window.orientation) == 90 && screen.width < 480 ||
				$.grist.opts.landscapeLayout == "on";
			$("body")[landscape ? "addClass" : "removeClass"]("gr-landscape");

			// mini繝｢繝ｼ繝牙愛螳�
			mini = $("html").hasClass("gr-remote-mini") || $.grist.opts.miniMode == "on";
			$("body")[mini ? "addClass" : "removeClass"]("gr-state-mini");

			$("body")[$.grist.opts.developMode == "on" ? "addClass" : "removeClass"]("gr-state-develop");

			grInfo = $.gr.getGRInfo();
			restrictWiFiChannel = grInfo.model == "GR II" && grInfo.version < 1.10;
			$("body")[restrictWiFiChannel ? "addClass" : "removeClass"]("gr-state-restrict-wifi");
		}
	});
})();

/*--------------------------------------------------------------------------*/
/**
 * JQM蛻晄悄險ｭ螳�
 */
$(document).on("mobileinit", function(){
	$.mobile.defaultPageTransition = "fade";

	$.mobile.getMaxScrollForTransition = function(){
		return $.mobile.getScreenHeight() * 4;
	};

	// @note 繝｡繝九Η繝ｼ縺ｫ繧医ｋ蜷御ｸ繝壹�繧ｸ驕ｷ遘ｻ繧貞ｯｾ遲�
	$.mobile.changePage.defaults.allowSamePageTransition = true;

	// @note iOS9繧ｹ繧ｿ繝ｳ繝峨い繝ｭ繝ｼ繝ｳ譎ゅ�Back荳榊�蜷医ｒ蟇ｾ遲�
	if ($.grist.platform == "iOS" && navigator.standalone) {
		$.mobile.hashListeningEnabled = false;
	}
});

/*--------------------------------------------------------------------------*/
/**
 * 繧ｪ繝励す繝ｧ繝ｳ蛻晄悄險ｭ螳�
 */
(function(){
	$.grist.cam.fallback.randomViewFile = "scenes.json";
	$.grist.m.loading.options = { theme: "a" };
	$.grist.m.appCache.options = { showLoading: true };
})();

/**
 * DOM蛻晄悄險ｭ螳�
 */
$(function(){
	$.gr.activeViewerPage = $.grist.localStorage("lastGalleryPage:v1") || "today[0]";

	// iOS縺ｮ繧ｹ繧ｿ繝ｳ繝峨い繝ｭ繝ｼ繝ｳ縺ｮ蝣ｴ蜷医∵怙邨ゅ�繝ｼ繧ｸ縺ｸ驕ｷ遘ｻ
	(function(){
		var startPage = $.grist.localStorage("lastPage:v1");

		$.grist.localStorage("lastPage:v1", null);

		if (startPage != null && location.hash == "") {
			if ($.grist.platform == "iOS" && navigator.standalone) {
				// @note iOS9繧ｹ繧ｿ繝ｳ繝峨い繝ｭ繝ｼ繝ｳ譎ゅ�Back荳榊�蜷医ｒ蟇ｾ遲�
				$.mobile.hashListeningEnabled = true;
				location.hash = "#" + startPage;
				setTimeout(function(){
					$.mobile.hashListeningEnabled = false;
				});

				// @todo 2蝗槭�繝ｼ繧ｸ驕ｷ遘ｻ縺檎匱逕溘＠縺ｦ縺｡繧峨▽縺冗樟雎｡繧貞ｯｾ遲�
				$.mobile.changePage.defaults.allowSamePageTransition = false;
				$(document).one("vmousedown.hashChange", function(){
					$.mobile.changePage.defaults.allowSamePageTransition = true;
				});
				setTimeout(function(){
					$.mobile.changePage.defaults.allowSamePageTransition = true;
					$(document).off("vmousedown.hashChange");
				}, 3000);
			}
		}
	})();

	// 逕ｻ蜒上ぐ繝｣繝ｩ繝ｪ繝ｼ繝壹�繧ｸ縺九ｉ髢句ｧ九☆繧句�ｴ蜷医∫判蜒上ン繝･繝ｼ繧｢繝壹�繧ｸ繧貞ｱ･豁ｴ縺ｫ謖ｿ蜈･
	if (location.hash == "#gr-viewer-gallery") {
		history.replaceState(null, null, "#gr-viewer");
		document.title = "Viewer";
		history.pushState(null, null, "#gr-viewer-gallery");
	}

	// 蜈ｱ騾壹�繝��繧｢繝��繝ｻ蜈ｱ騾壹ヱ繝阪Ν蛻晄悄蛹�
	$("body > [data-role=popup]").enhanceWithin().popup();
	$("body > [data-role=panel]").enhanceWithin().panel();

	// iOS縺ｮ蝣ｴ蜷医∫判蜒丞屓霆｢縺ｯExif縺ｫ莉ｻ縺帙ｋ
	if ($.grist.platform == "iOS") {
		$("body").addClass("gr-rotate-by-exif");
	}

	// 蜍穂ｽ懊Δ繝ｼ繝芽ｨｭ螳�
	$.gr.refreshSettings();

	// mini繝｢繝ｼ繝芽ｨｭ螳�
	if ($("body").hasClass("gr-state-mini")) {
		// @todo 蝗ｺ螳壹ヤ繝ｼ繝ｫ繝舌�蟇ｾ蠢�
		// $("[data-role=header]").attr("data-position", "fixed");

		// 繧ｳ繝槭Φ繝繝ｼ繝壹�繧ｸ縲√�繝ｪ繧ｻ繝�ヨ繝壹�繧ｸ繧貞炎髯､
		$("#gr-home, #gr-presets").remove();

		// 繝薙Η繝ｼ繧｢繝壹�繧ｸ繧偵�繝ｼ繝�繝壹�繧ｸ縺ｨ縺吶ｋ
		$.gr.appName += " Custom";
		$("#gr-viewer").attr("data-title", $.gr.appName);

		// UI繝��繝槭�繝�ヵ繧ｩ繝ｫ繝医ｒLight縺ｨ縺吶ｋ
		$.grist.opts.uiTheme = $.grist.localStorage("options.uiTheme") ? $.grist.opts.uiTheme : "a";
		$("select[name=uiTheme]").val($.grist.opts.uiTheme);
	}

	// 繧｢繝励Μ繝舌�繧ｸ繝ｧ繝ｳ險ｭ螳�
	$(".gr-app-version").text($.gr.appVersion);

	// AppCache譛牙柑譎ゅ↓繧ｿ繧､繝医Ν螟画峩
	if ($("html").attr("manifest") != undefined) {
		$(":jqmData(title='" + $.gr.appName + "')").jqmData("title", $.gr.appName + " (AppCache)");
	}

	// UI繝��繝櫁ｨｭ螳�
	$(".gr-theme").each(function(){
		if ($(this).hasClass("ui-bar")) {
			$(this).addClass("ui-bar-" + $.grist.opts.uiTheme);
		} else if ($(this).hasClass("ui-body")) {
			$(this).addClass("ui-body-" + $.grist.opts.uiTheme);
		} else {
			$(this).attr("data-theme", $.grist.opts.uiTheme);
		}
	});

	// @todo 襍ｷ蜍慕峩蠕後�繝ｼ繧ｸ陦ｨ遉ｺ縺ｮ縺｡繧峨▽縺阪ｒ謚大宛
	$("body > [data-role=page]").find("[role=main], [data-role=header], [data-role=footer]").css("visibility", "hidden");
	$(document).one("pageshow", function(){
		setTimeout(function(){
			$("body > [data-role=page]").find("[role=main], [data-role=header], [data-role=footer]").css("visibility", "");
		}, 10);
	});
});

/**
 * 繝壹�繧ｸ蛻晄悄險ｭ螳�
 */
$(document).on("pagecreate enhance", function(e){
	var page = $(e.target);

	// Light繝��繝槭�蝣ｴ蜷医�ｻ偵い繧､繧ｳ繝ｳ繧剃ｽｿ逕ｨ
	if (page.is(".ui-page-theme-a")) {
		page
			.find(".ui-btn")
			.filter(".ui-btn-icon-left, .ui-btn-icon-right, .ui-btn-icon-top, .ui-btn-icon-bottom, .ui-btn-icon-notext")
			.filter(":not(.ui-checkbox-off):not(.ui-checkbox-on):not(.ui-radio-on):not(.ui-radio-off)")
			.addClass("ui-alt-icon");
	}
	page.find(".ui-bar-a").each(function(){
		$(this)
			.find(".ui-btn")
			.filter(".ui-btn-icon-left, .ui-btn-icon-right, .ui-btn-icon-top, .ui-btn-icon-bottom, .ui-btn-icon-notext")
			.filter(":not(.ui-checkbox-off):not(.ui-checkbox-on):not(.ui-radio-on):not(.ui-radio-off)")
			.addClass("ui-alt-icon");
	});
	page.find(".ui-bar-b").each(function(){
		$(this)
			.find(".ui-btn")
			.filter(".ui-btn-icon-left, .ui-btn-icon-right, .ui-btn-icon-top, .ui-btn-icon-bottom, .ui-btn-icon-notext")
			.filter(":not(.ui-checkbox-off):not(.ui-checkbox-on):not(.ui-radio-on):not(.ui-radio-off)")
			.removeClass("ui-alt-icon");
	});

	// 繧｢繧ｯ繝�ぅ繝也憾諷九↑縺励�繝輔Μ繝��繧ｹ繧､繝�メ
	page.find("select.gr-slider-no-active").each(function(){
		$(this).next(".ui-slider").find(".ui-btn-active").removeClass("ui-btn-active");
	});
});

/**
 * 蜈ｱ騾壹う繝吶Φ繝亥宛蠕｡
 */
$(function(){
	// 逕ｻ髱｢蝗櫁ｻ｢
	$(window).on("orientationchange", function(){
		$.gr.refreshSettings();
	});
});

/**
 * 諡｡蠑ｵ繧ｦ繧｣繧ｸ繧ｧ繝�ヨ
 */
$(function(){
	// 繝医げ繝ｫ繝懊ち繝ｳ
	$(".gr-toggle-btn")
		.on("vclick", function(){
			var value = $(this).val() || false;

			$(this).val(!value).trigger("change");
		})
		.on("change", function(){
			$(this).trigger("refresh");
		})
		.on("refresh", function(){
			$(this)[$(this).val() ? "addClass" : "removeClass"]("ui-btn-active");
		});
});

/*--------------------------------------------------------------------------*/
/**
 * 蜈ｨ繝壹�繧ｸ蜈ｱ騾�
 */
$(document).one("pagecreate", function(){
	// 譛ｪ螳溯｣�夂衍
	$(document).on("click change", ".gr-uc", function(){
		$.grist.m.notify("UNDER CONSTRUCTION");
	});

	// 譛邨ゅ�繝ｼ繧ｸ菫晏ｭ�
	$(document).on("pagecontainerchange", function(e, data){
		var lastPage = data.toPage.attr("id");

		$.grist.localStorage("lastPage:v1", lastPage);
	});

	// 繝薙Η繝ｼ繧｢繝壹�繧ｸ螟画峩
	$(document).on("click", "a[fd]", function(){
		$.gr.activeViewerPage = $(this).attr("fd");
		$.grist.localStorage("lastGalleryPage:v1", $.gr.activeViewerPage);

		if ($(this).attr("href") == "#") {
			$("body").pagecontainer("getActivePage").trigger("viewerpagechange");
		}
	});

	// 繝壹�繧ｸ蜈磯�ｭ�冗ｵらｫｯ縺ｸ遘ｻ蜍�
	$(document).on("click", "a.gr-to-top", function(){
		$.grist.m.scroll(0, "animate");
	});
	$(document).on("click", "a.gr-to-bottom", function(){
		$.grist.m.scroll($(this).closest(".ui-page").height(), "animate");
	});

	// @note iOS9繧ｹ繧ｿ繝ｳ繝峨い繝ｭ繝ｼ繝ｳ譎ゅ�Back荳榊�蜷医ｒ蟇ｾ遲�
	if ($.grist.platform == "iOS" && navigator.standalone) {
		$("a[data-rel=back]:not([href=#])").on("click", function(){
			var self = this;

			$(this).attr("data-rel", "");
			setTimeout(function(){
				$(self).attr("data-rel", "back");
			}, 0);
		});
	}

	// 閾ｪ蜍輔ョ繝｢髢句ｧ句愛譁ｭ
	if ($.grist.args.demo == "on") {
		$(document).one("pageshow", function(){
			var POPUP_OPEN_DELAY = 500;

			setTimeout(function(){
				$("#gr-demo").trigger("click");
			}, POPUP_OPEN_DELAY);
		});
	}
});

/**
 * 繧ｫ繝｡繝ｩ謗･邯�
 */
$(document).one("pagecreate", function(){
	var SCAN_TIMEOUT = 5 * 1000,
		PING_INTERVAL = 10 * 1000,
		SCAN_DELAY_ON_STARTUP = 1 * 1000;

	// 繧ｫ繝｡繝ｩ謗･邯�
	$(document).on("connect", function(){
		var promises = [];

		$.grist.cam.activeDomains = $.grist.scanner.foundDomains;
		$.gr.clearFileList();

		$(".gr-power .fa").addClass("gr-active");

		// 繧ｫ繝｡繝ｩ諠��ｱ縺ｮ蜿門ｾ�
		promises.push($.gr.refreshGRInfo());

		// 繝ｬ繝ｳ繧ｺ繝ｭ繝�け迥ｶ諷九�蜿門ｾ�
		promises.push(
			$.gr.postCommands("mpget=LENS_LOCK AF_LEVER").done(function(data){
				$("#gr-lenslock").val(data["LENS_LOCK"] == 1 ? "Lock" : "Off").trigger("change").slider().slider("refresh");
				$("#gr-aflever").val(data["AF_LEVER"] == 1 ? "C-AF" : "AFL").trigger("refresh").slider().slider("refresh");
			})
		);

		$.when.apply($, promises).always(function(){
			$.gr.refreshSettings();
			$("body").pagecontainer("getActivePage").trigger("pagerefresh");
		});

		// 蛻�妙讀懷�髢句ｧ�
		$(document).trigger("ping");
		/* @todo WebSocket迚�
		if ($.grist.opts.disablePing == "on") return;

		$.grist.scanner.keep()
			.done(function(){
				if ($.grist.cam.state() == "online") {
					$.grist.m.notify("DISCONNECTED");
					$(document).trigger("disconnect");
				}
			})
			.fail(function(){
				// @todo WebSocket繧ｨ繝ｩ繝ｼ
				$.grist.alert("WebSocket Error");
			});
		*/
	});

	// 繧ｫ繝｡繝ｩ蛻�妙
	$(document).on("disconnect", function(){
		$.grist.cam.activeDomains = [];
		$.gr.clearFileList();
		$.gr.clearGRInfo();
		$.gr.refreshSettings();
		$("body").pagecontainer("getActivePage").trigger("pagerefresh");
		$(".gr-power .fa").removeClass("gr-active");
	});

	// 謗･邯壽､懷�
	$(document).on("scan", function(e, timeout){
		$.grist.cam.activeDomains = [];

		$.grist.scanner.scanDomains = [$.gr.getGRDomain()];
		$.grist.scanner.find(timeout)
			.done(function(){
				$.grist.m.notify("CONNECTED TO GR");
				$(document).trigger("connect");
			})
			.fail(function(reason){
				if (timeout != undefined && reason == "timeout") {
					$.grist.m.notify("NOT CONNECTED");
				}
			});
	});

	// 蛻�妙讀懷�
	$(document).on("ping", function(){
		(function ping(){
			if ($.grist.opts.disablePing == "on") return;
			if ($.grist.cam.state() == "offline") return;

			// @todo PhotoSwipe陦ｨ遉ｺ荳ｭ蟇ｾ蠢�
			//if ($.active + $.grist.grLoadImage.active > 0 || $(".pswp").hasClass("pswp--open")) {

			// 逕ｻ蜒上Ο繝ｼ繝我ｸｭ縺ｯ蛻�妙讀懷�辟｡蜉ｹ
			if ($.active + $.grist.grLoadImage.active > 0) {
				setTimeout(ping, PING_INTERVAL);
				return;
			}

			$.grist.scanner.ping()
				.done(function(){
					setTimeout(ping, PING_INTERVAL);
				})
				.fail(function(){
					if ($.grist.opts.disablePing == "on") return;
					if ($.grist.cam.state() == "offline") return;

					$.grist.m.notify("DISCONNECTED");
					$(document).trigger("disconnect");
				});
		})();
	});

	// 髮ｻ貅唇FF
	$(document).on("vclick", ".gr-power", function(){
		if ($.grist.cam.state() == "offline") return;

		setTimeout(function(){
			$.grist.m.notify("See you!").always(function(){
				$(document).trigger("disconnect");
			});
		}, 600); // @todo 蛻�妙讀懃衍縺悟�縺ｫ蜃ｦ逅�＆繧後ｋ蝣ｴ蜷医≠繧�
	});

	// 蜀肴磁邯�
	$(document).on("vclick", ".gr-refresh", function(){
		$.grist.cam.activeDomains = [];
		$("#gr-icon-power").removeClass("gr-active");
		$.grist.m.loading("show", "Connecting");
		$(document).trigger("scan", SCAN_TIMEOUT);
	});

	// 閾ｪ蜍墓磁邯�
	setTimeout(function(){
		$(document).trigger("scan");
	}, SCAN_DELAY_ON_STARTUP);
});

/**
 * 繝輔ぃ繧､繝ｫ荳隕ｧ蜿門ｾ�
 */
$(document).one("pagecreate", function(){
	var dfd = null;

	// 繝輔ぃ繧､繝ｫ荳隕ｧ蜿門ｾ�
	$(document).on("list", function(){
		if (dfd && dfd.state() == "pending") return;

		dfd = $.grist.m.busy(function(){
			return $.gr.refreshFileList().always(function(modified){
				var activePanel = $(".ui-panel-open"),
					activePage = $("body").pagecontainer("getActivePage"),
					eventTarget = activePanel.length > 0 ? activePanel : activePage;

				eventTarget.trigger("listload",
					this.state() == "rejected" ? "error" :
					modified ? "modified" : undefined
				);
			})
		});
	})
});

/**
 * 繝ｪ繝｢繝ｼ繝医さ繝ｳ繝医Ο繝ｼ繝ｫ
 */
$(document).one("pagecreate", function(){
	var REPEAT_INTERVAL = 500,
		repeatTimer = null;

	// @note vclick驥崎､��蟇ｾ遲�
	$(document).on("vclick", "a:jqmData(gr):not([href]):not(:jqmData(rel))", function(e){
		e.preventDefault();
	});

	// 繝懊ち繝ｳ
	$(document).on("vclick", "a:jqmData(gr)", function(){
		var command = $(this).jqmData("gr");

		if (command == "") return;
		if (repeatTimer != null) return;

		if ($(this).hasClass("gr-key")) {
			$.gr.postCommands(command);
		} else {
			$.grist.m.busy(function(){
				return $.gr.postCommands(command);
			});
		}
	})

	// 繝医げ繝ｫ繝懊ち繝ｳ
	$(document).on("change", "a:jqmData(gr-on), a:jqmData(gr-off)", function(){
		var command = $(this).jqmData($(this).val() ? "gr-on" : "gr-off");

		if (command == "") return;

		$.grist.m.busy(function(){
			return $.gr.postCommands(command);
		});
	});

	// 繧ｭ繝ｼ繝ｪ繝斐�繝�
	$(document).on("taphold", "a:jqmData(gr).gr-key", function(){
		var repeat = $(this).hasClass("gr-key-dial") ? " 2" : " 1 0 1 0",
			command = $(this).jqmData("gr") + repeat;

		$(document).one("vmouseup", function(){
			clearInterval(repeatTimer);
			repeatTimer = null;
		});

		$.gr.postCommands(command);
		repeatTimer = setInterval(function(){
			$.gr.postCommands(command);
		}, REPEAT_INTERVAL);
	});

	// 繧ｻ繝ｬ繧ｯ繝医Γ繝九Η繝ｼ
	$(document).on("change refresh", "select.gr-select", function(e){
		var command = $(this).find("option:selected").jqmData("gr");

		if (command != undefined) {
			if (e.type == "refresh") {
				$.gr.postCommands(command);
			} else {
				$.grist.m.busy(function(){
					return $.gr.postCommands(command);
				});
			}
		}

		$(this).find("option.gr-option-title").remove();
	})
});

/**
 * 逕ｻ蜒上ぐ繝｣繝ｩ繝ｪ繝ｼ
 */
$(document).one("pagecreate", function(){
	var linkClicked = false;

	$(".gr-gallery").each(function(i){
		$(this).attr("data-pswp-uid", i + 1).addClass("gr-gallery-photoswipe");
	});

	$(document).on("click", ".gr-gallery.gr-gallery-photoswipe a", function(e){
		var gallery = $(this).closest(".gr-gallery"),
			photoSwipe,
			options,
			items = [];

		// DOM繝�Μ繝ｼ縺九ｉ逕ｻ蜒乗ュ蝣ｱ繧定｣懷｡ｫ
		gallery.find("a").each(function(){
			var index = $(this).data("gr-pid"),
				file = $.gr.viewerFileList[index],
				image;

			if (file == undefined) return;

			// MOV縺ｮ繧ｵ繧､繧ｺ蜿門ｾ�
			if (/\.mov$/i.test(file.fn)) {
				image = $(this).find("img")[0];
				if (image.naturalWidth != 0 && image.naturalHeight != 0) {
					file.size.w = image.naturalWidth;
					file.size.h = image.naturalHeight;
				}
			}
		});

		// 逕ｻ蜒乗ュ蝣ｱ菴懈�
		items = $.gr.viewerFileList.map(function(file){
			var item = {
				src: $.gr.getImageURL({ fn: file.fn, size: "view", orient: file.orient }),
				w: file.orient < 5 ? file.size.w : file.size.h,
				h: file.orient < 5 ? file.size.h : file.size.w,
				msrc: $.gr.getImageURL({ fn: file.fn, size: "thumb", orient: file.orient }),
				title: $.grist.uri.filename(file.fn)
			};

			// PhotoSwipe GR諡｡蠑ｵ: 繧ｵ繝�繝阪�繝ｫ縺ｮ菴咲ｽｮ縺ｨ繧ｵ繧､繧ｺ繧定｣懈ｭ｣
			if (file.msize.w == 160 && file.msize.h == 120) {
				if (file.size.w * 3 > file.size.h * 4) {
					item.mwidth = file.size.w;
					item.mheight = file.size.w * 3 / 4;
				} else {
					item.mwidth = file.size.h * 4 / 3;
					item.mheight = file.size.h;
				}
				item[file.orient < 5 ? "mleft" : "mtop"] = (file.size.w - item.mwidth) / 2;
				item[file.orient < 5 ? "mtop" : "mleft"] = (file.size.h - item.mheight) / 2;
			}

			// 繝�ヰ繝�げ逕ｨ
			item.title += $.grist.comment(" " + JSON.stringify({
				w: file.size.w, h: file.size.h,
				mw: file.msize.w, mh: file.msize.h,
				o: file.orient
			}).replace(/\"/g, ""));

			return item;
		});

		// PhotoSwipe襍ｷ蜍輔が繝励す繝ｧ繝ｳ
		options = {
			showHideOpacity: true,
			history: false,
			index: $(this).data("gr-pid"),
			galleryUID: gallery.data("pswp-uid"),
			getThumbBoundsFn: function(index){
				var thumbnail, rect, pageYScroll;

				thumbnail =
					gallery.find("a[data-gr-pid=" + index + "] img")[0] ||
					gallery.find("a:first img")[0];

				if (thumbnail == undefined) return;

				rect = thumbnail.getBoundingClientRect();
				pageYScroll = window.pageYOffset || document.documentElement.scrollTop;

				return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
			},

			shareButtons: [
				{ id: "vga", label: "Download VGA", url: "{{raw_image_url}}", size: "view" },
				{ id: "original", label: "Download Original", url: "{{raw_image_url}}", size: "full" }
			],
			getImageURLForShare: function(shareButtonData){
				var fn = $.gr.getImageParams(photoSwipe.currItem.src).fn;

				shareButtonData.download = $.grist.opts.dlMethod == "direct";

				return $.gr.getDownloadURL({ fn: fn, size: shareButtonData.size });
			},

			noShareModal: $.grist.opts.dlSize != "select"
		};

		photoSwipe = new PhotoSwipe($(".pswp")[0], PhotoSwipeUI_Default, items, options);

		// 繝繧ｦ繝ｳ繝ｭ繝ｼ繝牙ｯｾ蠢�
		(function(){
			var shareLink = $("a.pswp__button--share"), shareModal = $(".pswp__share-modal");

			shareLink.on("pswpTap", function(){
				linkClicked = true;
			});
			shareModal.on("pswpTap", "a", function(){
				linkClicked = true;
			});

			photoSwipe.listen("destroy", function(){
				shareLink.off("pswpTap");
				shareModal.off("pswpTap");
				$(".pswp a[download]").removeAttr("download");
			});

			photoSwipe.listen("beforeChange", function(){
				var fn = $.gr.getImageParams(photoSwipe.currItem.src).fn,
					size = $.grist.opts.dlSize == "vga" ? "view" : "full";

				shareLink.attr({
					href: $.gr.getDownloadURL({ fn: fn, size: size }),
					target: "_blank",
					download: $.grist.opts.dlMethod == "direct" ? "" : null
				});

				shareModal.find("a[download]").removeAttr("download");
			});

			$("button.pswp__button--share")[$.grist.opts.dlSize == "select" ? "show" : "hide"]();
			$("a.pswp__button--share")[$.grist.opts.dlSize != "select" ? "show" : "hide"]();
		})();

		// 繝上ャ繧ｷ繝･螟画峩
		(function(){
			var originalHash,
				closeByBack = false;

			photoSwipe.listen("destroy", function(){
				if (!closeByBack && $.grist.platform != "iOS") { // @todo iOS縺ｯBack縺ｧ繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ縺励※縺励∪縺��縺ｧ辟｡蜉ｹ蛹�
					history.back();
				} else {
					$(window).off("beforenavigate.photoSwipe");
				}
			});
			originalHash = $.mobile.navigate.history.getActive().hash;
			if ($.grist.platform != "iOS") { // @todo iOS縺ｯBack縺ｧ繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ縺励※縺励∪縺��縺ｧ辟｡蜉ｹ蛹�
				if (location.hash.indexOf($.mobile.dialogHashKey) == -1) { // @todo dialogHashKey驥崎､�ｒ蟇ｾ遲�
					location.hash += $.mobile.dialogHashKey;
				}
			}
			setTimeout(function(){
				$(window).one("beforenavigate.photoSwipe", function(){
					closeByBack = true;
					photoSwipe.close();
					return $.mobile.navigate.history.getActive().hash != originalHash;
				});
			}, 0);
		})();

		// PhotoSwipe襍ｷ蜍�
		photoSwipe.init();

		return e.preventDefault();
	});

	// Share繝懊ち繝ｳ縺ｮ鄂ｮ縺肴鋤縺�
	$("button.pswp__button--share").replaceWith(
		'<button class="pswp__button pswp__button--share" title="Download"></button>' +
		'<a class="pswp__button pswp__button--share" title="Download" style="display: none;"></a>'
	);

	// 繝ｪ繝ｳ繧ｯ繧ｯ繝ｪ繝�け蠕後�繧ｳ繝ｳ繝医Ο繝ｼ繝ｫ縺ｮ繝医げ繝ｫ繧偵せ繧ｭ繝��
	$(".pswp__scroll-wrap").on("pswpTap", function(e){
		if (linkClicked) {
			linkClicked = false;
			e.stopImmediatePropagation();
		}
	});

	// taphold蠕後�touchcancel蜍穂ｽ懊ｒ謚大宛
	$(".pswp").on("taphold", "a", function(){
		$(this).one("touchcancel", false);
	});

	// @note PhotoSwipe縺ｧ2驥阪〒繧ｿ繝�メ�上�繧ｦ繧ｹ繧､繝吶Φ繝医′逋ｺ逕溘☆繧句撫鬘後ｒ蟇ｾ遲�
	if (/Android|iOS/.test($.grist.platform)) {
		$(".pswp").on("mouseup mousedown mousemove", false);
	}
});

/**
 * 逕ｻ蜒上ぐ繝｣繝ｩ繝ｪ繝ｼ 驕ｸ謚槭ム繧ｦ繝ｳ繝ｭ繝ｼ繝�
 */
$(document).one("pagecreate", function(){
	var grGallery = {
		_state: "swipe",

		state: function(elem, state){
			if (grGallery._state == state) return;

			grGallery._state = state;
			$(elem).removeClassGroup("gr-gallery-").addClass("gr-gallery-" + grGallery._state);

			if (grGallery._state == "download") {
				$(elem).find("a").grDownload("on");
			} else {
				$(elem).find("a").grDownload("off").removeClass("gr-focus gr-imgbox-icon ui-icon-check");
			}
		},

		refresh: function(elem){
			if (grGallery._state == "download") {
				$(elem).find("a").grDownload("on");
			}
		},

		select: function(elem){
			$(elem).find("a")
				.grDownload("on")
				.addClass("gr-focus gr-imgbox-icon ui-icon-check")
				.removeClass("gr-imgbox-icon-weak");
		},

		deselect: function(elem){
			$(elem).find("a")
				.grDownload("off")
				.removeClass("gr-focus gr-imgbox-icon gr-imgbox-icon-weak ui-icon-check");
		},

		download: function(elem){
			$(elem).removeClassGroup("gr-gallery-").addClass("gr-gallery-download");

			// @todo iOS迚磯幕逋ｺ荳ｭ
			if ($.grist.opts.developMode == "on" && $.grist.platform == "iOS") {
				$(elem).closest(".ui-page").find("a.gr-commit").attr("href", grDownloadScheme(grImages()));
				$(elem).find("a.gr-download").removeClass("ui-icon-check").trigger("click");
				setTimeout(function(){
					$(elem).find("a.gr-download").grDownload("off");
				}, 0);
				$(elem).removeClassGroup("gr-gallery-").addClass("gr-gallery-" + grGallery._state);
				return;
			}

			$(elem).find("a.gr-download").each(function(){
				var e;

				$(this).removeClass("ui-icon-check");

				e = document.createEvent("MouseEvents");
				e.initEvent("click", true, false);
				this.dispatchEvent(e);

				$(this).grDownload("off");
			});

			$(elem).removeClassGroup("gr-gallery-").addClass("gr-gallery-" + grGallery._state);
		}
	};

	// 繧ｮ繝｣繝ｩ繝ｪ繝ｼ迥ｶ諷玖ｨｭ螳壹�繝ｩ繧ｰ繧､繝ｳ
	$.fn.extend({
		grGallery: function(method){
			var args = arguments;

			this.each(function(){
				args[0] = this;
				grGallery[method].apply(grGallery, args);
			});

			return this;
		},
	});

	// 逕ｻ蜒城∈謚�
	$(document).on("vclick click", ".gr-gallery.gr-gallery-select a", function(){
		if (!$(this).hasClass("gr-download")) {
			$(this)
				.grDownload("on")
				.addClass("gr-focus gr-imgbox-icon ui-icon-check")
				.removeClass("gr-imgbox-icon-weak");
		} else {
			$(this)
				.grDownload("off")
				.removeClass("gr-focus gr-imgbox-icon gr-imgbox-icon-weak ui-icon-check");
		}

		$(this).closest(".gr-gallery").trigger("change");

		return false;
	});

	// 繝繧ｦ繝ｳ繝ｭ繝ｼ繝蛾幕蟋区凾縺ｮ繧｢繧､繧ｳ繝ｳ繝輔ぅ繝ｼ繝峨ヰ繝�け
	$(document).on("click", ".gr-gallery.gr-gallery-download a.gr-download", function(){
		var ICON_FEEDBACK_PERIOD = 1 * 1000,
			self = this,
			iconFeedback = $(this).data("iconFeedback.download") || null;

		clearTimeout(iconFeedback);
		iconFeedback = null;

		iconFeedback = setTimeout(function(){
			iconFeedback = null;
			$(self)
				.removeClass("gr-focus ui-icon-arrow-d")
				.addClass("gr-imgbox-icon gr-imgbox-icon-weak ui-icon-arrow-d")
				.removeData("iconFeedback.download");
		}, ICON_FEEDBACK_PERIOD);

		$(this)
			.addClass("gr-focus gr-imgbox-icon ui-icon-arrow-d")
			.removeClass("gr-imgbox-icon-weak")
			.data("iconFeedback.download", iconFeedback);
	});
});

/**
 * 閾ｪ蜍輔ョ繝｢
 */
$(document).one("pagecreate", function(){
	$("#gr-demo").on("click", function(){
		$.grist.m.popup
			.open({ html: "<h3>Starting Demo</h3><p>Touch screen to terminate.</p>"}, 3 * 1000)
			.elem().one("popupafterclose", function(){
				$.grist.cam.fallback.randomViewEnabled = true;
				$.grist.m.demo.scenario = $.gr.demoScenarios.basic;
				$.grist.m.demo.start().always(function(){
					$.grist.m.popup
						.open({ html: "<h3>Demo Terminated</h3>" }, 3 * 1000)
						.elem().one("popupafterclose", function(){
							$.grist.cam.fallback.randomViewEnabled = false;
							$("body").pagecontainer("getActivePage").trigger("pagerefresh");
						});
				});
			});
	});
});

/*--------------------------------------------------------------------------*/
/**
 * 蜈ｨ菴灘虚菴�
 */
$(document).one("pagecreate", function(){
/* @note 謫堺ｽ懈ｧ繧定��縺励∝ｸｸ縺ｫ繝｡繝九Η繝ｼ繧帝幕縺�
	// 蜿ｳSwipe縺ｧ繝｡繝九Η繝ｼ繧帝幕縺擾ｼ丞燕繝壹�繧ｸ縺ｫ謌ｻ繧�
	$(document).on("swiperight", ".ui-page", function(){
		var activePage = $(".ui-page-active"),
			headerLeftBtn = activePage.find(".ui-header a.ui-btn-left");

		if (headerLeftBtn.attr("href") == "#gr-menu") {
			if (activePage.jqmData("panel") != "open") {
				$("#gr-menu").panel("open");
			}
		} else if (headerLeftBtn.jqmData("rel") == "back") {
			$.grist.lastClick = headerLeftBtn; // @todo 谺｡縺ｮ繝壹�繧ｸ縺ｧ繧上°繧九ｈ縺�↓
			history.back();
		}
	});
*/
	// 蜿ｳSwipe縺ｧ繝｡繝九Η繝ｼ繧帝幕縺�
	$(document).on("swiperight", ".ui-page", function(){
		if ($(".ui-page-active").jqmData("panel") != "open") {
			$("#gr-menu").panel("open");
		}
	});

	// 蟾ｦSwipe縺ｧ繧ｯ繧､繝�け繝薙Η繝ｼ繧帝幕縺�
	$(document).on("swipeleft", "#gr-home, #gr-viewer, #gr-viewer-gallery, #gr-presets, #gr-utils", function(){
		if ($(".ui-page-active").hasClass("gr-state-select")) return;

		if ($(".ui-page-active").jqmData("panel") != "open") {
			$("#gr-quickview").panel("open");
		}
	});
});

/**
 * 繝｡繝九Η繝ｼ繝代ロ繝ｫ
 */
$(document).one("panelcreate", "#gr-menu", function(){
	var roulette = $.grist.Roulette("phrases.json");

	// 繝輔Ξ繝ｼ繧ｺ縺ｮ螟画峩
	$(this).on("panelclose", function(){
		$("#gr-phrase").html(roulette.get().text);
	});
});

/**
 * 繧ｳ繝槭Φ繝繝ｼ繝壹�繧ｸ
 */
$(document).one("pagecreate", "#gr-home", function(){
	var controlPage = 2,
		lensLocked = $("#gr-lenslock").val() == "Lock",
		focusLocked = false,
		captureRunning = false,
		lvFlipped = false;

	function cancelFocus() {
		if (focusLocked) {
			$("#gr-focus").val(focusLocked = false).trigger("change");
		}
	}

	function cancelShutter() {
		if (captureRunning) {
			$("#gr-shutter").val(captureRunning = false).trigger("change");
		}
	}

	// 繝壹�繧ｸ驕ｷ遘ｻ
	$(this)
		.on("pagebeforeshow", function(){
			$("#gr-control-navbar a:jqmData(gr-control-page=" + controlPage + ")").addClass("ui-btn-active");
		})
		.on("pageshow pagerefresh", function(){
			$("#gr-view img").css("background-image", "url('" + $.gr.getViewURL() + "')");
		})
		.on("pagebeforehide", function(){
			cancelFocus();
			cancelShutter();
		})
		.on("pagehide", function(){
			$("#gr-view img").css("background-image", "");
		});

	// 繧ｳ繝ｳ繝医Ο繝ｼ繝ｫ繝代ロ繝ｫ繝壹�繧ｸ驕ｷ遘ｻ
	$("#gr-control-navbar").on("vclick", "a:jqmData(gr-control-page)", function(){
		$("#gr-control .gr-cpanel:jqmData(gr-control-page=" + controlPage + ")").hide();
		controlPage = $(this).jqmData("gr-control-page");
		$("#gr-control .gr-cpanel:jqmData(gr-control-page=" + controlPage + ")").show();
	})

	// 繝懊ち繝ｳClick譎ゅ�繝輔か繝ｼ繧ｫ繧ｹ繝ｭ繝�け隗｣髯､
	$("#gr-control").on("vclick", "a:jqmData(gr)", function(){
		if (!$(this).hasClass("gr-keep-focus")) {
			cancelFocus();
		}
		if (!$(this).hasClass("gr-keep-shutter")) {
			cancelShutter();
		}
	});

	// 繧ｻ繝ｬ繧ｯ繝亥､画峩譎ゅ�繝輔か繝ｼ繧ｫ繧ｹ繝ｭ繝�け隗｣髯､
	$("#gr-control").on("change", ".gr-select", function(){
		if (!$(this).hasClass("gr-keep-focus")) {
			cancelFocus();
		}
		if (!$(this).hasClass("gr-keep-shutter")) {
			cancelShutter();
		}
	});

	// 繧ｷ繝｣繝�ち繝ｼ邯ｭ謖√�繧ｿ繝ｳ
	$("#gr-control").on("vclick", "#gr-shutter-hold", function(){
		if (lensLocked) {
			$.gr.postCommands("cmd=bnull");
			return;
		}

		$("#gr-focus").val(focusLocked = true).trigger("refresh");

		// 繧ｳ繝槭Φ繝峨〒繝輔か繝ｼ繧ｫ繧ｹ繝ｭ繝�け繧定ｧ｣髯､
		$("#gr-focus, #gr-shutter")
			.off("change.shutterHold")
			.one("change.shutterHold", function(){
				$("#gr-focus, #gr-shutter").off("change.shutterHold");
				$.gr.postCommands("cmd=brl 0");
			});
	});

	// 繝ｬ繝ｳ繧ｺ繝ｭ繝�け繧ｹ繧､繝�メ
	$("#gr-lenslock").on("change", function(){
		lensLocked = $(this).val() == "Lock";
	});

	// 繝輔か繝ｼ繧ｫ繧ｹ繝懊ち繝ｳ
	$("#gr-focus")
		.on("vclick", function(){
			if (lensLocked) {
				$.gr.postCommands("cmd=bnull");
				return;
			}
			if (captureRunning) return;
			$(this).val(focusLocked = !focusLocked).trigger("change");
		})
		.on("change", function(){
			$(this).val(focusLocked).trigger("refresh");

			$.grist.m.busy(function(){
				return $.gr.callAPI(focusLocked ? "lens/focus/lock" : "lens/focus/unlock");
			})
		})
		.on("refresh", function(){
			$(this)[$(this).val() ? "addClass" : "removeClass"]("ui-btn-active");
		});

	// 繧ｷ繝｣繝�ち繝ｼ繝懊ち繝ｳ
	$("#gr-shutter")
		.on("vclick", function(){
			if (lensLocked) {
				$.gr.postCommands("cmd=bnull");
				return;
			}

			$(this).val(captureRunning = !captureRunning).trigger("change");
		})
		.on("change", function(){
			var self = this;

			$("#gr-focus").val(focusLocked = false).trigger("refresh");

			$.grist.m.busy(function(){
				if (!captureRunning) {
					$(self).val(captureRunning).trigger("refresh");
					return $.gr.callAPI("camera/shoot/finish");
				} else {
					return $.gr.callAPI("camera/shoot?af=camera").always(function(resp){
						if (resp && resp.errMsg == "Precondition Failed") {
							return $.gr.callAPI("camera/shoot/start?af=camera").done(function(){
								$(self).val(captureRunning).trigger("refresh");
							});
						} else {
							captureRunning = false;
						}
					});
				}
			});
		})
		.on("refresh", function(){
			$(this)[$(this).val() ? "addClass" : "removeClass"]("ui-btn-active");
		});

	// 繧ｿ繝�メ繝輔か繝ｼ繧ｫ繧ｹ
	$("#gr-view").on("vclick", function(e){
		var touchAction = $("body").hasClass("gr-landscape") ? "capture" : $.grist.opts.lvTouch,
			api = touchAction == "capture" ? "camera/shoot" : "lens/focus/lock",
			focusX = Math.round((e.pageX - $(this).offset().left) * 100 / $(this).width()),
			focusY = Math.round((e.pageY - $(this).offset().top) * 100 / $(this).height());

		if (lensLocked) {
			$.gr.postCommands("cmd=bnull");
			return;
		}

		if (captureRunning) return;

		if (lvFlipped) {
			focusX = 100 - focusX;
		}

		focusLocked = touchAction != "capture";
		$("#gr-focus").val(focusLocked).trigger("refresh");

		$.grist.m.busy(function(){
			return $.gr.callAPI(api, { pos: focusX + "," + focusY });
		});
	});

	// 迴ｾ蝨ｨ縺ｮ險ｭ螳壹ｒ蠑ｷ蛻ｶ蜷梧悄
	$(this).find(".gr-sync").on("vclick", function(){
		$.grist.m.busy("Transmitting", function(){
			var cmds = [];

			$("#gr-home").find("option:selected:jqmData(gr)").each(function(){
				cmds.push($(this).jqmData("gr"));
			});

			$("#gr-home").find("a:jqmData(gr-on), a:jqmData(gr-off)").each(function(){
				var cmd = $(this).jqmData($(this).val() ? "gr-on" : "gr-off");

				if (cmd != "") {
					cmds.push(cmd);
				}
			});

			return $.gr.postCommands(cmds);
		});
	});

	// @todo 蟾ｦ蜿ｳ髀｡蜒�
	$(this).find(".gr-flip").on("change", function(){
		lvFlipped = $(this).val() || false;

		$("#gr-view img")[lvFlipped ? "addClass" : "removeClass"]("gr-reflect-lr");
	});
});

/**
 * 隧ｳ邏ｰ險ｭ螳壹ヱ繝阪Ν
 */
$(document).one("panelcreate", "#gr-advanced", function(){
	// 險ｭ螳壹ヱ繝阪Ν
	$("#gr-sets")
		.on("submit", function(){
			var commands = [], props = [];

			$(this).find("option:selected:jqmData(gr)").each(function(){
				var cmds = $(this).jqmData("gr").split("&");

				$.each(cmds, function(){
					if (/pset=(.*)/i.test(this)) {
						props.push(RegExp.$1);
					} else {
						commands.push(this);
					}
				});
			});
			if (props.length > 0) {
				commands.push("mpset=" + props.join(" "));
			}

			if (commands.length > 0) {
				commands.push("cmd=mode refresh");

				$.grist.m.busy("Transmitting", function(){
					return $.gr.postCommands(commands);
				});
			}

			return false;
		})
		.on("refresh", function(){
			var panel = $(this).closest(".ui-panel"),
				commitBtn = panel.find(".gr-commit"),
				resetBtn = panel.find(".gr-reset"),
				modified = false;

			$(this).find("select").each(function(){
				var checked = $(this).val() != "";

				modified = modified || checked;
			});

			commitBtn.text(modified ? "Transmit" : "Done");
			resetBtn[modified ? "show" : "hide"]();
		})
		.on("change", "select", function(){
			$("#gr-sets").trigger("refresh");
		});

	// 繝代ロ繝ｫ陦ｨ遉ｺ貅門ｙ
	$(this).on("panelbeforeopen", function(){
		$("#gr-sets").trigger("refresh");
	});

	// 螳溯｡後�繧ｿ繝ｳ
	$(this).find(".gr-commit").on("click", function(){
		$("#gr-sets").submit();
	});

	// 繝ｪ繧ｻ繝�ヨ繝懊ち繝ｳ
	$(this).find(".gr-reset").on("click", function(){
		$("#gr-sets").trigger("reset").trigger("refresh");
	});
});

/**
 * 繧ｯ繧､繝�け繝薙Η繝ｼ
 */
$(document).one("panelcreate", "#gr-quickview", function(){
	var panel = $(this);

	// 譛霑醍判蜒上Ο繝ｼ繝�
	function loadRecentImages(gallery, lastIndex, size) {
		var imageLinks = $(gallery).find("a"),
			index = $.gr.viewerFileList.length + lastIndex + 1 - imageLinks.length;

		if (index < 0) index = 0;

		imageLinks.each(function(){
			var file;

			file = $.gr.viewerFileList[index++];
			if (file == undefined) return false;

			if ($(this).find("img").is(":visible")) return;

			$(this).attr("href", $.gr.getImageURL({ fn: file.fn, size: "view", orient: file.orient }));
			$(this).attr("data-gr-pid", file.pid);

			$(this).find("img")
				.grLoadImage($.gr.getImageURL({ fn: file.fn, size: size, orient: file.orient }))
				.attr("alt", $.grist.uri.filename(file.fn));
		});
	}

	// 譛譁ｰ逕ｻ蜒剰｡ｨ遉ｺ
	$("#gr-quick-single").on("refresh", function(){
		var fn;

		loadRecentImages(this, -1, "view");

		if ($.gr.viewerFileList.length == 0) return;
		fn = $.gr.viewerFileList[$.gr.viewerFileList.length - 1].fn;

		panel.find("a.gr-act-download").each(function(){
			$(this).attr({
				href: $.gr.getDownloadURL({ fn: fn, size: $(this).data("gr-download-size") }),
				target: "_blank",
				download: $.grist.opts.dlMethod == "direct" ? "" : null
			});
		});
	});

	// 譛霑醍判蜒剰｡ｨ遉ｺ
	$("#gr-quick-multi").on("refresh", function(){
		loadRecentImages(this, -1, "thumb");

		panel.find("a.gr-act-download").each(function(){
			$(this).attr({ href: "#", target: null, download: null });
		});
	});

	// 譛霑醍判蜒上ム繧ｦ繝ｳ繝ｭ繝ｼ繝�
	$(this).on("vclick", "a.gr-act-download", function(){
		var btnText = $(this).text();

		if (!$("#gr-quick-multi").is(":visible")) return;
		if ($.gr.viewerFileList.length == 0) return;

		$.gr.activeDlSize = $(this).data("gr-download-size");

		if (btnText != "Done") {
			$("#gr-download-title").text(btnText);
			panel.addClass("gr-state-select");
			panel.find("a.gr-act-download").not(this).css("visibility", "hidden");
			$(this).text("Done");
			$("#gr-quick-multi").grGallery("state", "download");
		} else {
			panel.removeClass("gr-state-select");
			panel.find("a.gr-act-download").not(this).css("visibility", "");
			$(this).text($.grist.opts.dlSize == "select" ? $(this).data("orgText") : "Download");
			$("#gr-quick-multi").grGallery("state", "photoswipe");
		}
	})

	// 陦ｨ遉ｺ蠖｢蠑上�繝ｼ繧ｸ驕ｷ遘ｻ
	$("#gr-quickview-navbar").on("vclick", "a", function(){
		var page = $(this).closest("li").index();

		if (page != panel.attr("data-gr-navbar-page")) {
			panel.attr("data-gr-navbar-page", page);
			panel.find(".gr-gallery:visible").trigger("refresh");
			panel.find("a.gr-act-download").css("visibility", "");
		}
	});

	// 繝代ロ繝ｫ陦ｨ遉ｺ貅門ｙ
	$(this).on("panelbeforeopen", function(){
		var activeNavPage = $(this).attr("data-gr-navbar-page"),
			size;

		$(this).find("img").hide();

		$("#gr-quickview-navbar a").eq(activeNavPage).addClass("ui-btn-active");
		panel.removeClass("gr-state-select");
		panel.find("a.gr-act-download").each(function(){
			$(this).text($(this).data("orgText")).css("visibility", "");
		});

		// 繝繧ｦ繝ｳ繝ｭ繝ｼ繝峨�繧ｿ繝ｳ菴懈�
		if ($.grist.opts.dlSize == "select") {
			panel.find("[data-gr-download-size]").show();
		} else {
			panel.find("[data-gr-download-size]").hide();
			size = $.grist.opts.dlSize == "vga" ? "view" : "full";
			panel.find("[data-gr-download-size=" + size + "]").text("Download").show();
		}
	});

	// 繝代ロ繝ｫ陦ｨ遉ｺ
	$(this).on("panelopen", function(){
		// 繝輔ぃ繧､繝ｫ荳隕ｧ蜿門ｾ�
		$(document).trigger("list");
	});

	// 繝代ロ繝ｫ邨ゆｺ�
	$(this).on("panelclose", function(){
		// @todo DL蜿悶ｊ髯､縺�
	});

	// 繝輔ぃ繧､繝ｫ荳隕ｧ蜿門ｾ�
	$(this).on("listload", function(){
		panel.find(".gr-gallery:visible").trigger("refresh");
		panel.find("a.gr-act-download")[$.gr.viewerFileList.length > 0 ? "removeClass" : "addClass"]("ui-state-disabled");
	});

	// 繝代ロ繝ｫ蛻晄悄蛹�
	panel.find("a.gr-act-download").each(function(){
		$(this).data("orgText", $(this).text());
	});
});

/**
 * 逕ｻ蜒上ン繝･繝ｼ繧｢繝壹�繧ｸ
 */
$(document).one("pagecreate", "#gr-viewer", function(){
	var folderView = $("#gr-folderview"),
		activeContents = "";

	// 繝輔か繝ｫ繝繝ｪ繧ｹ繝医い繧､繝�Β縺ｮ繧ｳ繝ｳ繝�Φ繝�函謌�
	function folderItemContents(page, files, note) {
		var contents = "",
			pageTitle = $.gr.getViewerPageTitle(page),
			imageURL =  $.grist.image.null,
			lastFile;

		if (files.length > 0) {
			lastFile = files[files.length - 1];
			imageURL = $.gr.getImageURL({ fn: lastFile.fn, size: "thumb", orient: lastFile.orient });
		}

		contents += '<li>';
		contents +=   '<a href="#gr-viewer-gallery" fd="' + page + '" title="' + pageTitle + '" data-transition="slidefade" class="gr-link-bottom">';
		contents +=     '<img src="' + $.grist.image.null + '" alt="' + pageTitle + '" class="gr-thumb gr-thumb-mini" data-gr-src="' + imageURL + '" style="display: none;">';
		contents +=     '<h2>' + pageTitle + '</h2>';
		contents +=     '<p>' + note + '</p>';
		contents +=     '<span class="ui-li-count">' + files.length + '</span>';
		contents +=   '</a>';

		return contents;
	}

	// 繝輔か繝ｫ繝繝ｪ繧ｹ繝医�繧ｳ繝ｳ繝�Φ繝�函謌�
	function folderContents() {
		var todaysContents = "", folderContents = "",
			contents;

		$.each($.gr.viewerPages, function(i, page){
			var files = $.gr.viewerPageFiles[page],
				note, latest;

			if (page.indexOf("today") == 0) {
				latest = 0;
				$.each(files, function(i, file){
					latest = Math.max(latest, file.date.getTime());
				});
				note = latest == 0 ? "No Photos" : "Latest: " + $.grist.util.toLocaleTimeString(new Date(latest)).replace(/:\d+( |$)/, "\$1");
				todaysContents += folderItemContents(page, files, note);
			} else {
				note = "";
				if (files.length > 0) {
					note = $.grist.uri.filename(files[0].fn).replace(/\..*$/, "");
				}
				if (files.length > 1) {
					note += " - " + $.grist.uri.filename(files[files.length - 1].fn).replace(/\..*$/, "");
				}
				folderContents += folderItemContents(page, files, note);
			}
		});

		contents = todaysContents;

		if (folderContents != "") {
			contents += '<li data-role="list-divider">FOLDERS</li>';
			contents += folderContents;
		}

		return contents;
	}

	// 繝壹�繧ｸ陦ｨ遉ｺ
	$(this).on("pageshow pagerefresh", function(e){
		var contents;

		// 繝輔ぃ繧､繝ｫ荳隕ｧ蜿門ｾ暦ｼ域悴蜿門ｾ励�蝣ｴ蜷茨ｼ�
		if (!$.gr.fileListLoaded) {
			$(document).trigger("list");
			return;
		}

		// 繝輔ぃ繧､繝ｫ荳隕ｧ蜿門ｾ�
		if (e.type == "pageshow") {
			// @todo 繝悶Λ繧ｦ繧ｶ縺ｮ繝舌ャ繧ｯ繝懊ち繝ｳ縺ｯ蛻､螳壹〒縺阪↑縺�
			if ($.grist.lastClick.data("rel") != "back") {
				$(document).trigger("list");
			}
		}

		// 繧ｳ繝ｳ繝�Φ繝�､牙喧蛻､譁ｭ
		contents = folderContents();
		if (contents == activeContents) return;
		activeContents = contents;

		// 繝壹�繧ｸ繧ｳ繝ｳ繝�Φ繝�ｽ懈�
		folderView.html(activeContents).listview("refresh");
		$(this).trigger("enhance");

		folderView.find("img[data-gr-src]:hidden").each(function(){
			$(this).grLoadImage($(this).data("gr-src"));
		});
	});

	// 繝輔ぃ繧､繝ｫ荳隕ｧ蜿門ｾ�
	$(this).on("listload", function(e, param){
		if (param == "error") {
			folderView.html(activeContents = "").listview("refresh");
		}
		if (param == "modified") {
			$(this).trigger("pagerefresh");
		}
	});

	// 繝壹�繧ｸ蛻晄悄蛹�
	folderView.html(activeContents).listview("refresh");
});

/**
 * 逕ｻ蜒上ぐ繝｣繝ｩ繝ｪ繝ｼ繝壹�繧ｸ
 */
$(document).one("pagecreate", "#gr-viewer-gallery", function(){
	var page = $(this),
		pageHeader = $(this).find(".ui-header"),
		thumbView = $("#gr-thumbview");

	// 繝壹�繧ｸ繝倥ャ繝菴懈�
	function buildGalleryHeader() {
		var title = $.gr.getViewerPageTitle($.gr.activeViewerPage),
			actionBtn = pageHeader.find("a.gr-action"),
			size;

		// 繧ｿ繧､繝医Ν險ｭ螳�
		if (!page.hasClass("gr-state-select")) {
			pageHeader.find(".ui-title").text(title);
		}

		// 繧｢繧ｯ繧ｷ繝ｧ繝ｳ繝懊ち繝ｳ菴懈�
		if ($.grist.opts.dlSize != "select") {
			size = $.grist.opts.dlSize == "vga" ? "view" : "full";
			actionBtn
				.attr("href", "#")
				.addClass("gr-act-download").data("gr-download-size", size);
		} else {
			actionBtn
				.attr("href", "#gr-gallery-action")
				.removeClass("gr-act-download").removeData("gr-download-size");
		}
	}

	// 繝壹�繧ｸ繝翫ン繧ｲ繝ｼ繧ｷ繝ｧ繝ｳ菴懈�
	function buildGalleryNavigation() {
		var index = $.inArray($.gr.activeViewerPage, $.gr.viewerPages),
			today = $.gr.activeViewerPage.indexOf("today");

		$.each([
			{ btn: page.find("a.gr-prev"), fd: $.gr.viewerPages[index - 1] },
			{ btn: page.find("a.gr-next"), fd: $.gr.viewerPages[index + 1] }
		], function(){
			if (this.fd && this.fd.indexOf("today") == today) {
				this.btn.attr("fd", this.fd).removeClass("ui-disabled");
			} else {
				this.btn.removeAttr("fd").addClass("ui-disabled");
			}
		});
	}

	// 逕ｻ蜒上ぐ繝｣繝ｩ繝ｪ繝ｼ縺ｮ繧ｳ繝ｳ繝�Φ繝�函謌�
	function galleryContents(files) {
		var contents = "";

		$.each(files, function(){
			var filename = $.grist.uri.filename(this.fn),
				imageLink = $.gr.getImageURL({ fn: this.fn, size: "view", orient: this.orient }),
				imageURL = $.gr.getImageURL({ fn: this.fn, size: "thumb", orient: this.orient });

			contents += '<li>';
			contents +=   '<a href="' + imageLink + '" title="' + filename + '" class="gr-imgbox" data-gr-pid="' + this.pid + '">';
			contents +=     '<img src="' + $.grist.image.null + '" alt="' + filename + '" class="gr-thumb" data-gr-src="' + imageURL + '" style="display: none;">';
			contents +=   '</a>';
		});

		return contents;
	}

	// 繝壹�繧ｸ陦ｨ遉ｺ貅門ｙ
	$(this).on("pagebeforeshow pagerefresh viewerpagechange", function(e){
		var contents = "",
			actionBtn = pageHeader.find("a.gr-action"),
			viewerPageFiles,
			navHidden, commitEnabled;

		// 逕ｻ蜒城∈謚樒憾諷句�譛溷喧
		if (e.type != "viewerpagechange") {
			if (page.hasClass("gr-state-select")) {
				$(this).find("a.gr-cancel").trigger("click");
			}
		}

		// 繝倥ャ繝菴懈�
		buildGalleryHeader();
		$("#gr-no-photos, #gr-thumbview-holder").hide();
		actionBtn.addClass("ui-disabled");

		// 繝輔ぃ繧､繝ｫ荳隕ｧ蜿門ｾ暦ｼ域悴蜿門ｾ励�蝣ｴ蜷茨ｼ�
		if (!$.gr.fileListLoaded) {
			$(document).trigger("list");
			return;
		}

		// 繝壹�繧ｸ繧ｳ繝ｳ繝�Φ繝�ｽ懈�
		viewerPageFiles = $.gr.viewerPageFiles[$.gr.activeViewerPage];
		if (viewerPageFiles != undefined) {
			buildGalleryNavigation();
			contents = galleryContents(viewerPageFiles);
		}
		thumbView.html(contents);

		if (viewerPageFiles && viewerPageFiles.length != 0) {
			$("#gr-thumbview-holder").show();
			$("#gr-no-photos").hide();
			actionBtn.removeClass("ui-disabled");
		} else {
			$("#gr-thumbview-holder").hide();
			$("#gr-no-photos").show();
			actionBtn.addClass("ui-disabled");
		}

		$(this).find("a.gr-to-bottom, a.gr-to-top").hide();
		$(this).find("a.gr-prev, a.gr-next").css("visibility", "");
		$(this).find("a.gr-commit").addClass("ui-disabled");
	});

	// 繝壹�繧ｸ陦ｨ遉ｺ
	$(this).on("pageshow pagerefresh viewerpagechange", function(){
		var images = thumbView.find("img[data-gr-src]:hidden"),
			contentHeight = $(this).find(".ui-content").outerHeight(true) + pageHeader.outerHeight(true);

		// 繧ｿ繧､繝医Ν險ｭ螳�
		document.title = pageHeader.find(".ui-title").text();

		// 繝壹�繧ｸTop/Bottom繝懊ち繝ｳ陦ｨ遉ｺ
		if (contentHeight > $.mobile.getScreenHeight()) {
			page.find("a.gr-to-bottom, a.gr-to-top").fadeIn();
		}

		if ($.grist.lastClick.hasClass("gr-link-bottom")) {
			$.grist.m.scroll($(this).height());
			images = $(images.get().reverse());
		}

		images.each(function(){
			$(this).grLoadImage($(this).data("gr-src"));
		});
	});

	// 繝壹�繧ｸ邨ゆｺ�
	$(this).on("pagehide", function(){
		var images = thumbView.find("img[data-gr-src]");

		if (page.hasClass("gr-state-select")) {
			$(this).find("a.gr-cancel").trigger("click");
		}

		images.each(function(){
			$(this).attr("src", $.grist.image.null);
		});
	});

	// 繝輔ぃ繧､繝ｫ荳隕ｧ蜿門ｾ�
	$(this).on("listload", function(e, param){
		if (param == "error") {
			buildGalleryHeader();
			thumbView.html("");
		}
		if (param == "modified") {
			$(this).trigger("pagerefresh");
		}
	});

	// 繝壹�繧ｸ蛻晄悄蛹�
	thumbView.html("");
});

/**
 * 逕ｻ蜒上ぐ繝｣繝ｩ繝ｪ繝ｼ繝壹�繧ｸ 驕ｸ謚槭ム繧ｦ繝ｳ繝ｭ繝ｼ繝�
 */
$(document).one("pagecreate", "#gr-viewer-gallery", function(){
	var page = $(this),
		pageHeader = $(this).find(".ui-header"),
		thumbView = $("#gr-thumbview");

	// 逕ｻ蜒城∈謚樒憾諷区峩譁ｰ
	$(this).on("selectrefresh", function(){
		var hasChecked = thumbView.find("a.ui-icon-check").length,
			hasUnchecked = thumbView.find("a:not(.ui-icon-check)").length;

		$(this).find("a.gr-prev, a.gr-next").css("visibility", hasChecked ? "hidden" : "");
		$(this).find("a.gr-commit")[hasChecked ? "removeClass" : "addClass"]("ui-disabled");

		$(this).find("a.gr-select-all").text(hasUnchecked ? "Select All" : "Deselect All");
	});

	// 逕ｻ蜒城∈謚樊桃菴憺幕蟋�
	$(this).on("click", "a.gr-act-download", function(){
		var btnText = $(this).text();

		$.gr.activeDlSize = $(this).data("gr-download-size");

		pageHeader.find(".ui-title").text(btnText);
		document.title = btnText;

		thumbView.grGallery("state", $.grist.opts.galleryAction);
		page.attr("data-gr-gallery-action", $.grist.opts.galleryAction);
		page.addClass("gr-state-select");
		page.trigger("selectrefresh");

		// @todo 繝繧ｦ繝ｳ繝ｭ繝ｼ繝我ｸｭ蛻�妙縺ｮ蟇ｾ遲�
		$.grist.opts.disablePing = "on";
	});

	// 逕ｻ蜒城∈謚樊桃菴懃ｵゆｺ�
	$(this).on("click", "a.gr-cancel", function(){
		var title = $.gr.getViewerPageTitle($.gr.activeViewerPage);

		pageHeader.find(".ui-title").text(title);
		document.title = title;

		thumbView.grGallery("state", "photoswipe");
		page.removeClass("gr-state-select");
		page.trigger("selectrefresh");
	});

	// 逕ｻ蜒城∈謚樒憾諷句､牙喧
	thumbView.on("change", function(){
		page.trigger("selectrefresh");
	});

	// 繝壹�繧ｸ繝翫ン繧ｲ繝ｼ繧ｷ繝ｧ繝ｳ
	$(this).on("viewerpagechange", function(){
		thumbView.grGallery("refresh");
	});

	// 繝繧ｦ繝ｳ繝ｭ繝ｼ繝蛾幕蟋�
	$(this).on("click", "a.gr-commit", function(){
		thumbView.grGallery("download");
		page.trigger("selectrefresh");
	});

	// 蜈ｨ驕ｸ謚�
	$(this).on("click", "a.gr-select-all", function(){
		thumbView.grGallery($(this).text() == "Select All" ? "select" : "deselect");
		page.trigger("selectrefresh");
	});
});

/**
 * 繝励Μ繧ｻ繝�ヨ繝壹�繧ｸ
 */
$(document).one("pagecreate", "#gr-presets", function(){
	var activeBtn = undefined;

	// 譌｢驕ｸ謚槭�繧ｿ繝ｳ縺ｮ繧ｭ繝｣繝ｳ繧ｻ繝ｫ
	$(this)
		.on("vclick", "a.ui-btn:jqmData(gr)", function(){
			if (activeBtn) {
				$.gr.postCommands($(activeBtn).jqmData("gr-off"));
				$.gr.postCommands("delay=1000");
				$(activeBtn).val(false).trigger("refresh");
				activeBtn = undefined;
			}
		})
		.on("change", "a.ui-btn:jqmData(gr-on), a.ui-btn:jqmData(gr-off)", function(){
			if ($(this).val()) {
				if (activeBtn) {
					$.gr.postCommands($(activeBtn).jqmData("gr-off"));
					$.gr.postCommands("delay=1000");
					$(activeBtn).val(false).trigger("refresh");
				}
				activeBtn = this;
			} else {
				activeBtn = undefined;
			}
		});

	// 繝壹�繧ｸ驕ｷ遘ｻ
	$(this)
		.on("pagebeforeshow", function(){
			$("#gr-miniview-holder img").attr("src", $.grist.image.null);
		})
		.on("pageshow pagerefresh", function(){
			$("#gr-miniview-holder img").attr("src", $.gr.getViewURL());
		})
		.on("pagehide", function(){
			$("#gr-miniview-holder img").attr("src", $.grist.image.null);
		});

	$("#gr-miniview-single img").on("vclick", function(){
		$("#gr-miniview-single").fadeOut("fast").promise().done(function(){
			$("#gr-miniview-multi").fadeIn("fast");
		});
	});

	$("#gr-miniview-multi img").on("vclick", function(){
		$("#gr-miniview-single img").attr("class", $(this).attr("class") || "");

		$("#gr-miniview-multi").fadeOut("fast").promise().done(function(){
			$("#gr-miniview-single").fadeIn("fast");
		});
	});

	$("#gr-miniview-multi").hide();
});

/**
 * 繝ｦ繝ｼ繝�ぅ繝ｪ繝�ぅ繝壹�繧ｸ
 */
$(document).one("pagecreate", "#gr-utils", function(){
	var REFRESH_INTERVAL = 60 * 1000,
		self = this,
		roulette = $.grist.Roulette("history.json"),
		grFallbackInfo = { Model: "GR1", Clock: "1996-10-01T00:00:00", Storage: "36 Exp free, 36 Exp total", Battery: "Full" },
		grInfo = {},
		grClock = "",
		lastGRInfo = {},
		clockInterval = null,
		refreshInterval = null;

	// GR諠��ｱ譖ｴ譁ｰ
	$("#gr-info").on("refresh", function(){
		$(this).find("tr").each(function(){
			var item = $(this).find("th").text(),
				info = grInfo[item];

			$(this).find("td").text(item == "Clock" ? grClock : info);
		});
	});

	// 譎りｨ亥ｮ壽悄譖ｴ譁ｰ
	function periodicalRefresh() {
		var grStart = $.grist.util.fromLocalISOTime(grInfo["Clock"]).getTime(),
			start = Date.now();

		clearInterval(clockInterval);
		clockInterval = null;

		function refreshGRInfo() {
			var delta = Date.now() - start;

			grClock = $.grist.util.toLocaleString(new Date(grStart + delta));
			$("#gr-info").trigger("refresh");
		}

		refreshGRInfo();
		clockInterval = setInterval(refreshGRInfo, 1000);
	}

	// 繝壹�繧ｸ陦ｨ遉ｺ貅門ｙ
	$(this).on("pagebeforeshow", function(){
		$("#gr-info td").text("");
	});

	// 繝壹�繧ｸ陦ｨ遉ｺ
	$(this).on("pageshow pagerefresh clockrefresh infocorrect", function(e){
		var promises = [],
			info = {};

		if (e.type != "infocorrect") {
			clearInterval(refreshInterval);
			refreshInterval = null;
			lastGRInfo = {};

			grFallbackInfo = roulette.get() || grFallbackInfo;
			grInfo = grFallbackInfo;
		}

		promises.push(
			$.gr.getData("constants/device").done(function(data){
				if (data.model == undefined || data.firmwareVersion == undefined) return;
				info["Model"] = data.model + " " + Number(data.firmwareVersion).toFixed(2);
			})
		);

		promises.push(
			$.gr.getData("params/device").done(function(data){
				if (data.datetime == undefined) return;
				info["Clock"] = data.datetime;
			})
		);

		promises.push(
			$.gr.postCommands("mpget=" + [
				"BATTERY_LEVEL",
				"REMAINING_MEDIA_SIZE_H", "REMAINING_MEDIA_SIZE_L",
				"TOTAL_MEDIA_SIZE_H", "TOTAL_MEDIA_SIZE_L"
			].join(" ")).done(function(data){
				var battery, storage;

				if (data["BATTERY_LEVEL"] == undefined) return;
				if (data["REMAINING_MEDIA_SIZE_H"] == undefined) return;
				if (data["REMAINING_MEDIA_SIZE_L"] == undefined) return;
				if (data["TOTAL_MEDIA_SIZE_H"] == undefined) return;
				if (data["TOTAL_MEDIA_SIZE_L"] == undefined) return;

				battery = data["BATTERY_LEVEL"] ? /BATTERY_LEVEL_(.+)/i.exec(data["BATTERY_LEVEL"])[1] : "Unknown",
				info["Battery"] = $.grist.util.toTitleCase(battery);

				storage = {
					remain: ((data["REMAINING_MEDIA_SIZE_H"] << 12) | (data["REMAINING_MEDIA_SIZE_L"] >>> 20)) / 1024,
					total: ((data["TOTAL_MEDIA_SIZE_H"] << 12) | (data["TOTAL_MEDIA_SIZE_L"] >>> 20)) / 1024
				};

				$.map(["remain", "total"], function(elem){
					var digits = storage[elem] < 10 ? 2 : storage[elem] < 100 ? 1 : 0;

					storage[elem] = storage[elem].toFixed(digits);
				});

				info["Storage"] = storage.remain + " GB free, " + storage.total + " GB total";
			})
		);

		$.when.apply($, promises)
			.done(function(){
				$.extend(grInfo, info);

				if (refreshInterval == null) {
					refreshInterval = setInterval(function(){
						$(self).trigger("infocorrect");
					}, REFRESH_INTERVAL);
				}
			})
			.always(function(){
				if (JSON.stringify(grInfo) != JSON.stringify(lastGRInfo)) {
					lastGRInfo = grInfo;
					periodicalRefresh();
				}
			});
	});

	// 繝壹�繧ｸ邨ゆｺ�ｺ門ｙ
	$(this).on("pagebeforehide", function(){
		clearInterval(clockInterval);
		clockInterval = null;
		clearInterval(refreshInterval);
		refreshInterval = null;
	});

	// 譎ょ綾蜷梧悄
	$("#gr-clock").on("vclick", function(){
		var localISOTime = $.grist.util.toLocalISOTime(Date.now());

		$.grist.m.busy("Transmitting", function(){
			return $.gr.putData("params/device", { datetime: localISOTime.replace(/\..*/, "") });
		})
		.always(function(){
			$.grist.m.notify(this.state() == "resolved" ? "SUCCESS" : "ERROR");
			$(self).trigger("clockrefresh");
		});
	});
});

/**
 * Reset GR繝代ロ繝ｫ
 */
$(document).one("panelcreate", "#gr-reset", function(){
	var self = this;

	$(this).on("vclick", "a:jqmData(gr)", function(){
		var command = $(this).jqmData("gr");

		$.grist.m.busy("Transmitting", function(){
			return $.gr.postCommands(command);
		})
		.done(function(){
			$.grist.m.notify("SUCCESS").always(function(){
				$(self).panel("close");
			});
		})
		.fail(function(){
			$.grist.m.notify("ERROR");
		});

		return false;
	});
});

/**
 * Wi-Fi險ｭ螳壹ヱ繝阪Ν
 */
$(document).one("panelcreate", "#gr-wifi", function(){
	var self = this;

	// 險ｭ螳壼渚譏�
	$(this).on("submit", function(){
		var info = {
				ssid: $(self).find("input[name=wifiSSID]").val(),
				key: $(self).find("input[name=wifiPassword]").val(),
				channel: $(self).find("select[name=wifiChannel]").val()
			};

		$.grist.m.busy("Transmitting", function(){
			return $.gr.putData("params/device", info);
		})
		.done(function(){
			$.grist.m.notify("SUCCESS").always(function(){
				$(self).panel("close");
			});
		})
		.fail(function(){
			$.grist.m.notify("ERROR");
		});

		return false;
	});

	// 蜈･蜉帛�螳ｹ譖ｴ譁ｰ
	$(this).find("input").on("input blur", function(){
		var acceptCommit = $(self).find("input").filter(function(){
				return $(this).val().length == 0;
			}).length == 0;

		$(self).find(".gr-commit")[acceptCommit ? "removeClass" : "addClass"]("ui-disabled");
	});

	// 繝代ロ繝ｫ陦ｨ遉ｺ貅門ｙ
	$(this).on("panelbeforeopen", function(){
		$(this).find("input[name=wifiSSID], input[name=wifiPassword]").val("").trigger("blur");
		$(this).find("select[name=wifiChannel]").val(1).selectmenu("refresh");

		$.gr.getData("params/device").done(function(data){
			if (data.ssid == undefined || data.key == undefined || data.channel == undefined) return;
			$(self).find("input[name=wifiSSID]").val(data.ssid).trigger("blur");
			$(self).find("input[name=wifiPassword]").val(data.key).trigger("blur");
			$(self).find("select[name=wifiChannel]").val(data.channel).selectmenu("refresh");
		});
	});
});

/**
 * 繧ｻ繧ｭ繝･繝ｪ繝�ぅ險ｭ螳壹ヱ繝阪Ν
 */
$(document).one("panelcreate", "#gr-security", function(){
	var self = this;

	$(this).on("submit", function(){
		var domain = $(this).find("input[name=corsOrigin]").val(),
			passcode = $(this).find("input[name=corsPasscode]").val(),
			corsHeader = /^(|\*|http:.*)$/i.test(domain) ? domain : "http://" + domain;

		$.grist.m.busy("Transmitting", function(){
			return $.Deferred(function(dfd){
				$.gr.postCommands("cmd=cors set Access-Control-Allow-Origin " + corsHeader + " " + passcode)
					.done(function(data){
						dfd[data.retCode == 0 ? "resolve" : "reject"]();
					})
					.fail(dfd.reject);
			});
		})
		.done(function(){
			$.grist.m.notify("SUCCESS").always(function(){
				$(self).panel("close");
			});
		})
		.fail(function(){
			$.grist.m.notify("ERROR");
			$.gr.postCommands("cmd=cors genpasscode");
		});

		return false;
	});

	// 蜈･蜉帛�螳ｹ譖ｴ譁ｰ
	$(this).find("input").on("input blur", function(){
		var domainInput = $("#gr-security input[name=corsOrigin]").val().length > 0,
			passcodeInput = $("#gr-security input[name=corsPasscode]").val().length > 0;

		$(self).find(".gr-commit")[(domainInput && passcodeInput) ? "removeClass" : "addClass"]("ui-disabled");
	});

	// 繝代ロ繝ｫ陦ｨ遉ｺ貅門ｙ
	$(this).on("panelbeforeopen", function(){
		$(this).find("input[name=corsOrigin]").val("");
		$(this).find("input[name=corsPasscode]").val("");
		$(this).find("input").trigger("blur");

		$.gr.postCommands("cmd=cors genpasscode&cmd=cors get Access-Control-Allow-Origin").done(function(data){
			var corsHeader = data.retStr || "",
				domain = corsHeader.replace(/^http:\/\//, "");

			$("input[name=corsOrigin]", self).val(domain);
		});
	});

	$(this).on("panelclose", function(){
		$.gr.postCommands("cmd=cors clrpasscode");
	});
});

/**
 * 險ｭ螳壹�繝ｼ繧ｸ
 */
$(document).one("pagecreate", "#gr-config", function(){
	var panelLock;

	// 繝輔ぃ繧､繝ｫ繝輔か繝ｼ繝槭ャ繝�
	$(this).find("input[name^=view]").on("change", function(){
		$.gr.refreshSettings();
		$.gr.clearFileList();
	});

	// 繧｢繝励Μ險ｭ螳壹Μ繧ｻ繝�ヨ
	$("#gr-app-reset").on("click", function(){
		$.grist.localStorage().clear();
		$.grist.m.restart();
	});

	// UI繝��繝櫁ｨｭ螳�
	$(this).find("select[name=uiTheme]").on("change", function(){
		$.grist.m.restart();
	});

	// GR繝ｭ繧ｱ繝ｼ繧ｷ繝ｧ繝ｳ險ｭ螳�
	$(this).find("input[name=grLocation]").on("change refresh", function(){
		var customChecked = $("#gr-location-custom").prop("checked");

		$("#gr-location-domain").textinput(customChecked ? "enable" : "disable");
	});
	$("#gr-location-custom").trigger("refresh");

	$(this).find("input[name=grLocation], #gr-location-domain").on("change", function(){
		$(document).trigger("scan");
	});

	// 髢狗匱繝｢繝ｼ繝�
	$(this).find("input[name=developMode]").on("change", function(){
		$.gr.refreshSettings();
	});

	// 謾ｹ濶ｯ螳滄ｨ�
	$(this).find("#gr-config-experimental input").on("change", function(){
		$.gr.refreshSettings();
	});

	// 繝代ロ繝ｫ繧帝幕縺�
	$(this)
		.on("pagebeforeshow", function(){
			panelLock = 0;
		})
		.on("swipeleft", function(){
			if ($(".ui-page-active").jqmData("panel") != "open") {
				if (++panelLock >= 5) {
					$("#gr-config-advanced").panel("open");
				}
			}
		});

	// @todo iOS迚磯幕逋ｺ荳ｭ
	if ($.grist.platform == "iOS") {
		$(this).find("select[name=galleryAction]").on("change", function(){
			if ($(this).val() == "select") {
				$.grist.m.notify("This feature is currently unsupported for iOS.", 5 * 1000);
			}
		});
	}
});

/**
 * 髢狗匱繝壹�繧ｸ
 */
$(document).one("pagecreate", "#gr-develop", function(){
	// 繧ｳ繝槭Φ繝峨ヱ繝阪Ν
	$("#gr-command").on("submit", function(){
		var cmd = $(this).find("input[name=cmd]").val();

		$(this).find("input[type=text]").trigger("blur");
		$("#gr-result td").text("");

		$.grist.m.busy("Transmitting", function(){
			return $.gr.postCommands("cmd=" + cmd).always(function(data){
				$("#gr-result tr:has(th:contains('errCode')) td").text(data.errCode);
				$("#gr-result tr:has(th:contains('errMsg')) td").text(data.errMsg);
				$("#gr-result tr:has(th:contains('retCode')) td").text(data.retCode);
				$("#gr-result tr:has(th:contains('retStr')) td").text(data.retStr);
			});
		});

		return false;
	});

	// 繝�せ繝�
	$("#gr-test-start").on("click", function(){
		$.grist.m.popup
			.open({ html: "<h3>Starting Test</h3><p>Touch screen to terminate.</p>" }, 3 * 1000)
			.elem().one("popupafterclose", function(){
				$.grist.cam.fallback.randomViewEnabled = true;
				$.grist.m.demo.scenario = $.gr.testCases[$.grist.opts.testCase];
				$.grist.m.demo.start("fast").always(function(){
					$.grist.m.popup
						.open({ html: "<h3>Test Terminated</h3>" }, 3 * 1000)
						.elem().one("popupafterclose", function(){
							$.grist.cam.fallback.randomViewEnabled = false;
							if ($("body").pagecontainer("getActivePage").attr("id") != "gr-develop") {
								$("body").pagecontainer("change", "#gr-develop");
							}
						});
				});
			});
	});

	// API繧ｷ繝溘Η繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ險ｭ螳�
	$(this).find("select[name=apiSimulation]").on("change", function(){
		$.gr.refreshSettings();
		$.gr.clearFileList();
		$(document).trigger("scan");
	});

	// GR諠��ｱ險ｭ螳�
	$(this).find("input[name=grSysInfo]").on("change refresh", function(){
		var customChecked = $("#gr-sysinfo-manual").prop("checked");

		$("#gr-sysinfo-model").selectmenu(customChecked ? "enable" : "disable");
		$("#gr-sysinfo-version").textinput(customChecked ? "enable" : "disable");
	});
	$("#gr-sysinfo-manual").trigger("refresh");

	$(this).find("input[name=grSysInfo], #gr-sysinfo-model, #gr-sysinfo-version").on("change", function(){
		$.gr.refreshSettings();
	});

	// 縺昴�莉冶ｨｭ螳�
	$(this).find("select[name=debugMode], select[name=landscapeLayout], select[name=standaloneMode], select[name=miniMode]").on("change", function(){
		$.gr.refreshSettings();
	});
});
