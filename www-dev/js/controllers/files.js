'use strict';

angular.module( 'TenLua' )
	.controller( 'FilesCtrl', function( $scope, $rootScope, $location, $route, $routeParams, filesSrv, uploadSrv, authSrv, searchSrv, AUTH_EVENTS, isAuthorized ) {

		var libText = $routeParams.libName   ?    ' ' + ($routeParams.libName == 'pictures' ? 'Ảnh' : ($routeParams.libName == 'music' ? 'Nhạc' : 'Videos'))    :    '';
		switch($scope.uiState.page.fmName){
			case 'files':
				$scope.uiState.page.setTitle('Files' + (libText ? ' - ' + libText : ''));
				break;
			case 'folder':
				$scope.uiState.page.setTitle('Thư mục download');
				break;
		}


		searchSrv.setOption('current');
		filesSrv.fmHasTree = true;

		$rootScope.reload = function(firstTime){
			if (firstTime) {
				var isDownloadFolder = $scope.uiState.page.fmName == 'folder';
				if (isDownloadFolder) {
					var promise = filesSrv.getFs($scope.routeParams.nodeId, true);
				} else {
					var promise = filesSrv.getFs($scope.routeParams.nodeId);
				}
				promise.then(function(){
					if($scope.routeParams.libName){
						filesSrv.currentFolder = null;
						filesSrv.updateCurrentNodesList($scope.library.nodes);
						$scope.uiState.page.setTitle(filesSrv.fsRootNode.name + (libText ? ' - ' + libText : ''));
					}
				});
			} else {
				authSrv.userInfoRequested = false;
				$route.reload();
			}
		}

		




		if($scope.routeParams.libName){
			filesSrv.currentFolder = null;
			// filesSrv.currentNodesList = null;
			$scope.library = filesSrv[$scope.routeParams.libName];
			$scope.library.currentPage = 1;
			if(filesSrv.fs.length){
				// filesSrv.openFolder($scope.routeParams.libName);
				filesSrv.updateCurrentNodesList($scope.library.nodes);
				$scope.uiState.page.setTitle(filesSrv.fsRootNode.name + (libText ? ' - ' + libText : ''));
			} else {
				if(isAuthorized){
					$scope.reload('firstTime');
				}
			}
		} else {
			filesSrv.clearFs();
			// if(authSrv.isAuthenticated()){
			if(isAuthorized){
				$scope.reload('firstTime');
				// filesSrv.reload('firstTime').then(function(){
				// 	uploadSrv.flowUpload($scope.$flow);
				// });
				// // setTimeout(function(){
				// 	filesSrv.getFs().then(function(){
				// 		filesSrv.openNodeFromUrlSearch();
				// 	});
				// // },5000);
			}
		}

	} );
