'use strict';

angular.module( 'TenLua' )
	.controller( 'SearchCtrl', function( $scope, $http, $routeParams, searchSrv, filesSrv, API_URL) {

		$scope.uiState.page.setTitle($routeParams.keyword + ' - ' + 'Tìm kiếm');

		filesSrv.clearFs();
		searchSrv.getSearchResult();

		searchSrv.hotItems = searchSrv.hotItems ? searchSrv.hotItems : [];
		searchSrv.topItems = searchSrv.topItems ? searchSrv.topItems : [];

		if(!searchSrv.hotItems.length){
			var postConfig = { noAuthHeader: true };
			$http.post(API_URL + '/search/index/order-list', null, postConfig)
			// $http.post('http://api.tenlua.vn' + '/search/index/order-list', null, postConfig)
			// $http.get('/data-test-order-list.json', null, postConfig)
				.success(function(data, status, headers, config) {
					searchSrv.hotItems = data.hotItems;
					searchSrv.topItems = data.topItems;
					// for (var i = 0; i < searchSrv.hotItems.length; i++) {
					// 	filesSrv.mapNodeProp(searchSrv.hotItems[i]);
					// };
					// for (var j = 0; j < searchSrv.topItems.length; j++) {
					// 	filesSrv.mapNodeProp(searchSrv.topItems[j]);
					// };
				})
				.error(function(data, status, headers, config) {
				});
		}

	} );
