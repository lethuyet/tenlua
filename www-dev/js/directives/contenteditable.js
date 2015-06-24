'use strict';

angular.module('TenLua')
.directive('contenteditable', function() {
	return {
		require: 'ngModel',
		// scope: {
		// 	contenteditable: '@',
		// 	contentediting: '='
		// },
		link: function(scope, element, attrs, ctrl) {
			// view -> model
			element.bind('blur', function() {
				scope.$apply(function() {
					if(attrs.contentType == 'text'){
						ctrl.$setViewValue($.trim(element.text()));
					} else {
						ctrl.$setViewValue(element.html());
					}
					// scope.contenteditable = false;
					// scope.contentediting = false;
				});
			});

			// model -> view
			ctrl.$render = function() {
				if(attrs.contentType == 'text'){
					element.text(ctrl.$viewValue);
				} else {
					element.html(ctrl.$viewValue);
				}
			};


			if(attrs.returnPrevented){
				var oldContent = '';
				element.on('focus', function(e){
					// oldContent = attrs.contentType == 'text' ? element.text() : element.html();
					scope.oldContent = attrs.contentType == 'text' ? element.text() : element.html();
				}).on('keydown', function(e){
					if (e.keyCode == 13){
						e.preventDefault();
						// element.trigger('blur', [{oldContent: oldContent}]);
						// element.trigger({
						// 	type: 'contentEditableBlur',
						// 	oldContent: oldContent
						// }).trigger('blur');
						element.trigger('blur');
					} else if(e.keyCode == 27){
						e.preventDefault();
						if(attrs.contentType == 'text'){
							element.text(scope.oldContent);
						} else {
							element.html(scope.oldContent);
						}
						// element.trigger('blur', [{oldContent: oldContent}]);
						// element.trigger({
						// 	type: 'contentEditableBlur',
						// 	oldContent: oldContent
						// }).trigger('blur');
						element.trigger('blur');
					}
				});
			}


			// scope.$watch('contentediting', function(newValue, oldValue){
			// 	if(newValue){
			// 		var viewWrapperPaddingTop = parseInt($('.view-wrapper').css('padding-top')); //($('#AppNavBar').outerHeight() + $('#FmListHeader').outerHeight())
			// 		if($.abovethetop(element[0], window, {threshold : -viewWrapperPaddingTop})){
			// 			$(window).scrollTo(element.parents('li')[0], {axis: 'y', offset: -viewWrapperPaddingTop });
			// 		} else if($.belowthefold(element[0], window, {threshold : 0})){
			// 			$(window).scrollTo(element.parents('li')[0], {axis: 'y', offset: -$(window).height() });
			// 		}
			// 		element[0].onfocus = function(e){
			// 			var el = this;
			// 			requestAnimationFrame(function() {
			// 				selectElementContents(el);
			// 			});
			// 		}
			// 		element.trigger('focus');
			// 		// element[0].select();
			// 	}
			// });
		}
	};
});
