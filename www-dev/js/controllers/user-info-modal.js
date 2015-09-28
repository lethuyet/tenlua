angular.module( 'TenLua' )
	.controller( 'UserInfoModalCtrl', function( $rootScope, $scope, $http, $modalInstance, $localStorage, dialog, API_URL ) {

		$scope.passwordMaxLength = 100;
		$scope.oldPassword = {value:''};
		$scope.newPassword = {value:''};
		$scope.newPasswordConfirm = {value:''};

		$scope.userInfoModalTabs = [
			{
				heading: 'Tài khoản',
				include: 'template/user-info-modal-tab-account.html'
			},
			{
				heading: 'Chuyển gold',
				include: 'template/user-info-modal-tab-gold-transfer.html'
			},
			{
				heading: 'Thưởng gold',
				include: 'template/user-info-modal-tab-gold-reward.html'
			},
			{
				heading: 'Lịch sử thanh toán',
				include: 'template/user-info-modal-tab-payment-history.html'
			},
			{
				heading: 'Lịch sử download',
				include: 'template/user-info-modal-tab-downloads-history.html'
			}
		];

		function formInvalid(form){
			
			$scope.modalMessage = '';
			$scope.user2userGoldTransfer.message= '';
			if(typeof form.oldPassword != 'undefined' && form.oldPassword.$error.required &&  $localStorage.AUTH_currentUser.is_social!=1){
				$scope.modalMessage += 'Chưa nhập Mật khẩu cũ.<br>';
			}
			if(typeof form.oldPassword != 'undefined' && form.oldPassword.$error.maxlength  &&  $localStorage.AUTH_currentUser.is_social!=1){
				$scope.modalMessage += 'Mật khẩu cũ không hợp lệ.<br>';
			}
			if(typeof form.newPassword != 'undefined' && form.newPassword.$error.required){
				$scope.modalMessage += 'Chưa nhập Mật khẩu mới.<br>';
			}
			if(typeof form.newPassword != 'undefined' && form.newPassword.$error.maxlength){
				$scope.modalMessage += 'Mật khẩu mới không hợp lệ.<br>';
			}
			if(typeof form.newPasswordConfirm != 'undefined' && form.newPasswordConfirm.$error.required){
				$scope.modalMessage += 'Chưa nhập lại Mật khẩu mới.<br>';
			}
			if(typeof form.newPasswordConfirm != 'undefined' && form.newPasswordConfirm.$error.maxlength){
				$scope.modalMessage += 'Mật khẩu nhập lại không hợp lệ.<br>';
			}
			if(typeof form.newPassword != 'undefined' && typeof form.newPasswordConfirm != 'undefined' && !form.newPassword.$error.required && !form.newPasswordConfirm.$error.required && !form.newPassword.$error.maxlength && !form.newPasswordConfirm.$error.maxlength && $scope.newPassword.value != $scope.newPasswordConfirm.value){
				$scope.modalMessage += 'Mật khẩu nhập lại không trùng khớp';
				return true;
			}

			if(typeof form.user2userGoldTransferGold != 'undefined' && (form.user2userGoldTransferGold.$error.maxlength || form.user2userGoldTransferGold.$error.integer || form.user2userGoldTransferGold.$error.min) ){
				$scope.user2userGoldTransfer.message += 'Số gold cần chuyển phải tối thiểu bằng 10.<br>';
			}
			if(typeof form.user2userGoldTransferGold != 'undefined' && form.user2userGoldTransferGold.$error.required){
				$scope.user2userGoldTransfer.message += 'Chưa nhập số gold cần chuyển.<br>';
			}
			if(typeof form.user2userGoldTransferEmail != 'undefined' && form.user2userGoldTransferEmail.$error.required){
				$scope.user2userGoldTransfer.message += 'Chưa nhập Email.<br>';
			}
			if(typeof form.user2userGoldTransferEmail != 'undefined' && (form.user2userGoldTransferEmail.$error.maxlength || form.user2userGoldTransferEmail.$error.email)){
				$scope.user2userGoldTransfer.message += 'Email không hợp lệ.<br>';
			}
			if(typeof form.user2userGoldTransferCaptcha != 'undefined' && form.user2userGoldTransferCaptcha.$error.required){
				$scope.user2userGoldTransfer.message += 'Chưa nhập mã bảo mật.<br>';
				return true;
			}
			if(typeof form.user2userGoldTransferCaptcha != 'undefined' && form.user2userGoldTransferCaptcha.$error.maxlength){
				$scope.user2userGoldTransfer.message += 'Mã bảo mật không hợp lệ.<br>';
				return true;
			}

			return form.$invalid;
		}

		$scope.ok = function(form){
			if(formInvalid(form)){
				return;
			}

			if($scope.userInfoModalTabs[0].active){
				$scope.changePassword();
			} else if($scope.userInfoModalTabs[1].active){
				$scope.user2userGoldTransfer.doTransfer();
			}
		};

		$scope.changePassword = function(){
			$http.post(API_URL, [{a: "user_pwd", currpw: $scope.oldPassword.value, newpw: $scope.newPassword.value}], {cache:false})
				.success(function(data, status, headers, config) {
					var msg = '';
					if(data[0] === 1){
						alertify.success('Thay đổi mật khẩu thành công!');
						$modalInstance.close();
					} else {
						switch (data[0]){
							case -1:
								msg = "Không thể đổi mật khẩu! Vui lòng thử lại sau.";
								break;
							case -11:
								msg = "Mật khẩu cũ không đúng.";
								break;
						}
						alertify.error(msg,0);
					}
				})
				.error(function(data, status, headers, config) {
					if(status != 401){
						alertify.error('Vui lòng thử lại sau.',0);
					}
				});

		}

		$scope.moreUserInfo = {};

		$scope.moreUserInfo.moreInfoError = false;
		$http.post(API_URL, [{a: "user_moreinfo"}, {cache: false}])
			.success(function(data, status, headers, config) {
				$scope.moreUserInfo.paidHistory = data.paid;
				$scope.moreUserInfo.transferHistory = data.transfer;
				$scope.moreUserInfo.downloadHistory = data.history_download;
			})
			.error(function(data, status, headers, config) {
				$scope.moreUserInfo.moreInfoError = true;
				// alertify.error('Không lấy được các thông tin về lịch sử sử dụng. Xin thử lại sau.')
			});

		$scope.cancel = function(){
			$modalInstance.dismiss('cancel');
		};

		$scope.moreUserInfo.infoGoldForDownloadError = false;
		// $http.post(API_URL, [{a: "user_index_get-gold-files-downloaded"}])
		$http.get(API_URL + '/user/index/get-gold-files-downloaded', {cache: false})
			.success(function(data, status, headers, config) {
				$scope.moreUserInfo.infoGoldForDownload = data;
			})
			.error(function(data, status, headers, config) {
				$scope.moreUserInfo.infoGoldForDownloadError = true;
				// alertify.error('Không lấy được các thông tin về lịch sử sử dụng. Xin thử lại sau.')
			});


		// $scope.moreUserInfo.detailInfoGoldForDownload = null;

		// $scope.gotoDetailInfoGoldForDownload = function(nodeId){
		// 	$http.get(API_URL + '/user/index/get-gold-files-downloaded-detail?node_id=0b37e528e20a6e0e')
		// 		.success(function(data, status, headers, config) {
		// 			$scope.moreUserInfo.detailInfoGoldForDownload = data;
		// 		})
		// 		.error(function(data, status, headers, config) {
		// 			// $scope.moreUserInfo.infoGoldForDownloadError = true;
		// 			// alertify.error('Không lấy được các thông tin về lịch sử sử dụng. Xin thử lại sau.')
		// 		});
		// }

		// $scope.backToInfoGoldForDownload = function(){
		// 	$scope.moreUserInfo.detailInfoGoldForDownload = null;
		// }

		$scope.user2userGoldTransfer = {
			gold: '',
			email: '',
			note: '',
			captchaImg: '',
			captcha: '',
			showNote: function(note){
				dialog.messageBox('tl-icon-info', 'Ghi chú', note);
			},
			doTransfer: function(){
				$scope.user2userGoldTransfer.transfering = true;
				var _note = $scope.user2userGoldTransfer.note.replace(/\r?\n/g, "<br />");
				var postConfig = {
					cache: false,
					headers: {
						"Accept": "application/json; charset=utf-8"/*,
						"Accept-Charset": "charset=utf-8"*/
					}
				}
				$http.post(API_URL, [{a: "user_index_transfer-gold-user-to-user", "pay-gold": $scope.user2userGoldTransfer.gold, "to-user": $scope.user2userGoldTransfer.email, captcha: $scope.user2userGoldTransfer.captcha, note: _note}], postConfig)
					.success(function(data, status, headers, config) {
						$scope.user2userGoldTransfer.transfering = false;
						$scope.user2userGoldTransfer.message = '';
						reloadCaptcha();
						switch(parseInt(data.status)){
							case 1:
								$localStorage.AUTH_currentUser.golds -= $scope.user2userGoldTransfer.gold;
								$scope.user2userGoldTransfer.getHistory();
								alertify.success('Chuyển gold thành công!<br><b>Ghi chú:</b><Br>Người được nhận gold cần đăng xuất và đăng nhập trở lại để được cập nhật số gold.',0);
								break;
							case 977:
								alertify.error('Vui lòng đăng nhập để chuyển gold.',0);
								break;
							case 978:
								alertify.error('Email người nhận không đúng.',0);
								break;
							case 976:
								alertify.error('Sai mã bảo mật! Xin nhập lại.',0);
								break;
							case 979:
								alertify.error('Không đủ gold để chuyển.',0);
								break;
							case 981:
								alertify.error('Bạn không được phép chuyển cho chính bạn.',0);
								break;
						}
					})
					.error(function(data, status, headers, config) {
						$scope.user2userGoldTransfer.transfering = false;
						$scope.user2userGoldTransfer.message = '';
						if(status != 401){
							alertify.error('Vui lòng thử lại sau.',0);
						}
					});

			}
		}

		function reloadCaptcha(){
			$scope.user2userGoldTransfer.captchaImg = API_URL + '/user/index/captcharender/sid/' + $localStorage.AUTH_sessionId + '?r=' + Math.random();
		}

		reloadCaptcha();

		// $scope.failCaptcha = function(){
		// 	alertify.error('Mã bảo mật không đúng, vui lòng nhập lại.',0);
		// 	reloadCaptcha();
		// 	$scope.submiting = false;
		// }

		// $http.post(API_URL, [{a: "user_index_get-gold-files-downloaded"}])
		$scope.user2userGoldTransfer.getHistory = function(){
			$scope.user2userGoldTransfer.historyError = false;
			$http.get(API_URL + '/user/index/get-history-gold-user-to-user', {cache: false})
				.success(function(data, status, headers, config) {
					$scope.user2userGoldTransfer.history = data;
				})
				.error(function(data, status, headers, config) {
					$scope.user2userGoldTransfer.historyError = true;
				});
		}

		$scope.user2userGoldTransfer.getHistory();


	} );
