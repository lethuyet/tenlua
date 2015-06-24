angular.module( 'TenLua' )
	.controller( 'ReportFileModalCtrl', function( $rootScope, $scope, $http, $routeParams, $location, $modalInstance, $localStorage, node, API_URL ) {

		$scope.node = node;
		$scope.captcha = '';
		$scope.reportType = null;
		$scope.captchaImg = '';

		function reloadCaptcha(){
			$scope.captchaImg = API_URL + '/user/index/captcharender/sid/' + $localStorage.AUTH_sessionId + '?r=' + Math.random();
		}

		reloadCaptcha();

		$scope.failCaptcha = function(){
			alertify.error('Mã bảo mật không đúng, vui lòng nhập lại.',0);
			reloadCaptcha();
			$scope.submiting = false;
		}

		function formInvalid(form){
			$scope.modalMessage = '';
			if(typeof form.report != 'undefined' && form.report.$error.required){
				$scope.modalMessage += 'Chưa chọn lý do vi phạm' + '<br>';
			}
			if(typeof form.captcha != 'undefined' && form.captcha.$error.required){
				$scope.modalMessage += 'Chưa nhập mã bảo mật';
			} else if(typeof form.captcha != 'undefined' && form.captcha.$error.maxlength){
				$scope.modalMessage += 'Mã bảo mật không hợp lệ, vui lòng nhập lại.';
			}
			return form.$invalid;
		}


		$scope.ok = function(form){
			if(formInvalid(form)){
				return;
			}
			var postData = [{
				a: "user_index_reportbadlink",
				captcha: $scope.captcha,
				n: $routeParams.nodeId,
				r: Math.random(),
				type: "1",
				url: $location.url()
			}];
			$http.post(API_URL, postData)
				.success(function(data, status, headers, config) {
					if(data.status == '976'){
						$scope.failCaptcha();
					} else if(data.status == '977'){
						alertify.error('Vui lòng đăng nhập để thực hiện chức năng này.');
					} else {
						alertify.success('Cảm ơn bạn đã báo với chúng tôi về lỗi vi phạm này!');
						$modalInstance.close();
					}
				})
				.error(function(data, status, headers, config) {
					alertify.error('Không thể báo vi phạm! Xin thử lại sau.');
				});
		};

		$scope.cancel = function(){
			$modalInstance.dismiss('cancel');
		};

	} );
