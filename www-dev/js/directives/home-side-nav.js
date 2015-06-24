'use strict';

angular.module('TenLua')
	.directive('homeSideNav', function() {
		return {
			restrict: 'A',
			templateUrl: 'template/home-side-nav.html',
			replace: true,
			scope: {index: '@homeSideNav'},
			link: function postLink(scope, element, attrs) {
				element.on('click','a', function(e){
					$(window).scrollTo($(this).attr('scroll-to'), 800, {offset: 0});
				});
			} // end link: function postLink
		};
	});
