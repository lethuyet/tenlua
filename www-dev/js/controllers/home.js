'use strict';

angular.module( 'TenLua' )
	.controller( 'HomeCtrl', function( $scope, $http, $location, uiState, authSrv, API_URL ) {

		uiState.page.setTitle('Dịch vụ lưu trữ và chia sẻ dữ liệu tốc độ cao!');

		var passwordResetKey = $location.search().pwreset;
		if(typeof passwordResetKey != 'undefined' && passwordResetKey){
			$http.post(API_URL, [{a: "user_resetpwd", rscode: passwordResetKey}], {cache:false})
				.success(function(data, status, headers, config) {
					var msg = '';
					if(typeof data[0] == 'string' && data[0].indexOf('@') != -1){
						// alertify.success('Gửi thành công!<br>Vui lòng kiểm tra email của bạn "' + $scope.forgotPassword.email + '" để được hướng dẫn nhập mật khẩu mới.<br>Nếu không thấy ở hộp thư đến, vui lòng kiểm tra ở mục thư rác.', 0);
						// $modalInstance.close();

						// rejection, isSignUpModal, passwordResetKey, plan, size
						authSrv.openLoginModal(null, null, passwordResetKey);
					} else {
						switch (data[0]){
							case -1:
								msg = "Bạn đang đăng nhập, hoặc mã phục hồi mật khẩu không hợp lệ.";
								break;
						}
						alertify.error(msg,0);
					}
				})
				.error(function(data, status, headers, config) {
					alertify.error('Vui lòng thử lại sau.',0);
				});
		}

	} );
