'use strict';

angular.module( 'TenLua' )
	.controller( 'PlansCtrl', function( $scope, $http, $location, dialog, authSrv, uiState, API_URL ) {

		uiState.page.setTitle('Chọn gói dịch vụ');

		$scope.features = {};
		$http.post(API_URL, [{a: 'user_index_get-list-benefit'}])
			.success(function(data, status, headers, config) {
				$scope.features = data;
			})
			.error(function(data, status, headers, config) {
				alertify.error('Không thể truy cập, xin thử lại sau.');
			})


		$scope.startFree = function(){
			if(authSrv.isAuthenticated()){
				return;
			}
			authSrv.openLoginModal(null, 'signup', null, 'free');
		}

		$scope.startGold = function(){
			if(authSrv.isAuthenticated()){
				$location.path('/payment/gold');
				return;
			}
			authSrv.openLoginModal(null, 'signup', null, 'gold');
		}

		$scope.startLifetime = function(){
			var status = $scope.features.lifetime[0].status;
			if(status == 'soon'){
				dialog.messageBox('tl-icon-warning', 'Thông báo', 'Gói dịch vụ này sẽ sớm ra mắt!');
				return;
			}
			if(status == 'disabled'){
				return;
			}
			if(authSrv.isAuthenticated()){
				$location.path('/payment/lifetime');
				return;
			}
			authSrv.openLoginModal(null, 'signup', null, 'lifetime');
		}

	} );
