'use strict';

angular.module('TenLua')

.constant('AUTH_ANTILEAK', 'TENLUA-Chrome-Antileak')
.constant('AUTH_EVENTS', {
	signupSuccess: 'event:auth-signupSuccess',
	loginRequired: 'event:auth-loginRequired',
	loginConfirmed: 'event:auth-loginConfirmed',
	loginFailed: 'event:auth-loginFailed',
	signupFailed: 'event:auth-signupFailed',
	logoutComplete: 'event:auth-logoutComplete'
})
.constant('AUTH_ROLES', {
	all: {
		name: '*',
		code: -1
	},
	guest: {
		name: 'guest',
		code: 0
	},
	unactive: {
		name: 'unactive',
		code: 1
	},
	normal: {
		name: 'free',
		code: 2
	},
	gold: {
		name: 'gold',
		code: 3
	},
	admin: {
		name: 'admin',
		code: 6
	},
	uploader: {
		name: 'uploader',
		code: 8
	},
	lifetime: {
		name: 'lifetime',
		code: 9
	}
})

.config(function($httpProvider) {
	$httpProvider.interceptors.push(['authInterceptor', function(authInterceptor) {
		return authInterceptor;
	}]);
})

.factory('authInterceptor', function($q, $localStorage, AUTH_ROLES, AUTH_ANTILEAK) {
	var service = {
		requestId: new Date().getTime(),
		getRequestIdStr: function(){
			return '/?id=' + (this.requestId++);
		},

		getAntiLeakHeader: function(){
			return this.getRequestIdStr() + ( $localStorage.AUTH_sessionId ? '&sid=' + $localStorage.AUTH_sessionId : '' );
		},

		request: function(config) {
			if(config){
				config.withCredentials = true;
				if(!config.noAuthHeader){
					config.headers[AUTH_ANTILEAK] = service.getAntiLeakHeader();
				}
			}
			return config || $q.when(config);
		}
	};
	return service;
})

