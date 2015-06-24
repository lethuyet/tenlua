'use strict';

angular.module( 'TenLua' )
	.controller( 'AccountConfirmCtrl', function( $scope, $routeParams, $timeout, authSrv, uiState ) {

		uiState.page.setTitle('Kích hoạt tài khoản');

		$scope.hasPayment = function(){
			return $routeParams.plan != 'free' && $routeParams.plan != 'activated';
		}

		$scope.hasActiveId = function(){
			return $routeParams.activeId && $routeParams.activeId !== '0';
		}

		// $timeout(function(){
			if($routeParams.activeId && $routeParams.activeId !== '0'){
				authSrv.verifyUser($routeParams.activeId);
			}
		// }, 2000);

	} );
