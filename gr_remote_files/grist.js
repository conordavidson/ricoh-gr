/*! Copyright (c) 2015 RICOH IMAGING COMPANY, LTD. */

"use strict";

/*--------------------------------------------------------------------------*/
/**
 * 蛻晄悄蛹�
 */
(function($, undefined){
	$.grist = {
		debugMode: false,
		simulationEnabled: false,
		lastClick: $(),

		// 繝ｭ繧ｰ蜃ｺ蜉�
		log: function(){
			if (this.debugMode) {
				console.log.apply(console, arguments)
			}
		},

		// 繧｢繝ｩ繝ｼ繝郁｡ｨ遉ｺ
		alert: function(){
			if (this.debugMode) {
				window.alert.apply(window, arguments)
			}
		},

		// 繧ｳ繝｡繝ｳ繝域枚蟄怜�
		comment: function(text){
			return this.debugMode ? text : "";
		},

		// @note $.ajax()縺瑚ｿ斐☆jqXHR縺ｯstate()繧呈戟縺溘↑縺�◆繧√Λ繝��縺吶ｋ
		ajax: function(){
			return $.ajax.apply($, arguments).then(function(data){
				return $.Deferred().resolve(data).promise();
			}, function(){
				return $.Deferred().reject().promise();
			});
		}
	};

	// Thanks to http://proger.i-forge.net
	$.grist.image = {
		null: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
	};

	// Class荳諡ｬ蜑企勁繝｡繧ｽ繝�ラ
	$.fn.extend({
		removeClassGroup: function(value){
			var re = new RegExp("\\b" + value + "\\S+", "g");

			this.each(function(){
				$(this).removeClass(function(index, css){
					return (css.match(re) || []).join(" ");
				});
			});

			return this;
		}
	});

	// 繝�く繧ｹ繝井ｸ閾ｴ遒ｺ隱咲畑繧ｫ繧ｹ繧ｿ繝�繧ｻ繝ｬ繧ｯ繧ｿ
	$.expr[":"].textIs = $.expr.createPseudo(function(arg){
		return function(e){
			return $(e).text() == arg;
		}
	});

	// 繧ｹ繧ｯ繝ｪ繝励ヨ繧ｨ繝ｩ繝ｼ譎ゅ↓繧｢繝ｩ繝ｼ繝郁｡ｨ遉ｺ
	window.onerror = function(message, url, lineNo){
		$.grist.alert("Error: " + message + "\nUrl: " + url + "\nLine Number: " + lineNo);
	};

	// 逶ｴ蜑阪�繧ｯ繝ｪ繝�け蟇ｾ雎｡繧呈峩譁ｰ
	$(document).on("click", "a", function(){
		$.grist.lastClick = $(this);
	});

	// AJAX繧ｨ繝ｩ繝ｼ繝ｭ繧ｰ蜃ｺ蜉�
	$(document).ajaxError(function(e, jqXHR, settings, thrownError){
		$.grist.log("ajax: error (" + [settings.url, jqXHR.status, jqXHR.statusText, thrownError].join(", ") + ")");
	});
})(jQuery);

/*--------------------------------------------------------------------------*/
/**
 * 繝ｦ繝ｼ繝�ぅ繝ｪ繝�ぅ
 */
