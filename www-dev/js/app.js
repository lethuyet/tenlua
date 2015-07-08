// angular.module('TenLua', [  'ngRoute', 'ngAnimate', 'ngSanitize', 'hmTouchEvents', 'flow', 'ui.bootstrap.dropdown', 'ui.bootstrap.modal', 'ui.bootstrap.popover'])
angular.module('TenLua', ['ngRoute', 'ngAnimate', 'ngSanitize', 'http-auth-interceptor', 'ngStorage', 'hmTouchEvents', 'flow', 'angulartics', 'angulartics.google.analytics', 'ui.bootstrap.dropdown', 'ui.bootstrap.modal', 'ui.bootstrap.pagination', 'ui.bootstrap.tabs'])

.constant('DOMAIN_URL', 'https://demo.tenlua.vn')
.constant('API_URL', 'https://p2.tenlua.vn')
// .constant('DOMAIN_URL', 'https://tenlua.vn')
// .constant('API_URL', 'https://api2.tenlua.vn')
.constant('PROTOCOL', 'https:')
.constant('BRAND', 'tenlua.vn')
	.config(function($routeProvider, $locationProvider, $httpProvider, $provide, $sceDelegateProvider, $compileProvider, flowFactoryProvider, PROTOCOL, API_URL, AUTH_ROLES) {

		// $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://localhost:9000/**']);
		$sceDelegateProvider.resourceUrlWhitelist(['self', API_URL + '/**', PROTOCOL + '//docs.google.com/viewer**', 'http://www.facebook.com/**', 'https://www.facebook.com/**']);

		var isHtml5Mode = (typeof html5Mode !== 'undefined') ? html5Mode : true;
		// $locationProvider.html5Mode(isHtml5Mode).hashPrefix('!');
		$locationProvider.html5Mode({
			enabled: isHtml5Mode,
			requireBase: true,
			rewriteLinks: true
		}).hashPrefix('!');
		if (!isHtml5Mode) {
			$provide.decorator('$sniffer', ['$delegate',
				function($delegate) {
					$delegate.history = false;
					return $delegate;
				}
			]);
		}

		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);

		$httpProvider.defaults.cache = true;
		// $httpProvider.interceptors.push(['responseInterceptor',
		// 	function(responseInterceptor) {
		// 		return responseInterceptor;
		// 	}
		// ]);


		// flowFactoryProvider.defaults = {
		// 	// target: 'http://192.168.1.3:9000/upload',
		// 	target: 'http://123.30.109.41:9000/upload',
		// 	// permanentErrors: [404, 500, 501],
		// 	// maxChunkRetries: 1,
		// 	chunkRetryInterval: 5000,
		// 	simultaneousUploads: 3
		// };
		flowFactoryProvider.factory = fustyFlowFactory;

		$routeProvider
			.otherwise({
				redirectTo: '/'
			})
			.when('/', {
				templateUrl: 'template/home.html',
				controller: 'HomeCtrl',
				reloadOnSearch: false,
				guestOnly: true,
				resolve: {
					isGuest: function(authSrv) {
						return authSrv.checkGuest();
						// return authSrv.getUserInfo()
					}
				}
			})
			.when('/plans', {
				templateUrl: 'template/plans.html',
				controller: 'PlansCtrl',
				reloadOnSearch: false,
				roles: ['*'],
				resolve: {
					isAuthorized: function(authSrv) {
						return authSrv.checkAuthorized();
					}
				}
			})
			.when('/account-confirm/:plan/:activeId', {
				templateUrl: 'template/account-confirm.html',
				controller: 'AccountConfirmCtrl',
				reloadOnSearch: false,
				roles: ['*'],
				resolve: {
					isAuthorized: function(authSrv) {
						return authSrv.checkAuthorized();
					}
				}
			})
			.when('/payment/:plan', {
				templateUrl: 'template/payment.html',
				controller: 'PaymentCtrl',
				reloadOnSearch: false,
				roles: ['*'],
				resolve: {
					isAuthorized: function(authSrv) {
						return authSrv.checkAuthorized();
					}
				}
			})
			.when('/fm/files', {
				templateUrl: 'template/files.html',
				controller: 'FilesCtrl',
				reloadOnSearch: false,
				roles: [AUTH_ROLES.normal.name, AUTH_ROLES.gold.name, AUTH_ROLES.admin.name, AUTH_ROLES.uploader.name, AUTH_ROLES.lifetime.name],
				resolve: {
					isAuthorized: function(authSrv) {
						return authSrv.checkAuthorized();
					}
				}
			})
			.when('/fm/files/:libName', {
				templateUrl: 'template/files.html',
				controller: 'FilesCtrl',
				reloadOnSearch: false,
				roles: [AUTH_ROLES.normal.name, AUTH_ROLES.gold.name, AUTH_ROLES.admin.name, AUTH_ROLES.uploader.name, AUTH_ROLES.lifetime.name],
				resolve: {
					isAuthorized: function(authSrv) {
						return authSrv.checkAuthorized();
					}
				}
			})
			.when('/fm/folder/:nodeId/:folderName', {
				templateUrl: 'template/files.html',
				controller: 'FilesCtrl',
				reloadOnSearch: false,
				roles: ['*'],
				resolve: {
					isAuthorized: function(authSrv) {
						return authSrv.checkAuthorized();
					}
				}
			})
			.when('/fm/folder/:nodeId/:folderName/:libName', {
				templateUrl: 'template/files.html',
				controller: 'FilesCtrl',
				reloadOnSearch: false,
				roles: ['*'],
				resolve: {
					isAuthorized: function(authSrv) {
						return authSrv.checkAuthorized();
					}
				}
			})
			.when('/fm/search/:keyword/:page', {
				templateUrl: 'template/files.html',
				controller: 'SearchCtrl',
				reloadOnSearch: false,
				roles: ['*'],
				resolve: {
					isAuthorized: function(authSrv) {
						return authSrv.checkAuthorized();
					}
				}
			})
			.when('/download/:nodeId/:downloadName', {
				templateUrl: 'template/download.html',
				controller: 'DownloadCtrl',
				reloadOnSearch: false,
				roles: ['*'],
				resolve: {
					isAuthorized: function(authSrv) {
						return authSrv.checkAuthorized();
					}
				}
			})
			.when('/common/:commonPage', {
				templateUrl: 'template/common-page.html',
				controller: 'CommonPageCtrl',
				reloadOnSearch: false,
				roles: ['*'],
				resolve: {
					isAuthorized: function(authSrv) {
						return authSrv.checkAuthorized();
					}
				}
			})
			// .when('/common/faq', {
			// 	templateUrl: 'template/common-page.html',
			// 	controller: 'CommonPageCtrl',
			// 	reloadOnSearch: false,
			// 	roles: ['*'],
			// 	resolve: {
			// 		isAuthorized: function(authSrv) {
			// 			return authSrv.checkAuthorized();
			// 		}
			// 	}
			// })
			// .when('/common/policy', {
			// 	templateUrl: 'template/common-page.html',
			// 	controller: 'CommonPageCtrl',
			// 	reloadOnSearch: false,
			// 	roles: ['*'],
			// 	resolve: {
			// 		isAuthorized: function(authSrv) {
			// 			return authSrv.checkAuthorized();
			// 		}
			// 	}
			// })
			// .when('/common/uploader-policy', {
			// 	templateUrl: 'template/common-page.html',
			// 	controller: 'CommonPageCtrl',
			// 	reloadOnSearch: false,
			// 	roles: ['*'],
			// 	resolve: {
			// 		isAuthorized: function(authSrv) {
			// 			return authSrv.checkAuthorized();
			// 		}
			// 	}
			// })
			// .when('/common/agent-policy', {
			// 	templateUrl: 'template/common-page.html',
			// 	controller: 'CommonPageCtrl',
			// 	reloadOnSearch: false,
			// 	roles: ['*'],
			// 	resolve: {
			// 		isAuthorized: function(authSrv) {
			// 			return authSrv.checkAuthorized();
			// 		}
			// 	}
			// })
			// .when('/common/copyright', {
			// 	templateUrl: 'template/common-page.html',
			// 	controller: 'CommonPageCtrl',
			// 	reloadOnSearch: false,
			// 	roles: ['*'],
			// 	resolve: {
			// 		isAuthorized: function(authSrv) {
			// 			return authSrv.checkAuthorized();
			// 		}
			// 	}
			// })
	});




