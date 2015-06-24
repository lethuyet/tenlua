angular.module( 'TenLua' )
	.controller( 'PaymentMethodsModalCtrl', function( $scope, $http, $location, $modal, $modalInstance, $localStorage, dialog, authSrv, payment, paymentDays, PAYMENT_NAMES, API_URL ) {

		$scope.setForm = function (form) {
			$scope.paymentForm = form;
		}

		$scope.formData = {};

		payment = payment == 'voucher' ? {name: 'voucher'} : payment;
		paymentDays = paymentDays == 'lifetime' ? 10000 : paymentDays;
		$scope.payment = payment;
		$scope.paymentNames = PAYMENT_NAMES;
		$scope.paymentDays = paymentDays;
		$scope.textDays = paymentDays == 10000 ? 'gói dịch vụ Trọn đời' : paymentDays + ' ' + 'ngày GOLD MEMBER';


		function reloadCaptcha(){
			$scope.captchaImg = API_URL + '/user/index/captcharender/sid/' + $localStorage.AUTH_sessionId + '?r=' + Math.random();
		}

		reloadCaptcha();

		$scope.failCaptcha = function(){
			alertify.error('Mã bảo mật không đúng, vui lòng nhập lại.',0);
			reloadCaptcha();
			$scope.submiting = false;
		}




		$scope.formData.autoGoldTransfer = false;
		$scope.goldEnough = null;
		$scope.goldCount = null;
		$scope.moreGold = null;
		$scope.moreMoney = null;
		$scope.moneyUnit = payment.name == 'paypal' ? 'USD' : 'VND';

		function processGoldNotEnough(data){
			$scope.goldEnough = false;
			$scope.goldCount = data.currGold;
			$scope.moreGold = data.remainGold;
			$scope.moreMoney = typeof data.remainMoney == 'string' ? parseInt(data.remainMoney.replace(',','')) : data.remainMoney;
			$scope.formData.autoGoldTransfer = true;
		}

		$scope.getGoldInfo = function(){
			$scope.submiting = false;
			$scope.smsInfoRequested = false;

			if(payment.name == 'sms'){
				var payLoadSmsInfo = [{
					a: "user_index_smscode"
				}];
				$http.post(API_URL, payLoadSmsInfo)
					.success(function(data, status, headers, config) {
						$scope.smsInfoRequested = true;
						if(parseInt(data.status) === 0){
							$scope.smsLoginRequiredMsg = 'Xin đăng nhập để thấy được cú pháp tin nhắn';
						} else if(parseInt(data.status) == 1){
							$scope.smsUserId = data.id;
						}
					})
					.error(function(data, status, headers, config) {
						$scope.smsInfoRequested = true;
						alertify.error('Có lỗi xảy ra. Xin thử lại sau.');
					});
				return;
			};

			// if(payment.name == 'sms' || payment.name == 'voucher'){return;}
			if(payment.name == 'voucher'){return;}

			reloadCaptcha();
			$scope.gettingGoldInfo = true;
			var payLoadGoldInfo = [{
				a: "user_index_infogold",
				daygold: paymentDays,
				r: Math.random(),
				type: payment.name
			}];
			$http.post(API_URL, payLoadGoldInfo)
				.success(function(data, status, headers, config) {
					$scope.gettingGoldInfo = false;
					if (typeof data == 'number' && data[0] < 0){return;}
					if(parseInt(data.status) === 0) {
						alertify.error('Vui lòng đăng nhập để thực hiện chức năng này.');
					} else if(parseInt(data.status) === 1){
						// $scope.goldEnough = false;
						// $scope.goldCount = data.currGold;
						// $scope.moreGold = data.remainGold;
						// $scope.moreMoney = typeof data.remainMoney == 'string' ? parseInt(data.remainMoney.replace(',','')) : data.remainMoney;
						processGoldNotEnough(data);
					} else if(parseInt(data.status) == 2){
						$scope.goldEnough = true;
						$scope.goldCount = data.currGold;
						$scope.needGold = data.needGold;
						$scope.discount = data.discount;
						if($scope.formData.autoGoldTransfer){
							$scope.goldTransfer();
						}
					} else {
						commonPaymentError(data.status);
					}
				})
				.error(function(data, status, headers, config) {
					$scope.gettingGoldInfo = false;
					alertify.error('Có lỗi xảy ra. Xin thử lại sau.');
				});
		};

		$scope.getGoldInfo();

		$scope.goldTransfer = function($event){
			$event && $event.preventDefault();
			$scope.goldTransfering = true;
			var payLoadGoldTransfer = [{
				a: 'user_index_transfergold',
				daygold: paymentDays,
				r: Math.random(),
				type: payment.name
			}];
			$http.post(API_URL, payLoadGoldTransfer)
				.success(function(data, status, headers, config) {
					$scope.goldTransfering = false;
					$scope.formData.autoGoldTransfer = false;
					if (typeof data == 'number' && data[0] < 0){return;}
					if(parseInt(data.status) === 0) {
						alertify.error('Vui lòng đăng nhập để thực hiện chức năng này.');
					} else if(parseInt(data.status) === 1){
						var message = 'Bạn đã nâng cấp thành công ' + $scope.textDays + ' ' + '!<br>' + 'Nhấn "OK" để truy cập trình quản lý file.';
						$modalInstance.close();
						dialog.messageBox('tl-icon-check', 'Thành công', message, null, function() {
							authSrv.updateUserInfo(function(){
								$location.path('/fm/files');
								// $modalInstance.close();
							});
						});

					} else if(parseInt(data.status) == 2){
						processGoldNotEnough(data);
					} else if(parseInt(data.status) == 5){
						alertify.error('Loại tài khoản của bạn không thể thực hiện chức năng này.');
					} else {
						commonPaymentError(data.status);
					}
				})
				.error(function(data, status, headers, config) {
					$scope.goldTransfering = false;
					$scope.formData.autoGoldTransfer = false;
					alertify.error('Có lỗi xảy ra. Xin thử lại sau.');
				});
		}

		$scope.ok = function($event){
			$event.preventDefault();
			if(formInvalid()){
				return;
			}
			switch (payment.name){
				case 'card': cardSubmit(); break;
				case 'nganluong': nganluongSubmit(); break;
				case 'ebanking': ebankingSubmit(); break;
				case 'paypal': paypalSubmit(); break;
				case 'voucher': voucherSubmit(); break;
				default: $modalInstance.close();
			}
			// $modalInstance.close();
		}

		$scope.cancel = function($event){
			$event.preventDefault();
			$modalInstance.dismiss();
		}

		function formInvalid(){
			var message = '';
			// if($scope.paymentForm.$invalid){
			// 	message = 'Dữ liệu nhập không hợp lệ! Xin kiểm tra lại.')
			// }
			if(typeof $scope.paymentForm.cardProvider != 'undefined' && $scope.paymentForm.cardProvider.$error.required){
				message += 'Chưa chọn loại thẻ cào.<br>';
			}
			if(typeof $scope.paymentForm.cardCode != 'undefined' && $scope.paymentForm.cardCode.$error.required){
				message += 'Chưa nhập mã thẻ cào.<br>';
			}
			if(typeof $scope.paymentForm.cardCode != 'undefined' && $scope.paymentForm.cardCode.$error.maxlength){
				message += 'Mã thẻ cào không hợp lệ.<br>';
			}
			if(typeof $scope.paymentForm.cardSerial != 'undefined' && $scope.paymentForm.cardSerial.$error.required){
				message += 'Chưa nhập serial thẻ cào.<br>';
			}
			if(typeof $scope.paymentForm.cardSerial != 'undefined' && $scope.paymentForm.cardSerial.$error.maxlength){
				message += 'Serial thẻ cào không hợp lệ.<br>';
			}
			if(typeof $scope.paymentForm.voucherCode != 'undefined' && $scope.paymentForm.voucherCode.$error.required){
				message += 'Chưa nhập mã Voucher.<br>';
			}
			if(typeof $scope.paymentForm.voucherCode != 'undefined' && $scope.paymentForm.voucherCode.$error.maxlength){
				message += 'Mã Voucher không hợp lệ.<br>';
			}
			if(typeof $scope.paymentForm.captcha != 'undefined' && $scope.paymentForm.captcha.$error.required){
				message += 'Chưa nhập mã bảo mật.<br>';
			}
			if(typeof $scope.paymentForm.captcha != 'undefined' && $scope.paymentForm.captcha.$error.maxlength){
				message += 'Mã bảo mật không hợp lệ.';
			}
			if(message){
				alertify.error(message,0);
			}
			return $scope.paymentForm.$invalid;
		}

		function commonPaymentError(status){
			var message = '';
			switch(parseInt(status)){
				case 976: message = 'Mã bảo mật không đúng, vui lòng nhập lại.'; break;
				case 977: message = 'Vui lòng đăng nhập để thực hiện chức năng này.'; break;
				case 979: message = 'Mã voucher không tồn tại, vui lòng kiểm tra lại.'; break;
				case 982: message = 'Có lỗi xảy ra trong quá trình thanh toán, vui lòng liên hệ bộ phận support'; break;
				case 1004: message = 'Thông tin thanh toán không hợp lệ. Vui lòng liên hệ BQT để được hỗ trợ'; break;
			}
			reloadCaptcha();
			alertify.error(message,0);
		}

		function cardSubmit(){
			$scope.submiting = true;
			var postData = {
				captcha: $scope.formData.captcha,
				code: $scope.formData.cardCode,
				serial: $scope.formData.cardSerial,
				provider: $scope.formData.cardProvider,
				type: payment.name,
				r: Math.random(),
				sid: $localStorage.AUTH_sessionId,
				pay_day: paymentDays
			};
			var postConfig = { noAuthHeader: true };
			$http.post(API_URL + '/nganluong-card.php?' + $.param( postData ), null, postConfig)
				.success(function(data, status, headers, config) {
					$scope.submiting = false;
					if(parseInt(data.rs) === 0){
						alertify.error(data.mess, 0);
						reloadCaptcha();
					} else if(parseInt(data.rs) === 1){
						var message = 'Bạn vừa thanh toán thẻ cào mệnh giá ' + data.paid + ' ' + $scope.moneyUnit  + ' (tương ứng <strong>' + data.paidGold + ' GOLD</strong>). Bạn cần thêm ' + data.remainGold + ' GOLD (tương ứng <strong>' + data.remainMoney + ' ' + $scope.moneyUnit + '</strong>).';
						dialog.messageBox('tl-icon-check', 'Thành công', message, null);
						$scope.goldEnough = false;
						$scope.goldCount = data.currGold;
						$scope.moreGold = data.remainGold;
						$scope.moreMoney = typeof data.remainMoney == 'string' ? parseInt(data.remainMoney.replace(',','')) : data.remainMoney;
						reloadCaptcha();
						$scope.formData.cardCode = '';
						$scope.formData.cardSerial = '';
						$scope.formData.captcha = '';
					} else if(parseInt(data.rs) == 2){
						var message = 'Bạn vừa thanh toán thẻ cào mệnh giá ' + data.paid + ' ' + $scope.moneyUnit  + ' (tương ứng <strong>' + data.paidGold + ' GOLD</strong>). Bạn đã đủ GOLD để thanh toán ' + $scope.textDays + '.';
						dialog.messageBox('tl-icon-check', 'Thành công', message, null);
						$scope.goldEnough = true;
						$scope.goldCount = data.currGold;
						$scope.needGold = data.needGold;
						$scope.discount = data.discount;
						if($scope.formData.autoGoldTransfer){
							$scope.goldTransfer();
						}
					} else {
						commonPaymentError(data.rs);
					}
				})
				.error(function(data, status, headers, config) {
					$scope.submiting = false;
					alertify.error('không thể thanh toán! Xin thử lại sau', 0);
				});
		}

		function nganluongSubmit(){
			modalWin('nganluong-buildurl.php');
			// testPayment('nganluong', 60);
		}

		function ebankingSubmit(){
			modalWin('ebanking-buildurl.php');
			// testPayment('ebanking', 60);
		}

		function paypalSubmit(){
			modalWin('paypal-buildurl.php');
			// testPayment('paypal', 60);
		}

		function voucherSubmit(){
			$scope.submiting = true;
			var _postData = [{
				a: "user_index_payvoucher",
				captcha: $scope.formData.captcha,
				r: Math.random(),
				voucher: $scope.formData.voucherCode
			}];
			$http.post(API_URL, _postData)
				.success(function(data, status, headers, config) {
					$scope.submiting = false;
					if (typeof data == 'number' && data[0] < 0){return;}
					if(parseInt(data.status) === 1){
						var message = 'Bạn đã nạp voucher thành công!' + '<br>' + 'Nhấn "OK" để truy cập trình quản lý file.';
						dialog.messageBox('tl-icon-check', 'Thành công', message, null, function() {
							authSrv.updateUserInfo(function(){
								$location.path('/fm/files');
								$modalInstance.close();
							});
						});

					} else {
						commonPaymentError(data.status);
					}
				})
				.error(function(data, status, headers, config) {
					$scope.submiting = false;
					alertify.error('không thể thanh toán! Xin thử lại sau', 0);
				});
		}


		var _popUp = null;

		function modalWin(url, target) {
			$scope.submiting = true;
			// $event.preventDefault();
			var redirectUrl = API_URL + '/' + url + '?daygold=' + paymentDays + '&sid=' + $localStorage.AUTH_sessionId;
			var url = API_URL + '/user/index/check-payment-captcha?captcha=' + $scope.formData.captcha + '&sid=' + $localStorage.AUTH_sessionId + '&r=' + encodeURIComponent(redirectUrl);
			var n, r, i, s;
			s=0;
			i=0;
			n= screen.availWidth -40;
			r= screen.availHeight - 80;

			if (_popUp == null || _popUp.closed) {
				_popUp = window.open(url, target, "top=" + s + ",left=" + i + ",width=" + n + ",height=" + r + ",toolbar=no,directories=no,status=no,menubar=no,scrollbars,resizable,modal=yes")
			} else {
				if (_popUp.focus) {
					_popUp.focus()
				}
			}
		}

		// function testPayment(type, gold, target){
		// 	$scope.submiting = true;
		// 	var redirectUrl = API_URL + '/' + 'test-payment.php?type=' + type + '&gold=' + gold + '&sid=' + $localStorage.AUTH_sessionId;
		// 	var url = API_URL + '/user/index/check-payment-captcha?captcha=' + $scope.formData.captcha + '&sid=' + $localStorage.AUTH_sessionId + '&r=' + encodeURIComponent(redirectUrl);
		// 	var n, r, i, s;
		// 	s=0;
		// 	i=0;
		// 	n= screen.availWidth -40;
		// 	r= screen.availHeight - 80;

		// 	if (_popUp == null || _popUp.closed) {
		// 		_popUp = window.open(url, target, "top=" + s + ",left=" + i + ",width=" + n + ",height=" + r + ",toolbar=no,directories=no,status=no,menubar=no,scrollbars,resizable,modal=yes")
		// 	} else {
		// 		if (_popUp.focus) {
		// 			_popUp.focus()
		// 		}
		// 	}
		// }

	} );