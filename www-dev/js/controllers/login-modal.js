angular.module( 'TenLua' )
	.controller( 'LoginModalCtrl', function( $scope, $http, $location, $modal, $modalInstance, authSrv, isSignUpModal, passwordResetKey, plan, API_URL ) {
		$scope.isSignUpModal = isSignUpModal;
		$scope.isEnterNewPassword = passwordResetKey;
		$scope.user = {
			email: '',
			password: '',
			plan: plan,
			loginRemembered: true
		};

		$scope.userSignup = {
			name: '',
			email: '',
			password: '',
			plan: plan,
			captchaImg: '',
			captcha: '',
			session: '',
			termAccepted: true
		};

		$scope.activationLink = {
			email: ''
		}

		$scope.forgotPassword = {
			email: ''
		}

		$scope.newPassword = {
			password: '',
			confirm: ''
		}

		// $scope.setForm = function (form) {
		// 	$scope.loginForm = form;
		// }

		// $scope.setFormSignup = function (form) {
		// 	$scope.signupForm = form;
		// }

		$scope.login = function(form){
			if(formInvalid(form)){
				return;
			}
			authSrv.login($scope.user);
		};

		$scope.signup = function(form){
			if(formInvalid(form)){
				return;
			}
			authSrv.signup($scope.userSignup).then(function(){}, function(){
				reloadCaptcha();
			});
		};

		$scope.resendActivationLink = function(form){
			if(formInvalid(form)){
				return;
			}
			$http.post(API_URL, [{a: "user_resendactive", m: $scope.activationLink.email}], {cache:false})
				.success(function(data, status, headers, config) {
					var msg = '';
					if(data[0] === 0){
						alertify.success('Gửi thành công!<br>Vui lòng kiểm tra email của bạn "' + $scope.activationLink.email + '" để kích hoạt lại tài khoản.<br>Nếu không thấy ở hộp thư đến, vui lòng kiểm tra ở mục thư rác.', 0);
						$modalInstance.close();
					} else {
						switch (data[0]){
							case -1:
								msg = "Vui lòng thử lại sau.";
								break;
							case -9:
								msg = "Địa chỉ email không đúng!<br>Nếu bạn chưa có tài khoản, vui lòng đăng ký mới.";
								break;
							case -20:
								msg = "Tài khoản này chưa được kích hoạt!";
								break;
							case -16:
								msg = "Tài khoản này đang bị khóa!";
								break;
						}
						alertify.error(msg,0);
					}
				})
				.error(function(data, status, headers, config) {
					alertify.error('Vui lòng thử lại sau.',0);
				});
		}

		$scope.resendPassword = function(form){
			if(formInvalid(form)){
				return;
			}
			$http.post(API_URL, [{a: "user_requestpwd", m: $scope.forgotPassword.email}], {cache:false})
				.success(function(data, status, headers, config) {
					var msg = '';
					if(data[0] === 0){
						alertify.success('Gửi thành công!<br>Vui lòng kiểm tra email của bạn "' + $scope.forgotPassword.email + '" để được hướng dẫn nhập mật khẩu mới.<br>Nếu không thấy ở hộp thư đến, vui lòng kiểm tra ở mục thư rác.', 0);
						$modalInstance.close();
					} else {
						switch (data[0]){
							case -1:
								msg = "Vui lòng thử lại sau.";
								break;
							case -9:
								msg = "Địa chỉ email không đúng!<br>Nếu bạn chưa có tài khoản, vui lòng đăng ký mới.";
								break;
							case -20:
								msg = "Tài khoản này chưa được kích hoạt!";
								break;
							case -16:
								msg = "Tài khoản này đang bị khóa!";
								break;
						}
						alertify.error(msg,0);
					}
				})
				.error(function(data, status, headers, config) {
					alertify.error('Vui lòng thử lại sau.',0);
				});
		}

		$scope.sendNewPassword = function(form){
			if(formInvalid(form)){
				return;
			}
			$http.post(API_URL, [{a: "user_doresetpwd", newpwd: $scope.newPassword.password, rscode: passwordResetKey}], {cache:false})
				.success(function(data, status, headers, config) {
					var msg = '';
					if(data[0] === 0){
						alertify.success('Thay đổi mật khẩu thành công!');
						$modalInstance.close();
					} else {
						switch (data[0]){
							case -1:
								msg = "Vui lòng thử lại sau.";
								break;
							case -9:
								msg = "Địa chỉ email không đúng!<br>Nếu bạn chưa có tài khoản, vui lòng đăng ký mới.";
								break;
							case -20:
								msg = "Tài khoản này chưa được kích hoạt!";
								break;
							case -16:
								msg = "Tài khoản này đang bị khóa!";
								break;
						}
						alertify.error(msg,0);
					}
				})
				.error(function(data, status, headers, config) {
					alertify.error('Vui lòng thử lại sau.',0);
				});
		}


		function reloadCaptcha(){
			if($scope.userSignup.captchaImg){
				$scope.userSignup.captchaImg = $scope.userSignup.captchaImg.split('&r=')[0] + '&r=' + Math.random();
				// $scope.userSignup.sid = $scope.userSignup.sid;
			} else {
				$scope.userSignup.captchaImg = '';
				$http.post(API_URL, [{a: "user_signupcaptcha"}], {cache: false})
					.success(function(data, status, headers, config) {
						$scope.userSignup.captchaImg = data.captcha + '&r=' + Math.random();
						$scope.userSignup.sid = data.sid;
					})
					.error(function(data, status, headers, config) {
						alertify.error('Không lấy được mã bảo mật. Xin thử lại sau');
					});
			}
		}

		if($scope.isSignUpModal){
			reloadCaptcha();
		}

		// $scope.failCaptcha = function(){
		// 	alertify.error('Mã bảo mật không đúng, vui lòng nhập lại.',0);
		// 	reloadCaptcha();
		// 	// $scope.submiting = false;
		// }

		$scope.changeView = function(view, $event){
			$event.preventDefault();
			authSrv.loginMessage = '';
			if(view == 'login'){
				$scope.isSignUpModal = false;
				$scope.isActivationLink = false;
				$scope.isForgotPassword = false;
			} else if(view == 'signup') {
				if(!plan){
					$modalInstance.dismiss();
					$location.path('/plans');
					return;
				}
				$scope.isSignUpModal = true;
				$scope.isActivationLink = false;
				$scope.isForgotPassword = false;
				reloadCaptcha();
			} else if(view == 'activationLink'){
				$scope.isActivationLink = true;
				$scope.isForgotPassword = false;
			} else {
				$scope.isForgotPassword = true;
				$scope.isActivationLink = false;
			}
		}

		function formInvalid(form){
			authSrv.loginMessage = '';
			if(typeof form.name != 'undefined' && form.name.$error.required){
				authSrv.loginMessage += 'Chưa nhập Họ tên.<br>';
			}
			if(typeof form.name != 'undefined' && form.name.$error.maxlength){
				authSrv.loginMessage += 'Họ tên không hợp lệ.<br>';
			}
			if(typeof form.email != 'undefined' && form.email.$error.required){
				authSrv.loginMessage += 'Chưa nhập Email.<br>';
			}
			if(typeof form.email != 'undefined' && (form.email.$error.maxlength || form.email.$error.email)){
				authSrv.loginMessage += 'Email không hợp lệ.<br>';
			}
			if(typeof form.password != 'undefined' && form.password.$error.required){
				authSrv.loginMessage += 'Chưa nhập Mật khẩu.<br>';
			}
			if(typeof form.password != 'undefined' && form.password.$error.maxlength){
				authSrv.loginMessage += 'Mật khẩu không hợp lệ.<br>';
			}
			if(typeof form.passwordConfirm != 'undefined' && form.passwordConfirm.$error.required){
				authSrv.loginMessage += 'Chưa nhập lại Mật khẩu.<br>';
			}
			if(typeof form.passwordConfirm != 'undefined' && form.passwordConfirm.$error.maxlength){
				authSrv.loginMessage += 'Mật khẩu nhập lại không hợp lệ.<br>';
			}
			if(typeof form.password != 'undefined' && typeof form.passwordConfirm != 'undefined' && !form.password.$error.required && !form.passwordConfirm.$error.required && !form.password.$error.maxlength && !form.passwordConfirm.$error.maxlength && $scope.newPassword.password != $scope.newPassword.confirm){
				authSrv.loginMessage += 'Mật khẩu nhập lại không trùng khớp<br>';
				return true;
			}
			if(typeof form.captcha != 'undefined' && form.captcha.$error.required){
				authSrv.loginMessage += 'Chưa nhập mã bảo mật.<br>';
				return true;
			}
			if(typeof form.captcha != 'undefined' && form.captcha.$error.maxlength){
				authSrv.loginMessage += 'Mã bảo mật không hợp lệ.<br>';
				return true;
			}
			if(typeof form.termAccepted != 'undefined' && form.termAccepted.$error.required){
				authSrv.loginMessage += 'Bạn chưa đồng ý với điều khoản của tenlua.vn.';
			}
			// if(authSrv.loginMessage){
			// 	alertify.error(authSrv.loginMessage,0);
			// }
			return form.$invalid;
		}

		var _popUp = null;

		$scope.modalWin = function(type, target, $event) {
			$event.preventDefault();
			var url = '';
			switch(type){
				case 'facebook':
					url = API_URL +'/oauth/user/login?openid_identifier=https://www.facebook.com';
					break;
				case 'google':
					url = 'http://api2.tenlua.vn' + '/oauth/user/login?openid_identifier=https://www.google.com/accounts/o8/id';
					break;
				case 'yahoo':
					url = API_URL + '/oauth/user/login?openid_identifier=http://me.yahoo.com/';
					break;
			}
			var n, r, i, s;
			if (typeof window.screenX == "number" && typeof window.innerWidth == "number") {
				n = window.innerWidth * .68;
				r = window.innerHeight * .68;
				i = window.screenX + window.innerWidth * .16;
				s = window.screenY + window.innerHeight * .16
			} else if (typeof window.screenTop == "number" && typeof document.documentElement.offsetHeight == "number") {
				n = document.documentElement.offsetWidth * .68;
				r = document.documentElement.offsetHeight * .68;
				i = window.screenLeft + document.documentElement.offsetWidth * .16;
				s = window.screenTop - 50
			} else {
				n = 500;
				r = 450;
				i = 60;
				s = 40
			} if (_popUp == null || _popUp.closed) {
				_popUp = window.open(url, target, "top=" + s + ",left=" + i + ",width=" + n + ",height=" + r + ",toolbar=no,directories=no,status=no,menubar=no,scrollbars,resizable,modal=yes")
			} else {
				if (_popUp.focus) {
					_popUp.focus()
				}
			}
		}

		// $scope.ok = function(){
		// 	authSrv.login($scope.user);
		// 	// $modalInstance.close();
		// };

		// $scope.cancel = function(){
		// 	$modalInstance.dismiss('cancel');
		// };

	} );
