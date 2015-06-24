'use strict';

angular.module('TenLua')
.directive('adFrameFb', function () {
	return {
		restrict: 'C',
		templateUrl: 'template/ad-frame-fb.html',
		replace: true,
		link: function postLink(scope, element, attrs) {

			var frameSrc = '//www.facebook.com/plugins/likebox.php?href=https%3A%2F%2Fwww.facebook.com%2Ftenlua.vn&colorscheme=light&show_faces=true&header=false&stream=false&show_border=false';
			scope.src = '';

			$(window).on(orientationEvent, $.debounce(1000, function() {
				var viewPortWidth = $(window).width();
				var viewPortHeight = $(window).height();
				var _width = parseInt(element.parent().width());
				if(viewPortWidth < 992){
					scope.src = '';
				} else {
					scope.src = frameSrc + '&width=' + _width;
					if(viewPortWidth >= 1600){
						scope.src += '&height=500';
						element.children('iframe').css({height: '500px'});
					} else {
						scope.src += '&height=400';
						element.children('iframe').css({height: '400px'});
					}
				}
				scope.$apply();
			}));
			$(window).trigger(orientationEvent);

		} // end link: function postLink
	};
});
