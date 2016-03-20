'use strict';

angular.module( 'TenLua' )
.factory( 'downloadSrv', function( $rootScope, $http, $location, $routeParams, $timeout, uiState, dialog, authInterceptor, filesSrv, authSrv, searchSrv, API_URL, AUTH_EVENTS, AUTH_ANTILEAK, AUTH_ROLES ) {

	var _downloadSrv = {

		flowConfigs: {
			// permanentErrors: [404, 500, 501],
			// maxChunkRetries: 1,
			// chunkRetryInterval: 5000,
			// simultaneousUploads: 3,
			testChunks: true,
			chunkSize: 5*1024*1024,
			// method: 'octet',
			withCredentials: true,
			target: function(FlowFile, FlowChunk, isTest){
				// if(isTest){
				// 	return API_URL;
				// } else {
				// 	return FlowFile.uploadUrl;
				// }
				return FlowFile.uploadUrl;
			},
			headers: function(FlowFile, FlowChunk, isTest){
				var headers = {};
				// if(isTest){
				// 	headers[AUTH_ANTILEAK] = authInterceptor.getAntiLeakHeader();
				// } else {
				// 	// headers[AUTH_ANTILEAK] = FlowFile.uploadKey + '/?p=' + (FlowChunk.offset + 1) + '&c=' + (FlowChunk.endByte - FlowChunk.startByte);
				// 	headers[AUTH_ANTILEAK] = FlowFile.uploadKey + '/?p=' + FlowChunk.startByte + '&c=' + (FlowChunk.endByte - FlowChunk.startByte);
				// }
				headers[AUTH_ANTILEAK] = FlowFile.uploadKey + '/?p=' + FlowChunk.startByte + '&c=' + (FlowChunk.endByte - FlowChunk.startByte);
				return headers;
			}
		},

		isOkToUpload: function(){
			var urlSearchNodeType = parseInt($location.search().nodeType);
			var isAuthorized = authSrv.isAuthorized([AUTH_ROLES.normal.name, AUTH_ROLES.admin.name, AUTH_ROLES.gold.name, AUTH_ROLES.uploader.name, AUTH_ROLES.lifetime.name]);
			var notViewingFile = urlSearchNodeType !== 0 || (filesSrv.slideShowingNode && filesSrv.isMusic(filesSrv.slideShowingNode));
			// return (isAuthorized && uiState.page.name != 'fm')  ||  (isAuthorized && uiState.page.name == 'fm' && filesSrv.currentFolder.breadcrumb.length && urlSearchNodeType !== 0);
			return (isAuthorized && uiState.page.name == 'fm' && filesSrv.currentFolder && filesSrv.currentFolder.breadcrumb && filesSrv.currentFolder.breadcrumb.length && notViewingFile && !searchSrv.isSearching() && !$routeParams.libName);
		},

		removeFileFromUploading: function(file){
			var indexOfFile = this.uploadingFiles.indexOf(file);
			if(indexOfFile > -1){
				this.uploadingFiles.splice(indexOfFile,1);
				// file.cancel();
			}
		},

		removeAllFilesFromUploading: function(){
			for (var i = 0; i < this.uploadingFiles.length; i++) {
				this.removeFileFromUploading(this.uploadingFiles[i]);
			};
		},

		addFileToUploading: function(file){
			file.type = file.relativePath.split('/').length > 1 ? 1 : 0;
			file.parentId = file.uploadFolder.id;
			this.uploadingFiles.push(file);
		},

		uploadRequestsQueue : [],

		flowUpload: function($flow, $files){

			function error(data){
				var msg = 'Có lỗi xảy ra, xin thử lại sau.'
				if( parseInt(data) == -7 ){
					msg = "Không thể upload vì vượt quá dung lượng cho phép upload trong ngày!";
				} else if( parseInt(data) == -17 ){
					msg = "Không thể upload vì vượt quá dung lượng cho phép upload!";
				}
				alertify.error(msg,0);
				removeFilesFromUploading();
			}

			function removeFilesFromUploading(){
				for (var i = 0; i < $files.length; i++) {
					var _file = $files[i];
					self.removeFileFromUploading(_file);
					removeFileFromQueue(_file);
				}
			}

			function removeFileFromQueue(file){
				var indexOfFile = self.uploadRequestsQueue.indexOf(file);
				if(indexOfFile > -1){
					self.uploadRequestsQueue.splice(indexOfFile,1);
				}
			}

			var self = this;

			if($files.length && this.isOkToUpload()){
				//log($files.length);
				var uploadFolder = filesSrv.currentFolder;
				var postData = [];
				for (var i = 0; i < $files.length; i++) {
					var file = $files[i];
					postData.push({
						a: "filemanager_getnode",
						n: file.name,
						s: file.size,
						r: 0
					});
					file.pause();
					file.uploadAccepted = false;
					self.uploadRequestsQueue.push(file);
				};
				// self.uploadAcceptedAll = false;

				$http.post(API_URL, postData).success(function(data){
					// self.uploadAcceptedAll = true;
					if(!$flow.files.length){
						self.uploadRequestsQueue.clear();
						return;
					}
					if(typeof data == 'object' && data.length){
						filesSrv.uploading = true;
						function _resume(file){
							setTimeout(function(){
								file.resume();
							},0);
						}
						for (var i = 0; i < $files.length; i++) {
							var file = $files[i];
							var parts = data[i].p.split('/ul/');
							file.uploadUrl = parts[0];
							file.uploadKey = '/ul/' + parts[1];
							file.uploadFolder = uploadFolder;
							file.uploadAccepted = true;
							removeFileFromQueue(file);
							_resume(file);
						}
						// setTimeout(function(){
						// 	// if($flow.isUploading()){
						// 		$flow.upload();
						// 		// authSrv.stopKeepAlive();
						// 	// }
						// },0);
					} else {
						error(data);
					}
				}).error(function(data, status){
					// self.uploadAcceptedAll = true;
					if(!$flow.files.length){
						self.uploadRequestsQueue.clear();
						return;
					}
					if(status != 401){
						error(data);
					}
				});
				// $flow.upload();
				// $('#FmUploader .files-list').scrollTo('.row:last-child', {axis: 'y'});
			} else {
				removeFilesFromUploading();
			}
		},

		uploadingFiles: [],
		// tempUploadingNodes: [],
		// tempUploadingExist: false,

		fileAdded: function($flow, $file, $event){
			//log("fileAdded:" + " name: " + $file.relativePath + " | filesize: " + $file.size );

			var fileParts = $file.relativePath.split('/');
			var fileName = fileParts[fileParts.length - 1];

			// ignore Thumbs.db file
			if(fileName === 'Thumbs.db'){
				return false;
			}
		},

		filesAdded: function($flow, $files, $event){
			//log("filesAdded" + " count: " + $files.length );
			var uploadingExist = false;
			var tempUploadingFiles = [];
			var dirDeepAllowed = true;
			// this.tempUploadingExist = false;
			// this.tempUploadingNodes = [];
			for (var i = 0; i < $files.length; i++) {
				var $file = $files[i];
				$file.uploadFolder = filesSrv.currentFolder;
				var fileParts = $file.relativePath.split('/');
				if($file.uploadFolder.breadcrumb.length + fileParts.length - 2 > filesSrv.allowedDirDeep){
					dirDeepAllowed = false;
					break;
				}
				var name = fileParts[0];
				var nodeExist = false;
				var uploadFolderNodesLength = $file.uploadFolder && typeof $file.uploadFolder.nodes != 'undefined' ? $file.uploadFolder.nodes.length : 0;
				var forLength = uploadFolderNodesLength + this.uploadingFiles.length;
				for (var j = 0; j < forLength; j++) {
					var n = j < uploadFolderNodesLength ? $file.uploadFolder.nodes[j] : this.uploadingFiles[j - uploadFolderNodesLength];
					var _name = j < uploadFolderNodesLength ?  n.name : n.name.split('/')[0];
					if(fileParts.length > 1){
						if(n.type == 1 && _name === name && $file.uploadFolder.id === n.parentId){
							nodeExist = true;
							break;
						}
					} else {
						if(n.type == 0 && _name === name && $file.uploadFolder.id === n.parentId){
							nodeExist = true;
							break;
						}
					}
				}
				if(nodeExist){
					// $event.preventDefault();
					uploadingExist = true;
					break;
				} else {
					$file.type = fileParts.length > 1 ? 1 : 0;
					$file.parentId = $file.uploadFolder.id;
					tempUploadingFiles.push($file);
					// tempUploadingFiles.push({
					// 	type: fileParts.length > 1 ? 1 : 0,
					// 	name: name,
					// 	parentId: $file.uploadFolder.id
					// });
				}
			};

			if(!dirDeepAllowed){
				alertify.error('Không thể upload thư mục, vì số cấp vượt quá' + ' <b>' + filesSrv.allowedDirDeep + '</b>', 0);
				return false;
			} else if(uploadingExist){
				// $event.preventDefault();
				alertify.error('Không thể upload vì trùng tên!',0);
				return false;
			} else {
				this.uploadingFiles = this.uploadingFiles.concat(tempUploadingFiles);
			}
		},

		filesSubmitted: function($flow, $files, $event){
			// if(uiState.page.name != 'fm'){
			// 	//log("filesSubmitted, now route to /fm/files...");
			// 	$location.path('/fm/files');
			// } else {
				//log("filesSubmitted");
				// if(filesSrv.currentFolder.breadcrumb.length){
					this.flowUpload($flow, $files);
				// }
				// $flow.upload();
				// $('#FmUploader .files-list').scrollTo('.row:last-child', {axis: 'y'});
			// }
		},

		uploadStarted: function($flow){
			//log("uploadStarted");
			$rootScope.uploaderHasError = false;
			authSrv.stopKeepAlive();
		},

		fileProgress: function($flow, $file){
			//log("fileProgress");
		},

		fileRetry: function($flow, $file){
			//log("fileRetry");
			this.addFileToUploading($file);
		},

		fileSuccess: function($flow, $file, $message){
			//log("fileSuccess: filename " + $file.relativePath + " | message: " + $message);
			var self = this;
			var _promise = filesSrv.createNodeWithPath($file, $message);
			if(typeof _promise != 'undefined'){
				_promise.then(function(){
					self.removeFileFromUploading($file);
				}, function(){
					self.removeFileFromUploading($file);
				});
			} else {
				self.removeFileFromUploading($file);
			}

			// if( i < fileParts.length-1){
			// } else {

			// }
		},

		fileError: function($flow, $file, $message){
			//log("fileError: filename " + $file.name + " | message: " + $message);
			this.removeFileFromUploading($file);

			// if($flow.errorCount===undefined){
			// 	$flow.errorCount = 1;
			// } else {
			// 	if($file.errorCount===undefined){
			// 		$file.errorCount = 1;
			// 	} else {
			// 		$file.errorCount++;
			// 	}

			// 	if($file.errorCount==1){
			// 		$flow.errorCount++;
			// 	}
			// }
			// //log($flow.errorCount);
		},

		error: function($flow, $file, $message){
			//log("flow error: filename " + $file.name + " | message: " + $message);
			$rootScope.uploaderHasError = true;
		},

		progress: function($flow){
			//log("progress");
		},

		complete: function($flow){
			//log("flow complete");
			// $flow.complete = true;
			filesSrv.uploading = false;
			authSrv.keepAlive();

		}

	}; // end var _downloadSrv

	// $rootScope.$on(AUTH_EVENTS.logoutComplete, function() {
	// 	_downloadSrv.removeAllFilesFromUploading();
	// });

	return _downloadSrv;

} );
