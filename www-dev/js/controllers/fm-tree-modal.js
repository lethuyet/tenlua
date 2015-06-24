angular.module( 'TenLua' )
	.controller( 'FmTreeModalCtrl', function( $scope, $modal, $modalInstance, filesSrv ) {

		// $scope.isOnModal = true;

		// for (var i = 0; i < filesSrv.currentFolder.breadcrumb.length; i++) {
		// 	filesSrv.currentFolder.breadcrumb[i].treeOpen = true;
		// };
		// filesSrv.currentFolder.treeSelected = true;
		// $scope.selectedNode = filesSrv.currentFolder;
		for (var i = 0; i < $modalInstance.values.parentNode.breadcrumb.length; i++) {
			$modalInstance.values.parentNode.breadcrumb[i].treeOpen = true;
		};
		$modalInstance.values.parentNode.treeSelected = true;
		$scope.selectedNode = $modalInstance.values.parentNode;


		$scope.action = $modalInstance.values.action;
		if($scope.action == 'move'){
			$scope.actionText = 'di chuyển';
		} else if($scope.action == 'copy'){
			$scope.actionText = 'sao chép';
		}

		// $scope.nodeClass = function(node){
		// 	return {
		// 		open: node.treeOpen,
		// 		active: node.treeSelected,
		// 		disabled: node.checked || node.updating,
		// 		'has-child': $scope.hasChild(node)
		// 	};
		// }

		// $scope.hasChild = function(node){
		// 	if(node.nodes && node.nodes.length){
		// 		for (var i = 0; i < node.nodes.length; i++) {
		// 			if(node.nodes[i].type == 1){
		// 				return true;
		// 			}
		// 		};
		// 	}
		// 	return false;
		// }

		$scope.ok = function(){
			delete $scope.selectedNode.treeOpen;
			delete $scope.selectedNode.treeSelected;
			$modalInstance.close($scope.selectedNode);
		}

		$scope.cancel = function(){
			delete $scope.selectedNode.treeOpen;
			delete $scope.selectedNode.treeSelected;
			// $scope.selectedNode.treeOpen = false;
			$modalInstance.dismiss($scope.selectedNode);
		}

		$scope.$on('fmTreeItemSelected', function(event, node){
				// $scope.selectedNode.treeSelected = false;
				$scope.selectedNode = node;
		});

		// $scope.open = function(node, $event){
		// 	if(!node.checked && !node.updating){
		// 		node.treeOpen = !node.treeOpen;
		// 	}
		// }

		// $scope.select = function(node, $event){
		// 	if(!node.checked && !node.updating){
		// 		if(device.mobile() || device.tablet()){
		// 			$scope.open(node, $event);
		// 		}
		// 		$scope.lastSelectedNode.treeSelected = false;
		// 		$scope.lastSelectedNode = node;
		// 		node.treeSelected = true;
		// 	}
		// }

	} );
