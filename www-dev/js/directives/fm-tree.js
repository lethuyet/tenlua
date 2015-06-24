'use strict';

angular.module('TenLua')
	.directive('fmTree', function($location, $routeParams, filesSrv, uiState) {
		return {
			restrict: "C",
			replace: true,
			transclude: true,
			template: [
				'<ul>',
					'<li ng-repeat="node in filesSrv.fs" ng-if="( node.type==1 || node.type==2 )" class="fm-tree-item" ng-class="nodeClass(node)" ng-include="\'template/fm-tree-item.html\'"></li>',
				'</ul>'
			].join('\n'),
			// scope: {
			// 	selectedNode: "=",
			// 	isOnModal: "@"
			// },
			controller: function($scope, $element, $transclude) {
				// $scope.filesSrv = filesSrv;
				$transclude(function(e) {
					$element.append(e);
				});
			},
			link: function(scope, element, attrs) {

				scope.isOnModal = attrs.isOnModal;

				scope.nodeClass = function(node) {
					if(scope.isOnModal){
						return {
							open: node.treeOpen,
							active: node.treeSelected,
							disabled: node.checked || node.updating,
							'has-child': scope.hasChild(node)
						};
					} else {
						return {
							open: node.treeOpenOnSidebar,
							// active: node.treeSelectedOnSidebar,
							active: (node === filesSrv.currentFolder || node === filesSrv.fsRootNode) && !$routeParams.libName,
							disabled: node.updating,
							'has-child': scope.hasChild(node)
						};
					}
				}

				scope.hasChild = function(node) {
					if (node.nodes && node.nodes.length) {
						for (var i = 0; i < node.nodes.length; i++) {
							if (node.nodes[i].type == 1) {
								return true;
							}
						};
					}
					return false;
				}

				scope.open = function(node, $event) {
					if (scope.isOnModal && !node.checked && !node.updating) {
						node.treeOpen = !node.treeOpen;
					} else if(!scope.isOnModal && !node.updating){
						node.treeOpenOnSidebar = !node.treeOpenOnSidebar;
					}
				}

				scope.select = function(node, $event) {
					if (scope.isOnModal && !node.checked && !node.updating) {
						if (device.mobile() || device.tablet()) {
							scope.open(node, $event);
						}
						scope.selectedNode.treeSelected = false;
						scope.selectedNode = node;
						node.treeSelected = true;
						// scope.lastselectedNode.treeSelected = false;
						// scope.lastselectedNode = node;
						scope.$emit('fmTreeItemSelected', node);
					} else if(!scope.isOnModal && !node.updating){
						if (device.mobile() || device.tablet() || node === filesSrv.fsRootNode) {
							scope.open(node, $event);
						}
						filesSrv.openNode(node, null, '/fm/' + uiState.page.fmName + (uiState.page.fmName == 'folder' ? '/' + $routeParams.nodeId + '/' + $routeParams.folderName : ''));
						// node.treeSelectedOnSidebar = true;
						// scope.selectedNode.treeSelectedOnSidebar = false;
						// scope.selectedNode = node;
						// // scope.$emit('fmTreeItemSelected', node);
					}
				}

			}
		};
	});
