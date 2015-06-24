'use strict';

angular.module('TenLua')
.directive('alertAd', function($localStorage) {
	return {
		restrict: 'C',
		link: function(scope, element, attrs) {

			var contentId = element.children().eq(0).attr('id');
			var delay = attrs.delay ? attrs.delay * 1000 : 0;
			if($localStorage[contentId + '-closeRemembered'] != "closed"){
				setTimeout(function(){
					alertify[attrs.type](element.html(), 0);
					if(attrs.rememberClose=='true'){
						var selector = '.alertify-log #' + contentId;
						$(selector).parent().click(function(){
							$localStorage[contentId + '-closeRemembered'] = "closed";
							scope.$apply();
						});
					}
				},delay);
			}

		}
	};
});
