'use strict';

angular.module('TenLua')
	.directive('homeParallax', function($rootScope, uiState) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {

				var $sections = element.children('section:nth-child(1), section:nth-child(2)');
				var $html = $('html');
				var firstTime = true;
				function doHomeParallax(){
					if(!firstTime){
						$html.addClass('no-home-rocket-animation');
					}
					firstTime = false;
					$sections.each(function(){
						// if( $.inviewport(this, window, {threshold:0}) ){
							var scrollTop = $(window).scrollTop();
							$(this).children('.bg').css('transform','translate3d(0px,' + ((scrollTop - $(this).offset().top) * .35) + 'px,0px)');
						// }
					});
				}
				// var doThrottle = $.throttle(0,doHomeParallax);

				$(window).on('scroll.homeParallax', doHomeParallax);

				$rootScope.$on('$routeChangeSuccess', function(){
					if(uiState.page.name){
						$(window).off('scroll.homeParallax');
						$html.removeClass('no-home-rocket-animation');
					}
				});

				element.on('click','.page-down-arrow, .btn.view-more', function(e){
					$(window).scrollTo($(this).parents('section').next()[0], 800, {offset: 0});
				});


			} // end link: function postLink
		};
	});
