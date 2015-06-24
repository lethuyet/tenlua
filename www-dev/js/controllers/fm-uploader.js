'use strict';

angular.module( 'TenLua' )
	.controller( 'FmUploaderCtrl', function( $scope, $rootScope, uploadSrv, authSrv, AUTH_EVENTS ) {

		$scope.flowProgress = function(){
			return Math.round( $scope.$flow.progress() * 100  * 10) /10 + '%';
		};

		$scope.flowPause = function(){
			$scope.$flow.pause();
			authSrv.keepAlive();
		};

		$scope.flowResume = function(){
			$scope.$flow.resume();
			authSrv.stopKeepAlive();
		}

		$scope.fileProgress = function(file){
			return Math.round( file.progress() * 100  * 10) /10 + '%';
		};

		$scope.flowCancel = function(){
			$scope.$flow.cancel();
			uploadSrv.removeAllFilesFromUploading();
			authSrv.keepAlive();
		}

		$scope.fileCancel = function(file){
			file.cancel();
			uploadSrv.removeFileFromUploading(file);
		}

		$rootScope.$on(AUTH_EVENTS.logoutComplete, function() {
			$scope.flowCancel();
		});

	} );
