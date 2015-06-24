angular.module('TenLua')
.directive("loader", function($rootScope) {
	return function($scope, element, attrs) {
		element.addClass('loading-dots').html('<b></b><b></b><b></b>');
		$scope.$on("loader_show", function() {
			return element.addClass('show');
		});
		return $scope.$on("loader_hide", function() {
			return element.removeClass('show');
		});
	};
})