(function($, undefined){
	$.grist.util = {
		deparam: function(query){
			var params = {}, spritQuery,
				i, pair, key, value;

			// @note Hash縺ｮ諡｡蠑ｵ繝��繧ｿ繧りｧ｣譫仙ｯｾ雎｡縺ｨ縺吶ｋ
			spritQuery = query.replace(/.*[\?#]/, "").replace("#", "&").replace(/\+/g, "%20").split("&");
			for (i = 0; i < spritQuery.length; i++) {
				pair = spritQuery[i].split("=");
				if  (pair.length >= 2) {
					key = decodeURIComponent(pair[0]);
					value = decodeURIComponent(pair[1]);
					params[key] = value;
				}
			}
			return params;
		},

		toTitleCase: function(str){
			return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match){
				return match.toUpperCase();
			});
		},

		toLocalISOTime: function(date){
			var tzoffset = (new Date()).getTimezoneOffset() * 60000,
				localISOTime = (new Date(date - tzoffset)).toISOString().slice(0,-1);

			return localISOTime;
		},

		fromLocalISOTime: function(isoTime){
			var tzoffset = (new Date()).getTimezoneOffset() * 60000,
				date = new Date((new Date(isoTime)).getTime() + tzoffset);

			return date;
		},

		toLocaleDateString: function(date){
			var dateString = date.toLocaleDateString(),
				comps = [];

			if (dateString.match(/(\d+)[^\d]+(\d+)[^\d]+(\d+)/)) {
				comps = [RegExp.$1, RegExp.$2, RegExp.$3];
			} else {
				// MM/DD/YYYY
				comps = [date.getMonth() + 1, date.getDate(), date.getFullYear()];
			}

			comps = $.map(comps, function(comp){
				return comp.toString().length < 2 ? ("00" + comp).slice(-2) : comp;
			});

			return comps.join("/");
		},

		toLocaleTimeString: function(date){
			var timeString = date.toLocaleTimeString();

			if (timeString.match(/(\d+:\d+:\d+)( [AP]M)?/)) {
				timeString = RegExp.$1 + RegExp.$2;
			} else {
				// hh:mm:ss
				timeString = date.getHours() + ":" +
					("00" + date.getMinutes()).slice(-2) + ":" + ("00" + date.getSeconds()).slice(-2);
			}

			return timeString;
		},

		toLocaleString: function(date){
			return this.toLocaleDateString(date) + " " + this.toLocaleTimeString(date);
		}
	};
})(jQuery);

/**
 * URI隗｣譫�
 */
