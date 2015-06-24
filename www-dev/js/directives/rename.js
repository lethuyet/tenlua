'use strict';

angular.module('TenLua')
.directive('rename', function(filesSrv) {
	return {
		// scope: {
		// 	node: "=rename"
		// },
		link: function(scope, element, attrs) {

			// element.on('contentEditableBlur', function(e){
			// 	filesSrv.rename(scope.node, e);
			// });
			element.on('blur', function(e){
				filesSrv.rename(scope.node, scope.oldContent);
			});

			attrs.$observe('contenteditable', function(newValue, oldValue){
				if(newValue === "true"){
					var viewWrapperPaddingTop = parseInt($('.view-wrapper').css('padding-top')); //($('#AppNavBar').outerHeight() + $('#FmListHeader').outerHeight())
					var _element = element.parents('li')[0];
					var _elementHeight = $(_element).outerHeight();
					if($.abovethetop(_element, window, {threshold : viewWrapperPaddingTop + _elementHeight})){
						$(window).scrollTo(_element, 300, {axis: 'y', offset: -viewWrapperPaddingTop });
					} else if($.belowthefold(_element, window, {threshold : -_elementHeight})){
						$(window).scrollTo(_element, 300, {axis: 'y', offset: -($(window).height() - _elementHeight) });
					}
					element[0].onfocus = function(e){
						var el = this;
						requestAnimationFrame(function() {
							// selectElementContents(el);
							var text = $(el).text();
							var end = text.length;
							var dotIndex = text.lastIndexOf('.');
							if(scope.node.type === 0){
								end = dotIndex > 0 ? dotIndex : text.length;
							}
							setSelectionRange(el,0,end);
						});
					}
					element.trigger('focus');
					// element[0].select();
				}
			});

		}
	};
});
