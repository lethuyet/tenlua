'use strict';

angular.module('TenLua')
.directive('fileNode', function (uiState, $location, $routeParams, $timeout, filesSrv, searchSrv) {
	return {
		restrict: 'A',
		templateUrl: 'template/file-node.html',
		replace: true,
		scope: {
			node: '=fileNode',
			index: '='
		},
		link: function postLink(scope, element, attrs) {

			// scope.node = attrs.fileNode;
			scope.filesSrv = filesSrv;
			scope.uiState = uiState;
			scope.routeParams = $routeParams;

			function contextMenu(e, context){
				if(!scope.node.updating){
					e.preventDefault();
					if(filesSrv.checkedNodes.indexOf(scope.node) == -1){
						filesSrv.unCheckAllNodes();
					}
					scope.node.checked = true;
					filesSrv.nodeCheckToggle(scope.node);
					scope.$apply();
					if(context){
						setTimeout(function(){
							showContextMenu(e);
						},0);
					}
				}
			}

			function showContextMenu(e){
				var contextWidth = $('#FmContextMenu').width();
				var contextHeight = $('#FmContextMenu').height();
				var viewportWidth = $(window).width();
				var viewportHeight = $(window).height();
				var left = e.clientX;
				var top = e.clientY;
				if(e.gesture !== undefined){
					var scrollTop = $(window).scrollTop();
					var scrollLeft = $(window).scrollLeft();
					left = e.gesture.touches[0].pageX - scrollLeft;
					top = e.gesture.touches[0].pageY - scrollTop;
				}
				if(left + contextWidth > viewportWidth){
					// left = scrollLeft + viewportWidth - contextWidth - 10;
					left = viewportWidth - contextWidth - 10;
				}
				if(top + contextHeight > viewportHeight){
					// top = scrollTop + viewportHeight - contextHeight - 20;
					top = viewportHeight - contextHeight - 20;
				}
				$('#FmContextMenu').css({left: left, top: top});
				if(device.mobile() || device.tablet()){
					$('#FmContextMenuMask').show();
				}
			}

			function hideContextMenu(){
				$('#FmContextMenu').css({left: '', top: ''});
				if(device.mobile() || device.tablet()){
					$('#FmContextMenuMask').hide();
				}
			}

			// function blurFileNode(){
			// 	hideContextMenu();
			// 	// $fmContextHeader.hide();
			// 	// scope.unCheckAllNodes();
			// 	uiState.fm.inSelectionMode = false;
			// 	scope.$apply();
			// }

			if(uiState.page.fmName != 'folder' && uiState.page.fmName != 'search'){
				// var $('#FmContextMenu'), $('#FmContextMenuMask');
				// setTimeout(function(){
				// 	$('#FmContextMenu') = $('#FmContextMenu');
				// 	$('#FmContextMenuMask') = $('#FmContextMenuMask');
				// },0);
				// var $fmContextHeader = $('#FmContextHeader');


				if(!device.mobile() && !device.tablet()){
					element
						.on('click', function(e){
							e.stopPropagation();
							if( e.target.tagName == "LABEL" ) {
								hideContextMenu();
							}
							// $fmContextHeader.hide();
						})
						.on('contextmenu', function(e){
							contextMenu(e,true);
						});
				}
				else if(device.mobile() || device.tablet()){
					element
						.on('contextmenu', contextMenu)
						.hammer().on('hold', contextMenu);
				}

				element.on('click','input[type=checkbox]', function(e){
					if(scope.node.updating){
						return;
					}
					if (e.shiftKey) {
						var arrCurrentNodes = [];
						if(filesSrv.useCurrentFolderNodes()){
							arrCurrentNodes = filesSrv.arrCurrentFolderNodes;
						} else if(filesSrv.useLibraryNodes()){
							arrCurrentNodes = filesSrv.arrCurrentLibraryNodes;
						} else if(filesSrv.useCurrentFolderSearch()){
							arrCurrentNodes = filesSrv.arrCurrentFolderSearch;
						}

						var last = arrCurrentNodes.indexOf(filesSrv.lastCheckedNode);
						var first = arrCurrentNodes.indexOf(scope.node);

						var start = Math.min(first, last);
						var end = Math.max(first, last);

						var chk = filesSrv.lastCheckedNode.checked;
						for (var i = start; i < end; i++) {
							var _n = arrCurrentNodes[i];
							_n.checked = chk;
							filesSrv.nodeCheckToggle(_n);
						}
					} else {
						filesSrv.lastCheckedNode = scope.node;
					}
					scope.$apply();
				});


				// if(scope.$last){
				// 	$(document).on('click', function(e){
				// 		hideContextMenu();
				// 		if( !$(e.target).is('[file-node-related]') && !$(e.target).parents('[file-node-related]').length ){
				// 			// blurFileNode();
				// 			uiState.fm.inSelectionMode = false;
				// 			scope.$apply();
				// 		}
				// 	}).on('keydown', function(e){
				// 		if (e.keyCode == 27){
				// 			// blurFileNode();
				// 			hideContextMenu();
				// 			uiState.fm.inSelectionMode = false;
				// 			scope.$apply();
				// 		}
				// 	});
				// }

			}

		} // end link: function postLink
	};
});