angular.module('TenLua').run(function($rootScope, $routeParams, $route, $location, $localStorage, authSrv, uiState, searchSrv, filesSrv, uploadSrv) {

	FastClick.attach(document.body);

	$rootScope.log = function(variable) {
		console.log(variable);
	};
	$rootScope.alert = function(text) {
		alert(text);
	};
	$rootScope.isEmpty = function(value) {
		return $.isEmptyObject(value);
	};
	$rootScope.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if (phase == '$apply' || phase == '$digest') {
			if (fn && (typeof(fn) === 'function')) {
				fn();
			}
		} else {
			this.$apply(fn);
		}
	};

	$rootScope.wrongResponse = function(data) {
		// var isNegative = (typeof data == 'string' || typeof data == 'number') && parseInt(data) < 0;
		// var isNegativeInArray = typeof data == 'object' && data.length === 1 && parseInt(data[0]) < 0;
		// return  isNegative  ||  isNegativeInArray;
		return !isNaN(parseInt(data)) && parseInt(data) < 0;
	}

	$rootScope.device = device;
	$rootScope.routeParams = $routeParams;
	$rootScope.route = $route;
	$rootScope.location = $location;
	$rootScope.localStorage = $localStorage;
	$rootScope.authSrv = authSrv;
	$rootScope.uiState = uiState;
	$rootScope.filesSrv = filesSrv;
	$rootScope.uploadSrv = uploadSrv;
	$rootScope.searchSrv = searchSrv;

});



