'use strict';

angular.module('TenLua')
.directive('searchBox', function (searchSrv) {
	return {
		restrict: 'C',
		link: function postLink(scope, element, attrs) {
			$(document).on('keydown', function(e){
				if (e.keyCode == 27){
					// if(searchSrv.isSearchingCurrent() && element.is(':focus')){
					if(element.is(':focus')){
						searchSrv.keyword = '';
						scope.$apply();
					}
				}
			});

		} // end link: function postLink
	};
});
