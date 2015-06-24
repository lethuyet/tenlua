'use strict';

angular.module( 'TenLua' )
	.controller( 'DownloadCtrl', function( $rootScope, $scope, $http, $location, $routeParams, $interval, $q, $modal, uiState, filesSrv, API_URL, AUTH_EVENTS ) {

		uiState.page.setTitle('Download file');

		var downloadInterval = null;
		var downloaded = false;
		$scope.timeWaitToDownload = null;
		$scope.file = {
			id: $routeParams.nodeId,
			name: null,
			type: 0
		};
		filesSrv.currentFolder = null;
		// $scope.name = null;

		$scope.getDownloadInfo = function(){
			$http.post(API_URL, [{"a":"filemanager_builddownload_getinfo", "n": $routeParams.nodeId, "r": Math.random()}], {})
				.success(function(data, status, headers, config) {
					if(data[0].type == 'folder'){
						$location.url('/fm/folder/' + $routeParams.nodeId + '/' + $routeParams.downloadName );
						return;
					}
					if(data[0].type == "none"){
						$scope.requestError = true;
						// alertify.error('Liên kết không tồn tại!', 0);
						$location.path('/common/404');
						return;
					} else {
						if(parseInt(data[0].stt_private) == 1){
							$scope.requestError = true;
							$location.url('/common/404?private=true');
							return;
						} else if(parseInt(data[0].stt_private) == 2){
							$scope.requestError = true;
							$location.path('/common/404');
							return;
						}
						$scope.file.name = data[0].n;
						$scope.file.machineName = $routeParams.downloadName;
						$scope.file.hasPassword = data[0].passwd;
						$scope.file.size = parseInt(data[0].real_size);
						$scope.file.downloadUrl = data[0].dlink || data[0].url;
						$scope.file.lock = data[0].passwd;
						// $scope.file.image = data[0].image || 'http://s05.tenlua.vn/image/-IGPx5u-Yh4WkQ1Lpdc8VIzJp-cH3uzQqYBiOH2nHHA,/ni4zgfe8d3ye6u1XiPzQp0uxnYjJBT_G3aYMi_zCqYQ,/jXBKAVLaOSZ6ytCY7KQRLG9ccZ4AIbo5OsKdavvkR2I,/20120824052424-edit-2.jpg';
						// $scope.file.video = data[0].video || 'http://s05.tenlua.vn/video/-IGPx5u-Yh4WkQ1Lpdc8VIzJp-cH3uzQqYBiOH2nHHA,/ni4zgfe8d3ye6u1XiPzQp0uxnYjJBT_G3aYMi_zCqYQ,/MFdrmSaWTTb5lbmOE2_mI65HSK7TTBSTOBTkCbpoNRU,/youtube-il-divo-the-power-of-love.flv';
						$scope.file.image = data[0].image;
						$scope.file.video = data[0].video;
						$scope.file.music = data[0].music;
						$scope.file.doc = data[0].doc;
						filesSrv.initNodeInfo($scope.file);
						uiState.page.setTitle($scope.file.name);
					}
				})
				.error(function(data, status, headers, config) {
					$scope.requestError = true;
					if(status == 404){
						alertify.error('Liên kết không tồn tại!', 0);
						$location.path('/');
					} else {
						alertify.error('Không thể download, xin thử lại sau', 0);
					}
				});

			$http.post(API_URL, [{"a":"filemanager_builddownload_getwaittime"}], {})
				.success(function(data, status, headers, config) {
					$scope.timeWaitToDownload = data[0].t;
				})
				.error(function(data, status, headers, config) {
					$scope.requestError = true;
					alertify.error('Không thể download, xin thử lại sau', 0);
				});
		}

		$scope.getDownloadInfo();

		$scope.features = {};
		$http.post(API_URL, [{a: 'user_index_get-list-benefit'}])
			.success(function(data, status, headers, config) {
				$scope.features = data;
			})
			.error(function(data, status, headers, config) {
				// alertify.error('Không thể truy cập, xin thử lại sau.');
			})


		$scope.dataOk = function(){
			return $scope.file.name !== null && $scope.timeWaitToDownload !== null && $scope.requestError !== true;
		}

		$scope.viewFile = function(){
			if(filesSrv.canView($scope.file)){
				if(filesSrv.canSlideShow($scope.file)){
					filesSrv.checkPassword($scope.file).then(function(){
						filesSrv.slideShowNode($scope.file);
					});
				}
			}
		}

		$scope.reportFile = function(){
			$scope.reportFileModalInstance = $modal.open({
				templateUrl: 'template/report-file-modal.html',
				controller: 'ReportFileModalCtrl',
				size: 'sm',
				resolve: {
					node: function(){
						return $scope.file;
					}
				}
			});

			$scope.reportFileModalInstance.result.then(function(result){
			}, function(){});
		}


		$scope.download = function(){
			filesSrv.checkPassword($scope.file).then(function(){
				if(!downloadInterval && !downloaded){
					$scope.countDown = $scope.timeWaitToDownload;
					var timeInterval = parseInt($scope.timeWaitToDownload) <= 0 ? 0 : 1000;
					$scope.countDownStarted = true;
					downloadInterval = $interval(function(){
						$scope.countDown--;
						if($scope.countDown <= 0){
							$interval.cancel(downloadInterval);
							$scope.countDown = 0;
							downloaded = true;
							window.location = $scope.file.downloadUrl;
						}
					}, timeInterval);
				}
			});
		}

		$scope.downloadFast = function(){
			filesSrv.checkPassword($scope.file).then(function(){
				if(!downloaded){
					downloaded = true;
					window.location = $scope.file.downloadUrl;
					$scope.fastDownloaded = true;
					// $scope.$apply();
				}
			});
		}


		$scope.resetDownloadInfo = function(){
			$scope.file.name = null;
			$scope.fastDownloaded = false;
			$scope.countDown = null;
			$scope.countDownStarted = false;
			downloaded = false;
			$interval.cancel(downloadInterval);
			downloadInterval = null;
			$scope.getDownloadInfo();
		}

		$rootScope.$on(AUTH_EVENTS.loginConfirmed, function(event, info) {
			if(uiState.page.name == 'download'){
				$scope.resetDownloadInfo();
			}
		});

		$rootScope.$on(AUTH_EVENTS.logoutComplete, function(event, info) {
			if(uiState.page.name == 'download'){
				$scope.resetDownloadInfo();
			}
		});

	} );