// GLOBAL

// Detect whether device supports orientationchange event, otherwise fall back to the resize event.
var supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

function getTextNodesIn(node) {
	var textNodes = [];
	if (node.nodeType == 3) {
		textNodes.push(node);
	} else {
		var children = node.childNodes;
		for (var i = 0, len = children.length; i < len; ++i) {
			textNodes.push.apply(textNodes, getTextNodesIn(children[i]));
		}
	}
	return textNodes;
}

function setSelectionRange(el, start, end) {
	if (document.createRange && window.getSelection) {
		var range = document.createRange();
		range.selectNodeContents(el);
		var textNodes = getTextNodesIn(el);
		var foundStart = false;
		var charCount = 0,
			endCharCount;

		for (var i = 0, textNode; textNode = textNodes[i++];) {
			endCharCount = charCount + textNode.length;
			if (!foundStart && start >= charCount && (start < endCharCount ||
				(start == endCharCount && i < textNodes.length))) {
				range.setStart(textNode, start - charCount);
				foundStart = true;
			}
			if (foundStart && end <= endCharCount) {
				range.setEnd(textNode, end - charCount);
				break;
			}
			charCount = endCharCount;
		}

		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	} else if (document.selection && document.body.createTextRange) {
		var textRange = document.body.createTextRange();
		textRange.moveToElementText(el);
		textRange.collapse(true);
		textRange.moveEnd("character", end);
		textRange.moveStart("character", start);
		textRange.select();
	}
}


if (!window.location.origin) {
  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}

Array.prototype.clear = function() {
	while (this.length > 0) {
		this.pop();
	}
	// this.length = 0;
};


// Object.prototype.findKey = function(keyObj) {
// 	var p, key, val, tRet;
// 	for (p in keyObj) {
// 		if (keyObj.hasOwnProperty(p)) {
// 			key = p;
// 			val = keyObj[p];
// 		}
// 	}

// 	for (p in this) {
// 		if (p == key) {
// 			if (this[p] == val) {
// 				return this;
// 			}
// 		} else if (this[p] instanceof Object) {
// 			if (this.hasOwnProperty(p)) {
// 				tRet = this[p].findKey(keyObj);
// 				if (tRet) {
// 					return tRet;
// 				}
// 			}
// 		}
// 	}

// 	return false;
// };


// if (!XMLHttpRequest.prototype.sendAsBinary) {
// 	XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
// 		function byteValue(x) {
// 			return x.charCodeAt(0) & 0xff;
// 		}
// 		var ords = Array.prototype.map.call(datastr, byteValue);
// 		var ui8a = new Uint8Array(ords);
// 		try {
// 			this.send(ui8a);
// 		} catch (e) {
// 			this.send(ui8a.buffer);
// 		}
// 	};
// }
