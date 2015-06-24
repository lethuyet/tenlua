'use strict';

angular.module('TenLua')
.directive('fmContextMenu', function (uiState) {
	return {
		restrict: 'A',
		link: function postLink(scope, element, attrs) {

			function hideContextMenu(){
				element.css({left: '', top: ''});
				if(device.mobile() || device.tablet()){
					$('#FmContextMenuMask').hide();
				}
			}

			if(uiState.page.fmName != 'folder' && uiState.page.fmName != 'search'){
				$(document).on('click', function(e){
					hideContextMenu();
					if( !$(e.target).is('[file-node-related]') && !$(e.target).parents('[file-node-related]').length ){
						// blurFileNode();
						uiState.fm.inSelectionMode = false;
						scope.$apply();
					}
				}).on('keydown', function(e){
					if (e.keyCode == 27){
						// blurFileNode();
						hideContextMenu();
						uiState.fm.inSelectionMode = false;
						scope.$apply();
					}
				});

			}

		} // end link: function postLink
	};
});
