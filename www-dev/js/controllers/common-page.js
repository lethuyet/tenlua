'use strict';

angular.module( 'TenLua' )
	.controller( 'CommonPageCtrl', function( $scope, $http, $routeParams, $location, $sce, uiState, API_URL) {

		$scope.content = '';

		switch($routeParams.commonPage){
			case 'about':
				uiState.page.setTitle('Giới thiệu');
				break;
			case 'faq':
				uiState.page.setTitle('Câu hỏi thường gặp');
				break;
			case 'policy':
				uiState.page.setTitle('Điều khoản dịch vụ');
				break;
			case 'privacy':
				uiState.page.setTitle('Chính sách bảo mật');
				break;
			case 'copyright':
				uiState.page.setTitle('Bản quyền');
				break;
			case 'uploader-policy':
				uiState.page.setTitle('Chính sách uploader');
				break;
			case 'agent-policy':
				uiState.page.setTitle('Chính sách đại lý');
				break;
			case 'reward-policy':
				uiState.page.setTitle('Quy định tặng điểm thưởng');
				break;
			case '404':
				uiState.page.setTitle('Không tìm thấy!');
				break;
		}

		var htmlFile = $routeParams.commonPage;
		if($routeParams.commonPage == '404' && $location.search().private == 'true'){
			htmlFile = '404-private';
		}
		// $http.get(API_URL + '/' + uiState.page.name + '.html?lang=vi')
		$http.get('/' + htmlFile + '.html?lang=vi&v=2')
			.success(function(data, status, headers, config) {
				$scope.content = $sce.trustAsHtml(data);
			})
			.error(function(data, status, headers, config) {
				alertify.error('Xin thử lại sau.');
			});
	
	} );