(function($, undefined){
	$.grist.uri = {
		base: function(uri){
			return uri.replace(/[\?#].*/, "");
		},
		query: function(uri){
			return uri.replace(/.*\?/, "").replace(/#.*/, "");
		},
		fragment: function(uri){
			return uri.replace(/.*#/, "");
		},

		filename: function(uri){
			return this.base(uri).replace(/^.*\//, "");
		}
	};
})(jQuery);

/*--------------------------------------------------------------------------*/
/**
 * 繧ｹ繝医Ξ繝ｼ繧ｸ Thanks to jquery.storage.js
 */
(function($, undefined){
	$.map(["localStorage", "sessionStorage"], function(method){
		$.grist[method] = function(key, value){
			this.getItem = function(key){
				var returns = function(key){
						// @note Android2.3 JSON.parse(null)繧ｨ繝ｩ繝ｼ蟇ｾ遲�
						// return JSON.parse(window[method].getItem($.grist[method].prefix + key));
						return JSON.parse(window[method].getItem($.grist[method].prefix + key) || "null");
					},
					arr = [],
					i = key.length;

				if (typeof key === "string") return returns(key);

				while (i--) arr[i] = returns(key[i]);
				return arr;
			};

			this.setItem = function(key, value){
				value = JSON.stringify(value);
				// @note iOS Private Browsing譎ゅ�繧ｨ繝ｩ繝ｼ蟇ｾ遲�
				try {
					window[method].setItem($.grist[method].prefix + key, value);
				} catch (e) {
					$.grist.log(e);
				}
			};

			this.removeItem = function(key){
				window[method].removeItem($.grist[method].prefix + key);
			};

			this.clear = function(){
				if ($.grist[method].prefix) {
					Object.keys(window[method]).map(function(k){
						if (k.indexOf($.grist[method].prefix) == 0) {
							window[method].removeItem(k);
						}
					});
					return;
				}
				window[method].clear();
			};

			if (typeof key !== "undefined") {
				return typeof value === "undefined" ? this.getItem(key) :
					value === null ? this.removeItem(key) : this.setItem(key, value);
			}

			return this;
		};

		$.grist[method].prefix = "";
	});
})(jQuery);

/**
 * 繧ｭ繝｣繝�す繝･
 */
(function(){
	$.grist.Cache = function(storage, limit){
		var cache = {
			_storage: storage,
			_limit: limit,
			_trunc: limit * 2 / 3,
			_data: {},

			_truncate: function(){
				var self = this,
					keys = Object.keys(self._data);

				keys.sort(function(a, b){
					return self._data[a].ts < self._data[b].ts ? -1 : 1;
				});
				$.each(keys, function(i, key){
					if (i >= keys.length - self._trunc) return false;
					delete self._data[key];
				});
			},

			put: function(key, object){
				this._data[key] = { obj: $.extend({}, object), ts: Date.now() };
			},

			get: function(key){
				var cache = this._data[key];

				if (cache == undefined) return undefined;

				cache.ts = Date.now();
				return $.extend({}, cache.obj);
			},

			save: function(){
				var len = Object.keys(this._data).length;

				if (len > this._limit) {
					this._truncate();
					len = Object.keys(this._data).length;
				}

				$.grist.localStorage(storage, this._data);
				$.grist.localStorage(storage + ".length", len);
				$.grist.log("cache: " + len + " entries saved");
			},

			load: function(){
				var len;

				this._data = $.grist.localStorage(storage) || {};
				len = Object.keys(this._data).length;

				if (len > this._limit) {
					this._truncate();
					len = Object.keys(this._data).length;
				}
				$.grist.log("cache: " + len + " entries loaded");
			}
		};

		return cache;
	}
})();

/**
 * 繝ｫ繝ｼ繝ｬ繝�ヨ
 */
(function($, undefined){
	$.grist.Roulette = function(wheelFile){
		var roulette = {
			_wheelLayout: [],
			_totalWeight: 0,

			get: function(){
				var w = Math.random() * this._totalWeight,
					item;

				$.each(this._wheelLayout, function(){
					w -= this.weight;
					if (w < 0) {
						item = this;
						return false;
					}
				});

				return item;
			}
		};

		$.getJSON(wheelFile).done(function(data){
			roulette._wheelLayout = data;
			$.each(roulette._wheelLayout, function(){
				if (this.weight == undefined) this.weight = 1;
				roulette._totalWeight += this.weight;
			});
		});

		return roulette;
	};
})(jQuery);

/*--------------------------------------------------------------------------*/
/**
 * 逕ｻ蜒上Ο繝ｼ繝�
 */
(function($, undefined){
	$.grist.grLoadImage = {
		active: 0
	};

	$.fn.extend({
		grLoadImage: function(src){
			var LOAD_RETRY_COUNT = 1, LOAD_RETRY_INTERVAL = 1000;

			this.each(function(){
				var image = $(this);

				if (!$(this).is("img")) return;

				(function load(retry){
					var ILLEGAL_TIMEOUT = 3 * 1000,
						dfd = $.Deferred(),
						timeout;

					$.grist.grLoadImage.active++;

					image
						.hide()
						.attr("src", $.grist.image.null)
						.on("load error", function(){
							image.off("load error");
							dfd.resolve();
						})
						.on("error", function(){
							image.attr("src", $.grist.image.null).fadeIn("fast");
							if (retry-- > 0) {
								setTimeout(function(){
									load(retry);
								}, LOAD_RETRY_INTERVAL);
							}
						})
						.on("load", function(){
							image.fadeIn("fast");
						})
						// 繝上ャ繧ｷ繝･縺ｪ縺励�逕ｻ蜒上ｒ隱ｭ縺ｿ霎ｼ繧薙〒縺翫°縺ｪ縺�→AppCache譛牙柑譎ゅ↓繧ｨ繝ｩ繝ｼ縺ｨ縺ｪ繧�
						.attr({ src: src.replace(/#.*/, ""), "data-gr-src": src });

					timeout = setTimeout($.proxy(dfd.reject, dfd), ILLEGAL_TIMEOUT);

					dfd.done(function(){
						clearTimeout(timeout);
						timeout = null;
					})
					.always(function(){
						$.grist.grLoadImage.active--;
					});
				})(LOAD_RETRY_COUNT);
			});

			return this;
		}
	});
})(jQuery);

/**
 * 繧ｫ繝｡繝ｩ讀懃ｴ｢
 */
(function($, undefined){
	$.grist.scanner = {
		scanDomains: undefined,
		foundDomains: [],

		state: function(){
			return this.find._dfd && this.find._dfd.state() == "pending" ? "active" : "idle";
		},

		ping: function(){
			var AJAX_TIMEOUT = 3 * 1000,
				dfd = $.Deferred(), promises = [],
				self = this, i;

			function checkConnection(domain) {
				if ($.grist.simulationEnabled) {
					promises.push($.Deferred(function(d){
						setTimeout(function(){
							self.foundDomains.push(domain);
							d.resolve();
						}, 500);
					}));
					return;
				}

				promises.push($.Deferred(function(d){
					return $.grist.ajax(domain + "v1/ping", { timeout: AJAX_TIMEOUT })
						.done(function(){
							self.foundDomains.push(domain);
						})
						.always(function(){
							d.resolve();
						});
				}));
			}

			self.foundDomains = [];

			if (self.scanDomains) {
				$.each(self.scanDomains, function(){
					checkConnection(this);
				});
			} else {
				// 繧ｳ繝ｳ繝�Φ繝�→蜷御ｸ繝峨Γ繧､繝ｳ
				checkConnection("");

				// AP譎ゅョ繝輔か繝ｫ繝�
				checkConnection("http://192.168.0.1/");
			}

			$.when.apply($, promises).done(function(){
				if (self.foundDomains.length > 0) {
					dfd.resolve(self.foundDomains);
				} else {
					dfd.reject();
				}
			});

			return dfd.promise();
		},

		find: function(timeout){
			var INTERVAL = 3 * 1000, DEFAULT_TIMEOUT = 30 * 1000,
				timeout, scanCount,
				dfd = $.Deferred(),
				self = this;

			if (timeout == undefined) {
				// @note 繝｢繝舌う繝ｫ遶ｯ譛ｫ縺ｮ縺ｿ邯咏ｶ壹メ繧ｧ繝�け
				scanCount = /iOS|Android/.test($.grist.platform) ? Math.ceil(DEFAULT_TIMEOUT / INTERVAL) : 1;
			} else {
				scanCount = Math.ceil(timeout / INTERVAL);
			}

			if (this.find._dfd) {
				this.find._dfd.rejectWith(this, ["abort"]);
			}
			this.find._dfd = dfd;

			(function scan(){
				self.ping()
					.always(function(){
						$.grist.log("scanner: " + this.state());
					})
					.fail(function(){
						if (--scanCount == 0) {
							dfd.rejectWith(this, ["timeout"]);
						} else {
							setTimeout(scan, INTERVAL);
						}
					})
					.done(function(){
						dfd.resolve(self.foundDomains);
					});
			})();

			return dfd.promise();
		},

		keep: function(){
			var POLLING_INVERVAL = 5 * 1000,
				ws = new WebSocket(this.foundDomains[0].replace(/^http:/, "ws:") + "v1/changes?heartbeat=on"),
				pingTimeout = null,
				dfd = $.Deferred();

			function watchDog() {
				clearTimeout(pingTimeout);
				pingTimeout = null;

				pingTimeout = setTimeout(function(){
					ws.close();
					ws = null;
					dfd.resolve();
				}, POLLING_INVERVAL);
			}

			$(ws)
				.on("open", function(){
					watchDog();
				})
				.on("message", function(e){
					var data = JSON.parse(e.originalEvent.data);

					if (data.errMsg == "OK") {
						watchDog();
					}
				})
				.on("close error", function(){
					dfd.reject();
				});

			return dfd.promise();
		}
	}
})(jQuery);

/**
 * 繧ｫ繝｡繝ｩ蛻ｶ蠕｡
 */
(function($, undefined){
	$.grist.cam = {
		activeDomains: [],

		state: function(){
			return this.activeDomains.length > 0 ? "online" : "offline";
		},

		post: function(url, data, options){
			var defaults = { type: "POST" },
				settings;

			// @note 繧ｪ繝悶ず繧ｧ繧ｯ繝医�蝣ｴ蜷医ゞRI繧ｨ繝ｳ繧ｳ繝ｼ繝峨ｒ辟｡蜉ｹ蛹�
			if (data != undefined && typeof data != "string") {
				data = $.param(data);
				data = decodeURIComponent(data);
			}

			if (typeof data != "string") {
				$.grist.log("post: " + [url, JSON.stringify(data)].join(", "));
			} else {
				$.grist.log("post: " + [url, data].join(", "));
			}

			settings = $.extend({}, defaults, options);
			if (this.simulation.post && $.grist.simulationEnabled) {
				return this.simulation.post(url, data);
			}

			if (this.activeDomains.length > 0) {
				$.extend(settings, { url: this.activeDomains[0] + url, data: data });
				return $.grist.ajax(settings);
			}

			if (this.fallback.post) {
				return this.fallback.post(url, data);
			}

			return $.Deferred().reject().promise();
		},

		put: function(url, data, options) {
			return this.post(url, data, $.extend({}, options, { method: "PUT" }));
		},

		get: function(url, data, options) {
			var defaults = { type: "GET" },
				settings;

			settings = $.extend({}, defaults, options);
			data = typeof data != "string" ? data : data.replace(/ /g, "+");

			if (url.indexOf("http:") == 0) {
				$.extend(settings, { url: url, data: data });
				return $.grist.ajax(settings);
			}

			if (this.simulation.get && $.grist.simulationEnabled) {
				return this.simulation.get(url, data);
			}

			if (this.activeDomains.length > 0) {
				$.extend(settings, { url: this.activeDomains[0] + url, data: data });
				return $.grist.ajax(settings);
			}

			if (this.fallback.get) {
				return this.fallback.get(url, data);
			}

			return $.Deferred().reject().promise();
		},

		src: function(url){
			if (url.indexOf("http:") == 0) {
				return url;
			}

			if (this.simulation.src && $.grist.simulationEnabled) {
				return this.simulation.src(url);
			}

			if (this.activeDomains.length > 0) {
				return this.activeDomains[0] + url;
			}

			if (this.fallback.src) {
				return this.fallback.src(url);
			}
		}
	};
})(jQuery);

/**
 * 莠亥ｙ繝輔ぃ繧､繝ｫ蜍穂ｽ�
 */
(function($, undefined){
	$.grist.cam.fallback = {
		fallbackDir: "fallback/",
		fallbackDate: new Date(),
		randomViewFile: null,
		randomViewEnabled: false,
		postDuration: 100,
		getDuration: 0,
		_roulette: null,

		post: function(url, data){
			var self = this;

			return $.Deferred(function(dfd){
				setTimeout(function(){
					dfd.resolve({ errCode: 200, errMsg: "OK" });
				}, self.postDuration);
			}).promise();
		},

		get: function(url, data){
			var self = this,
				settings = { type: "GET" },
				params = $.grist.util.deparam(url.replace(/.*#/, "")),
				filename = $.grist.uri.filename(url),
				objStyle;

			if (/^(photos|objs)$/.test(filename)) {
				objStyle = RegExp.$1;

				$.extend(settings, {
					url: this.fallbackDir + filename + ".json",
					beforeSend: function(xhr){
						xhr.overrideMimeType("application/json");
					}
				});
				return $.grist.ajax(settings).done(function(objs){
					if (objStyle == "objs") {
						$.each(objs.dirs, function(i, dir){
							$.each(dir.files, function(i, file){
								file.d = $.grist.util.toLocalISOTime(self.fallbackDate);
							});
						});
					}
				});
			}

			if (/\.jpg$/i.test(filename)) {
				$.extend(settings, { url: this.fallbackDir + "DCIM/" + params.fn });
				return $.grist.ajax(settings);
			}

			return $.Deferred(function(dfd){
				setTimeout(function(){
					dfd.resolve({ errCode: 200, errMsg: "OK" });
				}, self.getDuration);
			}).promise();
		},

		src: function(url){
			var params = $.grist.util.deparam(url),
				filename = $.grist.uri.filename(url),
				viewfile;

			if (/^(liveview|display)$/.test(filename)) {
				viewfile = this.randomViewEnabled && this._roulette.get && this._roulette.get().file || "liveview.jpg";
				url = this.fallbackDir + viewfile;
			}

			if (/\.jpg$/i.test(filename)) {
				url = this.fallbackDir + "DCIM/" + params.fn;
			}

			// thumb繧致iew縺ｧ莉｣譖ｿ
			if (params.size == "thumb") {
				params.size = "view";
			}

			// 繝上ャ繧ｷ繝･縺ｫ繝代Λ繝｡繝ｼ繧ｿ繧剃ｿ晄戟
			if (!$.isEmptyObject(params)) {
				url += "#" + $.param(params);
			}

			return url;
		}
	};

	$(function(){
		if ($.grist.cam.fallback.randomViewFile) {
			$.grist.cam.fallback._roulette = $.grist.Roulette($.grist.cam.fallback.fallbackDir + $.grist.cam.fallback.randomViewFile);
		}
	});
})(jQuery);

/**
 * 繧ｷ繝溘Η繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ蜍穂ｽ�
 */
(function($, undefined){
	$.grist.cam.simulation = {
		imageDir: "fallback/DCIM/101RICOH/",
		imagePrefix: "R00000",
		imageCount: 9,
		postDuration: 100,
		getDuration: 0,

		post: function(url, data){
			var self = this;

			return $.Deferred(function(dfd){
				setTimeout(function(){
					dfd.resolve({ errCode: 200, errMsg: "OK" });
				}, self.postDuration);
			}).promise();
		},

		get: function(url, data){
			var self = this,
				dfd = $.Deferred(),
				filename = $.grist.uri.filename(url),
				photos = { dirs: [] }, files, file,
				objStyle,
				i;

			if (/^(photos|objs)$/.test(filename)) {
				objStyle = RegExp.$1;

				// 繝�せ繝育畑繝輔ぃ繧､繝ｫ繝ｪ繧ｹ繝�
				files = [];
				for (i = 1; i <= 3; i++) {
					file = { n: "R000" + ("0000" + i).slice(-4) + ".JPG", o: 1, s: " F" };
					files.push(objStyle == "photos" ? file.n : file);
				}
				photos.dirs.push({ name: "100RICOH", files: files });

				files = [];
				for (i = 1; i <= 321; i++) {
					file = { n: "R000" + ("0000" + i).slice(-4) + ".JPG", o: 1, s: " F" };
					files.push(objStyle == "photos" ? file.n : file);
				}
				photos.dirs.push({ name: "123RICOH", files: files });

				return dfd.resolve(photos).promise();
			}

			return $.Deferred(function(dfd){
				setTimeout(function(){
					dfd.resolve({ errCode: 200, errMsg: "OK" });
				}, self.getDuration);
			}).promise();
		},

		src: function(url){
			var params = $.grist.util.deparam(url),
				filename = $.grist.uri.filename(url),
				r, i;

			if (/^(liveview|display)$/.test(filename)) {
				url = this.imageDir + this.imagePrefix + "01.JPG";
			}

			if (/\.jpg$/i.test(filename)) {
				// 繝�せ繝育畑逕ｻ蜒上ョ繝ｼ繧ｿ
				r = params.fn.match(/R000(\d+)\.JPG/);
				i = parseInt(r[1]) % this.imageCount + 1;

				url = this.imageDir + this.imagePrefix + ("00" + i).slice(-2) + ".JPG";
			}

			// 繝上ャ繧ｷ繝･縺ｫ繝代Λ繝｡繝ｼ繧ｿ繧剃ｿ晄戟
			if (!$.isEmptyObject(params)) {
				url += "#" + $.param(params);
			}

			return url;
		}
	};
})(jQuery);

/*--------------------------------------------------------------------------*/
/**
 * 繧ｪ繝励す繝ｧ繝ｳ險ｭ螳�
 */
(function($, undefined){
	var checkableTypeRE = /^(?:checkbox|radio)$/i,
		formElemRE = /^(?:input|select)$/i;

	$.grist.opts = {};
	$.grist.opt = function(name, value){
		if (value != undefined) {
			$.grist.localStorage("options." + name, this.opts[name] = value);
			return this;
		} else {
			if (this.opts[name] == undefined) {
				// 襍ｷ蜍輔ヱ繝ｩ繝｡繝ｼ繧ｿ縺ｾ縺溘�繝ｭ繝ｼ繧ｫ繝ｫ繧ｹ繝医Ξ繝ｼ繧ｸ縺九ｉ繧ｪ繝励す繝ｧ繝ｳ險ｭ螳夊ｪｭ縺ｿ霎ｼ縺ｿ
				if (	(value = $.grist.args[name]) != undefined ||
						(value = $.grist.localStorage("options." + name)) != null) {
					this.opts[name] = value;
				}
			}
			return this.opts[name];
		}
	}

	$.fn.extend({
		optionValue: function(value){
			var elem = this[0];

			if (value != undefined) {
				if (checkableTypeRE.test(elem.type)) {
					elem.checked = (elem.value == value);
				} else {
					$(elem).val(value);
				}
				return this;
			} else {
				return (!checkableTypeRE.test(elem.type) || elem.checked) ? $(elem).val() : null;
			}
		},
		formObject: function(obj){
			var elem = this[0];

			if (obj != undefined) {
				elem.reset();

				$(elem).find("[name]:not([type=hidden])").each(function(){
					if (obj[this.name] != undefined) {
						$(this).val(obj[this.name]);
					}
				});
			} else {
				obj = {};

				$(elem).find("[name]:not([type=hidden])").each(function(){
					if (checkableTypeRE.test(this.type)) {
						if (!$.isArray(obj[this.name])) obj[this.name] = [];
						if (this.checked) obj[this.name].push(this.value);
					} else {
						obj[this.name] = $(this).val();
					}
				});

				return obj;
			}
		},

		saveOption: function(){
			this.each(function(){
				var value = $(this)[formElemRE.test(this.nodeName) ? "optionValue" : "formObject"]();

				$.grist.opt(this.name, value != null ? value : "");
			});
			return this;
		},
		loadOption: function(){
			this.each(function(){
				var value = $.grist.opt(this.name);

				if (value == undefined) {
					$.grist.opts[this.name] = $(this)[formElemRE.test(this.nodeName) ? "optionValue" : "formObject"]();
				} else {
					$(this)[formElemRE.test(this.nodeName) ? "optionValue" : "formObject"](value);
				}
			});
			return this;
		}
	});
})(jQuery);

/**
 * 蛻晄悄險ｭ螳�
 */
(function($, undefined){
	// 襍ｷ蜍輔ヱ繝ｩ繝｡繝ｼ繧ｿ險ｭ螳�
	$.grist.args = $.grist.util.deparam(location.search);

	// 繝ｭ繧ｰ蜃ｺ蜉幄ｨｭ螳�
	$.grist.log.enabled = $.grist.args.debug == "on";

	// 繝励Λ繝�ヨ繝輔か繝ｼ繝�蛻､螳�
	$.grist.platform =
		/iPhone|iPad|iPod/.test(navigator.platform) ? "iOS" :
		/Android/.test(navigator.userAgent) ? "Android" :
		/MacIntel/.test(navigator.platform) ? "Mac" :
		/Win/.test(navigator.platform) ? "Win" :
		"default";

	// 繝悶Λ繧ｦ繧ｶ蛻､螳�
	$.grist.browser =
		/MSIE/.test(navigator.userAgent) ? "IE" :
		/Chrome|CriOS/.test(navigator.userAgent) ? "Chrome" :
		/Safari/.test(navigator.userAgent) ? "Safari" :
		"default";

	$.grist.log("platform: " + $.grist.platform);
	$.grist.log("browser: " + $.grist.browser);
})(jQuery);
