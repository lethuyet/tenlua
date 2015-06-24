angular.module( 'TenLua' )
	.controller( 'DoLockModalCtrl', function( $rootScope, $scope, $http, $modalInstance, filesSrv, node, API_URL ) {

		$scope.node = node;
		$scope.node.updating = true;
		$scope.node.password = '';
		$scope.sNode = filesSrv.sNodeType($scope.node) + ' <b><em>' + $scope.node.name + '</em></b>';

		$scope.passwordMaxLength = 100;

		// $scope.$watch('node.lock', function(lock){
		// 	if(!lock){
		// 		$scope.node.password = '';
		// 	}
		// });

		function formInvalid(form){
			$scope.modalMessage = '';
			if(typeof form.nodePassword != 'undefined' && form.nodePassword.$error.maxlength){
				$scope.modalMessage += 'Chỉ được nhập tối đa' + ' ' + $scope.passwordMaxLength + ' '  + 'ký tự';
			}
			return form.$invalid;
		}

		$scope.removePassword = function(){
			var postData = [{
				a: "filemanager_rmpassword",
				i: Math.random(),
				t: $scope.node.id
			}];
			$http.post(API_URL, postData)
				.success(function(data, status, headers, config) {
					if($rootScope.wrongResponse(data)){
						// filesSrv.doneUpdating($scope.node)
						alertify.error('Không thể gỡ bỏ mật khẩu cho' + ' ' + $scope.sNode + '! Xin thử lại sau.');
					} else {
						$scope.node.lock = 0;
						$scope.node.justUnlocked = 0;
						$scope.node.image = data.image;
						$scope.node.video = data.video;
						$scope.node.doc = data.doc;
						// $scope.node.downloadUrl = data.url;
						filesSrv.initNodeInfo($scope.node);
						// filesSrv.doneUpdating($scope.node)
						alertify.success('Đã gỡ bỏ mật khẩu thành công cho' + ' ' + $scope.sNode + '.');
						$modalInstance.close();
					}
				})
				.error(function(data, status, headers, config) {
					if(status != 401){
						// filesSrv.doneUpdating($scope.node)
						alertify.error('Không thể gỡ bỏ mật khẩu cho' + ' ' + $scope.sNode + '! Xin thử lại sau.');
					}
				});
		}

		$scope.ok = function(form){
			if(formInvalid(form)){
				return;
			}
			if(!$scope.node.lock && !$scope.node.password){
				filesSrv.doneUpdating($scope.node)
				$modalInstance.close();
				return;
			}


			if(!$scope.node.password){
				$scope.removePassword();
			} else {
				var postData = [{
					a: "filemanager_password",
					i: Math.random(),
					p: $scope.node.password,
					t: $scope.node.id
				}];
				$http.post(API_URL, postData)
					.success(function(data, status, headers, config) {
						if($rootScope.wrongResponse(data)){
							// filesSrv.doneUpdating($scope.node)
							alertify.error('Không thể xác lập mật khẩu cho' + ' ' + $scope.sNode + '! Xin thử lại sau.');
						} else {
							$scope.node.lock = 1;
							$scope.node.justUnlocked = 0;
							$scope.node.image = '';
							$scope.node.imageSmall = '';
							$scope.node.imageMedium = '';
							$scope.node.imageLarge = '';
							$scope.node.video = '';
							$scope.node.doc = '';
							$scope.node.style = {};
							// filesSrv.doneUpdating($scope.node)
							alertify.success('Đã xác lập mật khẩu thành công cho' + ' ' + $scope.sNode + '.');
							// if($scope.node.password){
							// 	alertify.success('Đã xác lập mật khẩu thành công cho' + ' ' + $scope.sNode + '.');
							// } else {
							// 	alertify.success('Đã gỡ bỏ mật khẩu thành công cho' + ' ' + $scope.sNode + '.');
							// }
							$modalInstance.close();
						}
					})
					.error(function(data, status, headers, config) {
						if(status != 401){
							// filesSrv.doneUpdating($scope.node)
							alertify.error('Không thể xác lập mật khẩu cho' + ' ' + $scope.sNode + '! Xin thử lại sau.');
						}
					});
			}
		};

		$scope.cancel = function(){
			// filesSrv.doneUpdating($scope.node);
			$modalInstance.dismiss('cancel');
		};

	} );
