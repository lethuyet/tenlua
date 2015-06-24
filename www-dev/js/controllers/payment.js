'use strict';

angular.module( 'TenLua' )
	.constant('PAYMENT_NAMES', {
		'card': 'Thẻ cào di động',
		'nganluong': 'Ngân Lượng',
		'ebanking': 'Internet Banking',
		'paypal': 'Paypal',
		'sms': 'SMS',
		'voucher': 'Voucher'
	})
	.controller( 'PaymentCtrl', function( $scope, $http, $modal, authSrv, uiState, API_URL, PAYMENT_NAMES ) {

		uiState.page.setTitle('Thanh toán');

		$scope.paymentNames = PAYMENT_NAMES;
		$scope.paymentModalInstance = null;

		$scope.openPayment = function(payment, days){
			if(payment.price === null){
				return;
			}

			if(!authSrv.isAuthenticated()){
				alertify.error('Vui lòng đăng nhập trước khi thực hiện thanh toán.');
				return;
			}

			$scope.paymentModalInstance = $modal.open({
				templateUrl: 'template/payment-methods-modal.html',
				controller: 'PaymentMethodsModalCtrl',
				size: 'sm',
				resolve: {
					payment: function(){
						return payment;
					},
					paymentDays: function(){
						return days;
					}
				}
			});
			$scope.paymentModalInstance.result.then(function(result){

			}, function(reason){

			});
		}


		$scope.prices = [];

		$http.post(API_URL, [{a: 'user_index_get-price-payment', r: Math.random()}])
			.success(function(data, status, headers, config) {
				if(data.length){
					$scope.prices = data;
				}
			})
			.error(function(data, status, headers, config) {
				alertify.error('Có lỗi xảy ra. Xin thử lại sau.');
			});

	} );
