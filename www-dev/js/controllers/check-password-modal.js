angular.module( 'TenLua' )
	.controller( 'CheckPasswordModalCtrl', function( $rootScope, $scope, $http, $modalInstance, filesSrv, node, API_URL ) {

		$scope.node = node;
		$scope.node.password = '';

		$scope.passwordMaxLength = 100;

		function formInvalid(form){
			$scope.modalMessage = '';
			if(typeof form.nodePassword != 'undefined' && form.nodePassword.$error.maxlength){
				$scope.modalMessage += 'Chỉ được nhập tối đa' + ' ' + $scope.passwordMaxLength + ' '  + 'ký tự';
			}
			return form.$invalid;
		}

		$scope.ok = function(form){
			if(formInvalid(form)){
				return;
			}

			var postData = [{
				a: "filemanager_builddownload_checkpassword",
				n: $scope.node.id,
				p: $scope.node.password,
				r: Math.random()
			}];
			$http.post(API_URL, postData)
				.success(function(data, status, headers, config) {
					if(data.status == 1){
						$scope.node.lock = 0;
						$scope.node.justUnlocked = 1;
						$scope.node.image = data.image;
						$scope.node.video = data.video;
						$scope.node.doc = data.doc;
						$scope.node.downloadUrl = data.url;
						filesSrv.initNodeInfo(node);
						$modalInstance.close();
					} else {
						alertify.error('Sai mật khẩu! Vui lòng nhập lại.');
					}
				})
				.error(function(data, status, headers, config) {
					alertify.error('Không thể xác nhận mật khẩu! Xin thử lại sau.');
				});
		};

		$scope.cancel = function(){
			$modalInstance.dismiss('cancel');
		};

	} );
