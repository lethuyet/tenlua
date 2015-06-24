'use strict';

angular.module('TenLua')
.directive('spinner', function (uiState, $location, $routeParams, $timeout, filesSrv, searchSrv) {
	return {
		restrict: 'E',
		// template: '<div class="spinner-wrap" ng-if="!content"><i class="tl-icon-spinner"></i></div>',
		template: '<div class="spinner-wrap"><i class="tl-icon-spinner"></i></div>',
		replace: true
	};
});
