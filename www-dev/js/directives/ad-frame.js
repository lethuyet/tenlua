'use strict';

angular.module('TenLua')
.directive('adFrame', function () {
	return {
		restrict: 'C',
		templateUrl: 'template/ad-frame.html',
		replace: true,
		scope: {
			page: '=page',
			position: '=position'
		},
		link: function postLink(scope, element, attrs) {

			var frameSrc = '/advertise.php?page=' + scope.page + '&pos=' + scope.position;
			scope.src = '';
			scope.loaded = false;

			function getFrameDoc(oIframe) {
				var frameDoc;
				try {
					frameDoc = (oIframe.contentWindow || oIframe.contentDocument);
					if (frameDoc.document) frameDoc = frameDoc.document;
					if (frameDoc.body) frameDoc = frameDoc;
					else frameDoc = false;
				} catch (err) {
					frameDoc = false;
				}
				return frameDoc;
			};

			element.load(function() {
				if(scope.src){
					scope.loaded = true;
					scope.$apply();
					$(this)
						.css('display','block')
						.height( $(getFrameDoc(this)).height() );
				}
			})

			$(window).on(orientationEvent, $.debounce(1000, function() {
				var viewPortWidth = $(window).width();
				var viewPortHeight = $(window).height();
				if(scope.position == 'right'){
					if(viewPortWidth < 992){
						scope.src = '';
					} else {
						var newSrc = viewPortWidth >= 1600 ? frameSrc + '&size=large' : frameSrc;
						if(scope.src != newSrc){
							element.height(0);
							scope.src = newSrc;
						}
					}
				} else {
					var newSrc = viewPortWidth < 768 ? frameSrc + '&screen=mobile' : frameSrc;
					if(scope.src != newSrc){
						element.height(0);
						scope.src = newSrc;
					}
				}
				scope.$apply();
			}));
			$(window).trigger(orientationEvent);

		} // end link: function postLink
	};
});