.factory('authSrv', function($rootScope, $http, $route, $routeParams, $location, $q, $localStorage, authService, authInterceptor, $modal, dialog, filesSrv, uiState, API_URL, AUTH_ANTILEAK, AUTH_EVENTS, AUTH_ROLES) {
	// var userInfoRequested = false;
	var service = {
		loginModalInstance: null,
		loginModalOpened: false,
		loginMessage: null,
		userInfoRequested: false,

		routeNotForGuest: function(route){
			var route = route ? route : $route;
			if(route.current){
				return route.current.roles && route.current.roles.length && route.current.roles.indexOf(AUTH_ROLES.all.name)==-1;
			}
		},

		clearUserSession: function(){
			delete $localStorage.AUTH_currentUser;
			delete $localStorage.AUTH_sessionId;
		},

		// setCurrentUser: function(data, user){
		setCurrentUser: function(data){
			function getRole(){
				var result = null;
				for (var i in AUTH_ROLES){
					var role = AUTH_ROLES[i];
					if (role.code == parseInt(data[0].utype) ){
						result = role;
						break;
					}
				}
				return result;
			}

			$localStorage.AUTH_currentUser = $localStorage.AUTH_currentUser ? $localStorage.AUTH_currentUser : {};
			angular.extend($localStorage.AUTH_currentUser, {
				fullName: data[0].full_name,
				id: data[0].uid,
				email: data[0].email,
				avatar: data[0].avatar,
				golds: parseInt(data[0].golds),
				role: getRole(),
				store: data[0].store ? parseFloat(data[0].store) : 0,
				storeUsed: data[0].store_used ? parseFloat(data[0].store_used) : 0,
				free: data[0].free ? parseFloat(data[0].free) : 0,
				freeUsed: data[0].free_used ? parseFloat(data[0].free_used) : 0,
				endGold: data[0].endGold,
				transfers: data[0].transfer,
				downloadHistory: data[0].history_download
			});
			// if(user && user.loginRemembered){
			// 	$localStorage.AUTH_currentUser.password = user.password;
			// }
		},

		// signUpAnonymous: function(){
		// 	var postData = [{a: "user_create"}];
		// 	var postConfig = { headers:{} };
		// 	postConfig.headers[AUTH_ANTILEAK] = this.getRequestIdStr();
		// 	return $http.post(API_URL, postData, postConfig);
		// },

		getUserInfo: function(){
			var self = this;
			var postData = [{a: "user_info", r: Math.random()}];
			var postConfig = { ignoreAuthModule: true, headers:{}, cache: false };
			// postConfig.headers[AUTH_ANTILEAK] = this.getAntiLeakHeader();
			return $http.post(API_URL, postData, postConfig).success(function(){
				self.userInfoRequested = true;
			});
			// return data:
			// [{"uid":"abcxyz123","utype":"6","email":"test@gmail.com","store":"0","store_used":"52525948","free":"0","free_used":"27059677615","endGold":"25-09-2013","transfer":[{"transfer_gold":"0.00","day_of_transfer":"30","description":"Free One Month","start_transfer_date":"24-09-2013"},{"transfer_gold":"0.00","day_of_transfer":"30","description":"Free One Month","start_transfer_date":"24-09-2013"}]}]

			// $http.post(API_URL, postData, postConfig)
			// 	.success(function(data, status, headers, config){
			// 		self.setCurrentUser(data);
			// 		// Need to inform the http-auth-interceptor that
			// 		// the user has logged in successfully.  To do this, we pass in a function that
			// 		// will configure the request headers with the authorization token so
			// 		// previously failed requests(aka with status == 401) will be resent with the
			// 		// authorization token placed in the header
			// 		authService.loginConfirmed(data, function(config) { // Step 2 & 3
			// 			// config.headers.Authorization = data.authorizationToken;
			// 			config.headers[AUTH_ANTILEAK] = self.getAntiLeakHeader();
			// 			return config;
			// 		});
			// 	});
		},

		updateUserInfo: function(fn){
			var self = this;
			self.getUserInfo()
				.success(function(data, status, headers, config){
					self.setCurrentUser(data);
					fn && fn();
				})
				.error(function(data, status, headers, config){
					alertify.error('Có lỗi xảy ra. Xin thử lại sau.');
				});
		},

		loginError: function(data, status, headers, config){
			if(status != 401){
				service.isErrorLogin = true;
				service.loginMessage = 'Đăng nhập không thành công, vui lòng thử lại sau!';
				alertify.error(service.loginMessage);
				//log('loginError error. start broadcast logoutComplete');
				$rootScope.$broadcast(AUTH_EVENTS.logoutComplete);
			} else {
				//log('start broadcast loginFailed');
				$rootScope.$broadcast(AUTH_EVENTS.loginFailed, {data:data, status:status, headers:headers, config:config});
			}
		},

		saveSessionAndConfirmLogin: function(data, user){
			var self = this;
			// if(typeof data == 'string' && parseInt(data) < 0){
			if($rootScope.wrongResponse(data)){
				//log('Response status 200 OK, but the response data is incorrect. Here is the info: ' + {data:data, status:status, headers:headers, config:config});
				//log('start broadcast loginFailed');
				$rootScope.$broadcast(AUTH_EVENTS.loginFailed, {data:data, status:status, headers:headers, config:config});
			} else {
				//log('login success. Start set $localStorage.AUTH_sessionId...');
				// $localStorage.setItem('sessionId',data[0]);
				$localStorage.AUTH_sessionId = data[0] || data.sid;
				//log('typeof localStorage.setItem: ' + typeof localStorage.setItem);
				// $http.defaults.headers.common.Authorization = data.authorizationToken; // Step 1
				// $http.defaults.headers.common[AUTH_ANTILEAK] = self.getAntiLeakHeader(); // Step 1

				// self.getUserInfo();
				//log('login success. start getUserInfo...');
				self.getUserInfo()
					.success(function(_data, _status, _headers, _config){
						//log('getUserInfo success. Here is the $localStorage.AUTH_sessionId: ' + $localStorage.AUTH_sessionId);
						//log('getUserInfo success. start authService.loginConfirmed...');
						// self.setCurrentUser(_data, user);
						// Need to inform the http-auth-interceptor that
						// the user has logged in successfully.  To do this, we pass in a function that
						// will configure the request headers with the authorization token so
						// previously failed requests(aka with status == 401) will be resent with the
						// authorization token placed in the header
						authService.loginConfirmed({data:_data, user:user}, function(config) { // Step 2 & 3
							// config.headers.Authorization = data.authorizationToken;
							config.headers[AUTH_ANTILEAK] = authInterceptor.getAntiLeakHeader();
							return config;
						});
					})
					.error(self.loginError);
					// .error(function(_data, _status, _headers, _config){
					// 	log('getUserInfo error. Here is the error info: ' + {_data:_data, _status:_status, _headers:_headers, _config:_config});
					// 	log('getUserInfo error. Here is the $localStorage.AUTH_sessionId: ' + $localStorage.AUTH_sessionId);
					// 	self.loginError(_data, _status, _headers, _config);
					// 	// if(_status != 401){
					// 	// 	alertify.error('Cố lỗi xảy ra, vui lòng thử lại sau!');
					// 	// 	log('getUserInfo error. start broadcast logoutComplete');
					// 	// 	$rootScope.$broadcast(AUTH_EVENTS.logoutComplete);
					// 	// } else {
					// 	// 	log('start broadcast loginFailed');
					// 	// 	$rootScope.$broadcast(AUTH_EVENTS.loginFailed, {data:_data, status:_status, headers:_headers, config:_config});
					// 	// }
					// });
			}
		},

		signup: function(user){
			// if(!user.termAccepted){
			// 	alertify.error('Bạn chưa đồng ý với điều khoản của tenlua.vn!',0);
			// 	return;
			// }
			//log('start signup...');
			var self = this;
			var deferred = $q.defer();
			var postData = [{a: "user_signup"}];
			var postConfig = {ignoreAuthModule: true, headers:{} };

			postData[0].n = user.name;
			postData[0].m = user.email;
			postData[0].p = user.password;
			postData[0].plan = user.plan;
			postData[0].captcha = user.captcha;
			postData[0].sessionid = user.sid;

			//log('start .post user_signup');
			$http.post(API_URL, postData, postConfig)
				.success(function(data, status, headers, config) {
					if(parseInt(data[0]) === 0){
						$rootScope.$broadcast(AUTH_EVENTS.signupSuccess, {data:data, status:status, headers:headers, config:config, user:user});
						deferred.resolve();
					} else {
						$rootScope.$broadcast(AUTH_EVENTS.signupFailed, {data:data, status:status, headers:headers, config:config, user:user});
						deferred.reject();
					}
					// if(data[0] == -11){
					// 	$rootScope.$broadcast(AUTH_EVENTS.signupFailed, {data:data, status:status, headers:headers, config:config, user:user});
					// } else {
					// 	//log('start broadcast signupSuccess');
					// 	$rootScope.$broadcast(AUTH_EVENTS.signupSuccess, {data:data, status:status, headers:headers, config:config, user:user});
					// }
				})
				.error(function(data, status, headers, config) {
					alertify.error('Không thể đăng ký, vui lòng thử lại sau!');
					deferred.reject();
				});

			return deferred.promise;
		},

		verifyUser: function(activeId){
			//log('start verify user...');
			var self = this;
			var postData = [{a: "user_verify", c: activeId}];
			var postConfig = {ignoreAuthModule: true, headers:{} };

			$http.post(API_URL, postData, postConfig)
				.success(function(data, status, headers, config) {
					//log('verify user success');
					self.saveSessionAndConfirmLogin(data, {plan: data.plan});
				})
				.error(self.loginError);
				// .error(function(data, status, headers, config) {
				// 	log('verify error. Here is the error info: ' + {data:data, status:status, headers:headers, config:config});
				// 	// log('start broadcast loginFailed');
				// 	// $rootScope.$broadcast(AUTH_EVENTS.loginFailed, {data:data, status:status, headers:headers, config:config});
				// 	self.loginError(data, status, headers, config);
				// });
		},

		login: function(user) {
			//log('start login...');
			var self = this;
			var postData = [{a: "user_login"}];
			var postConfig = {ignoreAuthModule: true, headers:{} };

			if(user.anonymousToken){
				postData[0].tk = user.anonymousToken;
				postConfig.headers[AUTH_ANTILEAK] = authInterceptor.getRequestIdStr();
			} else {
				postData[0].user = user.email;
				postData[0].password = user.password;
				postData[0].permanent = user.loginRemembered;
			}

			//log('start .post user_login');
			$http.post(API_URL, postData, postConfig)
				.success(function(data, status, headers, config) {
					self.saveSessionAndConfirmLogin(data, user);
				})
				.error(self.loginError);
				// .error(function(data, status, headers, config) {
				// 	log('login error. Here is the error info: ' + {data:data, status:status, headers:headers, config:config});
				// 	// log('start broadcast loginFailed');
				// 	// $rootScope.$broadcast(AUTH_EVENTS.loginFailed, {data:data, status:status, headers:headers, config:config});
				// 	self.loginError(data, status, headers, config);
				// });
		},

		logout: function() {
			var self = this;
			var postData = [{a: "user_logout"}];
			var postConfig = {ignoreAuthModule: true};
			$http.post(API_URL, postData, postConfig)
				.finally(function(data) {
					// delete $http.defaults.headers.common.Authorization;
					// delete $http.defaults.headers.common[AUTH_ANTILEAK];
					// self.clearUserSession();
					$rootScope.$broadcast(AUTH_EVENTS.logoutComplete);
				});
		},

		loginCancelled: function() {
			authService.loginCancelled();
		},

		isAuthenticated: function () {
			var cu = $localStorage.AUTH_currentUser;
			return !!cu && !!cu.id;
		},

		// loginRemembered: function(){
		// 	var cu = $localStorage.AUTH_currentUser;
		// 	return !!cu && !!cu.password;
		// },

		isAuthorized: function (authorizedRoles) {
			if (!angular.isArray(authorizedRoles)) {
				authorizedRoles = [authorizedRoles];
			}
			var cu = $localStorage.AUTH_currentUser;
			return (
				authorizedRoles.indexOf('*') !== -1
				||
				( this.isAuthenticated() && cu && authorizedRoles.indexOf(cu.role.name) !== -1 )
			);
		},
		// checkAuthenticated: function () {
		// 	var deferred = $q.defer();
		// 	return deferred.promise;
		// },
		checkAuthorized: function () {
			//log('checkAuthorized...');
			var self = this;
			var deferred = $q.defer();
			var authorizedRoles = $route.current.roles;

			function _check(data, status, headers, config){
				//log('_check...')
				var _isAuthorized = self.isAuthorized(authorizedRoles);
				// userInfoRequested = true;
				if(_isAuthorized){
					//log('_check: if(_isAuthorized)');
					if(data){
						//log('_check: if(_isAuthorized) : if(data) -> start broadcast loginConfirmed...');
						$rootScope.$broadcast(AUTH_EVENTS.loginConfirmed, {data:data});
					}
					deferred.resolve(_isAuthorized);
				} else {
					deferred.reject(_isAuthorized);
					//log('_check: if(_isAuthorized) else{ start broadcast logoutComplete}');
					$rootScope.$broadcast(AUTH_EVENTS.logoutComplete);
					if (self.isAuthenticated()) {
						// alert('Không có quyền truy cập!')
						dialog.messageBox('tl-icon-warning', 'Thông tin', 'Không có quyền truy cập, vui lòng đăng nhập lại!', null, function(result) {
							// deferred.reject(_isAuthorized);
							// $location.path('/');
						});
					} else {
						// log('_check: if(_isAuthorized) else{ start self.clearUserSession()}');
						// self.clearUserSession();
						// log('_check: if(_isAuthorized) else{ start broadcast logoutComplete}');
						// $rootScope.$broadcast(AUTH_EVENTS.logoutComplete);
						//log('_check: if(_isAuthorized) else{ start broadcast loginRequired}');
						var rejection = status ? {data: data, status: status, headers: headers, config: config} : '';
						$rootScope.$broadcast(AUTH_EVENTS.loginRequired, rejection);
						// deferred.reject(_isAuthorized);
						// log('_check: if(_isAuthorized) else{ start $location.path(/)}');
						// $location.path('/');
					}
				}
			}

			function _checkError(data, status, headers, config){
				if(status == 401 && self.routeNotForGuest()){
					//log('_checkError : if(status == 401) { start broadcast loginRequired }')
					// if(self.loginRemembered){
					// 	self.login($localStorage.AUTH_currentUser);
					// } else {

						var rejection = {data: data, status: status, headers: headers, config: config, routeDeferred: deferred};
						$rootScope.$broadcast(AUTH_EVENTS.loginRequired, rejection);
					// }
				} else if(self.routeNotForGuest()) {
					//log('_checkError : if(status == 401) else { start broadcast logoutComplete }')
					$rootScope.$broadcast(AUTH_EVENTS.logoutComplete);
					deferred.reject();
				} else {
					$rootScope.$broadcast(AUTH_EVENTS.logoutComplete);
					deferred.resolve(true);
				}
			}

			if (!angular.isArray(authorizedRoles)) {
				authorizedRoles = [authorizedRoles];
			}
			//log('self.userInfoRequested: ' + self.userInfoRequested);
			//log('$localStorage.AUTH_sessionId: ' + $localStorage.AUTH_sessionId);
			if(!self.userInfoRequested && $localStorage.AUTH_sessionId){
				//log('checkAuthorized : if(!self.userInfoRequested && $localStorage.AUTH_sessionId) { start self.getUserInfo()}')
				self.getUserInfo()
					.success(function(data, status, headers, config){
						//log('checkAuthorized : if(!self.userInfoRequested && $localStorage.AUTH_sessionId) { self.getUserInfo().success -> start _check()...}')
						// self.setCurrentUser(data);
						_check(data, status, headers, config);
					})
					.error(function(data, status, headers, config){
						//log('checkAuthorized : if(!self.userInfoRequested && $localStorage.AUTH_sessionId) { self.getUserInfo().error -> start _checkError()...}')
						_checkError(data, status, headers, config);
					});
			} else {
				//log('checkAuthorized : if(!self.userInfoRequested && $localStorage.AUTH_sessionId) else { start _check()...}')
				_check();
			}
			return deferred.promise;
		},

		checkGuest: function(){
			//log('checkGuest...');
			var self = this;
			var deferred = $q.defer();
			function _check(data, status, headers, config){
				//log('_check...')
				$rootScope.$broadcast(AUTH_EVENTS.loginConfirmed, {data:data});
				// deferred.resolve(_isAuthorized);
			}

			function _checkError(data, status, headers, config){
				$rootScope.$broadcast(AUTH_EVENTS.logoutComplete);
				deferred.resolve(true);
			}

			if(!$localStorage.AUTH_sessionId){
				//log('checkGuest : if(!$localStorage.AUTH_sessionId){deferred.resolve(true)}');
				deferred.resolve(true);
			} else if(self.userInfoRequested) {
				//log('checkGuest : if(!$localStorage.AUTH_sessionId) else {start deferred.reject(); self.gotoFm...}');
				deferred.reject();
				self.gotoFm();
			} else {
				// deferred.resolve(true);
				self.getUserInfo()
					.success(function(data, status, headers, config){
						//log('checkAuthorized : if(!self.userInfoRequested && $localStorage.AUTH_sessionId) { self.getUserInfo().success -> start _check()...}')
						// self.setCurrentUser(data);
						_check(data, status, headers, config);
					})
					.error(function(data, status, headers, config){
						//log('checkAuthorized : if(!self.userInfoRequested && $localStorage.AUTH_sessionId) { self.getUserInfo().error -> start _checkError()...}')
						_checkError(data, status, headers, config);
					});
			}
			return deferred.promise;
		},

		openLoginModal: function(rejection, isSignUpModal, passwordResetKey, plan, size){
			var self = this;
			self.loginMessage = '';
			this.loginModalInstance = $modal.open({
				templateUrl: 'template/login-modal.html',
				controller: 'LoginModalCtrl',
				size: size,
				resolve: {
					isSignUpModal: function(){
						return isSignUpModal;
					},
					passwordResetKey: function(){
						return passwordResetKey;
					},
					plan: function(){
						return plan;
					}
				}
			});
			this.loginModalOpened = true;
			this.loginModalInstance.result.then(function(result){
				if(rejection && rejection.routeDeferred){
					rejection.routeDeferred.resolve(true);
					//log('routeDeferred.resolve(true)');
				}
				self.loginModalOpened = false;
			}, function(reason){
				//log('Login modal dismissed, reason: ' + reason);
				if(rejection && rejection.routeDeferred){
					rejection.routeDeferred.reject();
					//log('routeDeferred.reject(), start broadcast logoutComplete...');
					$rootScope.$broadcast(AUTH_EVENTS.logoutComplete);
				}
				self.loginModalOpened = false;
				// if(self.routeNotForGuest){
				// 	log('routeNotForGuest, $location.path(/)...');
				// 	$location.path('/');
				// }
			});
		},

		gotoFm: function(){
			$location.path('/fm/files');
		},

		keepAliveInterval : null,
		keepAlive: function(){
			this.stopKeepAlive();
			this.keepAliveInterval = setInterval(function(){
				$http.get(API_URL, {cache:false});
			}, 10*60*1000);
		},
		stopKeepAlive: function(){
			clearInterval(this.keepAliveInterval);
		}

	};



	$rootScope.$on(AUTH_EVENTS.signupSuccess, function(event, info) {
		//log('signupSuccess')
		service.loginModalOpened && service.loginModalInstance && service.loginModalInstance.close();
		$location.path('/account-confirm/' + info.user.plan + '/0');
	});

	$rootScope.$on(AUTH_EVENTS.loginRequired, function(e, rejection) {
		service.stopKeepAlive();
		// service.loginMessage = rejection;
		service.openLoginModal(rejection);
	});

	$rootScope.$on(AUTH_EVENTS.loginFailed, function(e, rejection) {
		service.isFailLogin = true;
		service.loginMessage = "Đăng nhập không thành công!"
		if (rejection.status == 401) {
			switch (rejection.data[0]){
				case -9:
					service.loginMessage = "Thông tin đăng nhập không đúng!";
					break;
				case -20:
					service.loginMessage = "Tài khoản này chưa được kích hoạt!";
					break;
				case -16:
					service.loginMessage = "Tài khoản này đang bị khóa!";
					break;
			}
		}
		alertify.error(service.loginMessage);
	});

	$rootScope.$on(AUTH_EVENTS.signupFailed, function(e, rejection) {
		service.loginMessage = 'Không thể đăng ký, vui lòng thử lại sau.';
		switch(parseInt(rejection.data[0])){
			case -11:
				service.loginMessage = 'Địa chỉ email đã được đăng ký.<br>' + 'Xin dùng địa chỉ email khác.';
				break;
			case -2:
				service.loginMessage = 'Sai mã bảo mật. Vui lòng nhập lại.';
		}
		// if(parseInt(data[0]) === -11){
		// 	service.loginMessage = 'Địa chỉ email đã được đăng ký.<br>' + 'Xin dùng địa chỉ email khác.';
		// }
		alertify.error(service.loginMessage);
	});

	$rootScope.$on(AUTH_EVENTS.loginConfirmed, function(event, info) {
		// $http.defaults.headers.common[AUTH_ANTILEAK] = service.getAntiLeakHeader(); // Step 1
		//log('loginConfirmed , start setCurrentUser...')
		// service.setCurrentUser(info.data, info.user);
		service.setCurrentUser(info.data);
		service.loginMessage = '';
		service.isFailLogin = false;
		service.isErrorLogin = false;
		service.loginModalOpened && service.loginModalInstance && service.loginModalInstance.close();
		if($route.current.guestOnly){
			//log('loginConfirmed , if($route.current.guestOnly){ start gotoFm...}')
			service.gotoFm();
		} else if((info.user && info.user.plan && info.user.plan != 'free' && info.user.plan != 'activated') || ($routeParams.plan && $routeParams.plan != 'free' && $routeParams.plan != 'activated') ){
			//log('loginConfirmed , if(info.plan  && info.plan != "activated"){ start goto payment...}');
			$location.path('/payment/' + (info.user.plan || $routeParams.plan));
		} else if((info.user && info.user.plan && (info.user.plan == 'free' || info.user.plan == 'activated')) || ($routeParams.plan && ($routeParams.plan == 'free' || $routeParams.plan == 'activated')) ){
			service.gotoFm();
		}
		service.keepAlive();
	});

	$rootScope.$on(AUTH_EVENTS.logoutComplete, function() {
		service.stopKeepAlive();
		//log('logoutComplete, start clearUserSession...')
		delete $http.defaults.headers.common[AUTH_ANTILEAK];
		service.clearUserSession();
		if(uiState.page.fmName != 'folder'){
			filesSrv.clearFs();
		}
		if(service.routeNotForGuest()){
			//log('logoutComplete, if(service.routeNotForGuest()){ start $location.path(/)...}')
			$location.url('/');
		}
	});

	$rootScope.$watch(function(){return $localStorage.AUTH_sessionId}, function(newValue, oldValue){
		if(!newValue){
			if(service.routeNotForGuest()){
				//log('AUTH_sessionId removed, start $location.path(/)...')
				$location.url('/');
			}
		}
	});

	return service;
});
