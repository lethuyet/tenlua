'use strict';

angular.module( 'TenLua' )
.factory( 'filesSrv', function( $rootScope, $http, $location, $routeParams, $route, $timeout, $q, $filter, $modal, uiState, dialog, API_URL ) {

	var _filesSrv = {

		maxBreadcrumbNodes: 4,
		allowedDirDeep: 5,
		flatFs: [],
		fs: [],
		fsLookup: {},
		fsRootNode: {},
		pictures: {
			name: 'Ảnh',
			id: 'pictures',
			// type: 2,
			nodes: []
		},
		music: {
			name: 'Nhạc',
			id: 'music',
			// type: 2,
			nodes: []
		},
		videos: {
			name: 'Videos',
			id: 'videos',
			// type: 2,
			nodes: []
		},
		downloadSidebar: {
			name: 'Downloads',
			id: 'downloads',
			
		},
		checkedNodes: [],


		queueDownload: [],//files
		currQueueDownloadIndex: 0,

		queuePartDownload: [],//parts of file
		currQueuePartDownloadIndex: 0,

		isDownloading: 0,
		retryDownload:20,//retry 3 lần nếu ko dc thì cho next 
		
		downloadConfig:{
			dirid:'tenlua',
			dl_id:null,
			dl_fw:null,
			startPos:0,
			endPos:0,
			part:[],
			currSizeDownload:0
		},


		allNodesChecked: null,
		currentNodesList: {
			nodes: [],
			slideShowingNodes: []
		},
		currentFolder: {
			breadcrumb: [],
			nodes: [],
			slideShowingNodes: [],
			// id: '',
			// parentId: '',
			// name: '',
			// ...
		},

		docExts: ['txt','tiff','pdf','ppt','pps','doc','docx','xls','xlsx','pptx','pages','ai','psd','dxf','svg','eps','ps','ttf','xps'],
		musicExts: ['mp3', 'aac', 'm4a', 'f4a', 'ogg', 'oga', 'wma', 'wav', 'flac'],
		pictureExts: ['jpg', ' jpeg', 'png', 'gif', 'tif', 'bmp'/*, 'svg'*/],
		videoExts: ['wmv', 'mpg', 'mpeg', 'mp4', 'avi', 'mkv', '3gp', 'webm', 'flv', 'mov'],
		videoExtsHard: ['mkv', 'avi', 'wmv', 'mpg', 'mpeg'],

		isPicture: function(node){
			return this.pictureExts.indexOf(node.ext) != -1;
		},

		isVideo: function(node){
			return this.videoExts.indexOf(node.ext) != -1;
		},

		isVideoHard: function(node){
			return this.videoExtsHard.indexOf(node.ext) != -1;
		},

		isMusic: function(node){
			return this.musicExts.indexOf(node.ext) != -1;
		},

		isDoc: function(node){
			return this.docExts.indexOf(node.ext) != -1;
		},

		addToLibraries: function(node){
			if(this.isMusic(node)){
				this.music.nodes.push(node);
			} else if(this.isVideo(node)){
				this.videos.nodes.push(node);
			} else if(this.isPicture(node)){
				this.pictures.nodes.push(node);
			}
		},

		deleteFromLibraries: function(node){
			if(this.isMusic(node)){
				var index = this.music.nodes.indexOf(node);
				if(index > -1){
					this.music.nodes.splice(index,1);
				}
			} else if(this.isVideo(node)){
				var index = this.videos.nodes.indexOf(node);
				if(index > -1){
					this.videos.nodes.splice(index,1);
				}
			} else if(this.isPicture(node)){
				var index = this.pictures.nodes.indexOf(node);
				if(index > -1){
					this.pictures.nodes.splice(index,1);
				}
			}
		},

		canView: function(node){
			return this.isPicture(node) || this.isVideo(node) || this.isMusic(node) || this.isDoc(node);
		},

		canSlideShow: function(node){
			return this.isPicture(node) || this.isVideo(node) || this.isMusic(node) || this.isDoc(node);
		},

		nodeMap: {
			h: 'id',
			p: 'parentId',
			n: 'name',
			ns: 'machineName',
			dl: 'download',
			t: 'type',
			s: 'size',
			lock: 'lock',
			store: 'archived',
			private: 'private',
			u: 'ownerId',
			own: 'own',
			ts: 'timeStamp',
			image: 'image',
			video: 'video',
			music: 'music',
			doc: 'doc',
			fileType: 'fileType'
		},

		mapNodeProp: function(node, map){
			// var map = this.nodeMap;
			// var result = {};
			// for (var i in node){
			// 	var name = map[i];
			// 	var value = node[i];
			// 	// result[name] = name == 'type' ? parseInt(value) : value;
			// 	if(name == 'type' || name == 'size' || name == 'archived'){
			// 		result[name] = parseInt(value);
			// 	} else if(name == 'timeStamp'){
			// 		result[name] = value * 1000;
			// 	} else {
			// 		result[name] = value;
			// 	}
			// }
			// return this.initNodeInfo(result);
			var map = map ? map : this.nodeMap;
			// var result = {};
			for (var oldKey in node){
				var newKey = map[oldKey];
				if(newKey == 'type' || newKey == 'size' || newKey == 'archived'){
					node[newKey] = parseInt(node[oldKey]);
					delete node[oldKey];
				} else if(newKey == 'timeStamp'){
					node[newKey] = node[oldKey] * 1000;
					delete node[oldKey];
				} else {
					if (oldKey !== newKey) {
						Object.defineProperty(node, newKey, Object.getOwnPropertyDescriptor(node, oldKey));
						delete node[oldKey];
					}
				}
			}
			this.initNodeInfo(node);
			this.addToSlideShowingNodes(node);
			if(node.type == 0){
				this.addToLibraries(node);
			}
			return node;
		},

		makeNodeExt: function(node){
			if(node && node.ext){
				node.fileType = node.ext;
			} else {
				var nameParts = node.name ? node.name.split('.') : [];
				node.ext = node.fileType =  nameParts.length > 1 && node.type === 0 ? nameParts[nameParts.length - 1].toLowerCase() : '';
			}
		},

		initNodeInfo: function(node){
			// var node = this.mapNodeProp(node);
			this.makeNodeExt(node);

			node.style = {};
			if(node.image){
				node.style = {
					'background-image': 'url(' + node.image + ')'
				}
				node.imageSmall = node.image + '&size=small';
				node.imageMedium = node.image + '&size=medium';
				node.imageLarge = node.image + '&size=large';
			}

			if(node.type == 1){
				node.nodes = [];
				node.fileType = "Folder";
				// node.ext = '';
			}
			// else if(node.type == 0){
			// 	this.addToLibraries(node);
			// }

			// this.addToSlideShowingNodes(node);

			// return node;
		},

		useCurrentFolderNodes: function(){
			return !$rootScope.searchSrv.isSearchingCurrent() && !$routeParams.libName;
		},

		useLibraryNodes: function(){
			return !$rootScope.searchSrv.isSearchingCurrent() && $routeParams.libName;
		},

		useCurrentFolderSearch: function(){
			return $rootScope.searchSrv.isSearchingCurrent();
		},

		currentFolderNodes: function(){
			if(this.currentFolder){
				this.arrCurrentFolderNodes = $filter('orderBy')(this.currentFolder.nodes, ['-type',this.nodeListOrder], this.nodeListReverse);
			} else {
				this.arrCurrentFolderNodes = [];
			}
			return this.arrCurrentFolderNodes;
		},

		currentLibraryNodes: function(library){
			if(this.currentNodesList){
				var nodes1 = $filter('orderBy')(this.currentNodesList.nodes, ['-type',this.nodeListOrder], this.nodeListReverse);
				var nodes2 = $filter('startFrom')(nodes1, (library.currentPage-1) * $rootScope.searchSrv.paging.pageSize, $rootScope.searchSrv.paging.pageSize);
				var nodes3 = $filter('limitTo')(nodes2, $rootScope.searchSrv.paging.pageSize);
				this.arrCurrentLibraryNodes = nodes3;
			} else {
				this.arrCurrentLibraryNodes = [];
			}
			return this.arrCurrentLibraryNodes;
		},

		currentFolderSearch: function(){
			if(this.currentNodesList){
				var nodes1 = $filter('orderBy')(this.currentNodesList.nodes, ['-type',this.nodeListOrder], this.nodeListReverse);
				var nodes2 = $filter('startFrom')(nodes1, ($rootScope.searchSrv.currentPage.page-1) * $rootScope.searchSrv.paging.pageSize, $rootScope.searchSrv.paging.pageSize);
				var nodes3 = $filter('limitTo')(nodes2, $rootScope.searchSrv.paging.pageSize);
				this.arrCurrentFolderSearch = nodes3;
			} else {
				this.arrCurrentFolderSearch = [];
			}
			return this.arrCurrentFolderSearch;
		},

		updateCurrentNodesList: function(nodes){
			this.currentNodesList.nodes = nodes;
			if(!$rootScope.searchSrv.isSearchingCurrent() && ($routeParams.libName == 'pictures' || $routeParams.libName == 'videos')){
				this.currentNodesList.slideShowingNodes = nodes;
				return;
			}
			this.currentNodesList.slideShowingNodes = [];
			for (var i = 0; i < this.currentNodesList.nodes.length; i++) {
				var node = this.currentNodesList.nodes[i];
				if(this.canSlideShow(node)){
					this.currentNodesList.slideShowingNodes.push(node);
				}
			};
		},

		buildBreadcrumb: function(node){
			// if(node.type !== 0){
				node.breadcrumb = [];
				var parentNode = this.fsLookup[node.parentId];
				if(parentNode && parentNode.breadcrumb && parentNode.breadcrumb.length){
					node.breadcrumbString = '';
					for (var j = 0; j < parentNode.breadcrumb.length; j++) {
						node.breadcrumb[j] = parentNode.breadcrumb[j];
						if(node.breadcrumb[j].type != 2){
							node.breadcrumbString += '/' + node.breadcrumb[j].name;
						}
					};
					// if(parentNode.type == 2){
					// 	node.breadcrumbString = '/';
					// }
				}
				node.breadcrumb.push(node);
			// }
		},

		unflatten: function(array, parent, tree, isChild) {
			var self = this;

			//tree = typeof tree !== 'undefined' ? tree : [];
			tree = tree ? tree : [];
			parent = typeof parent !== 'undefined' ? parent : { id: '' };

			var nodes = [];
			// for (var i = 0; i < array.length; i++) {
			// 	var node = array[i];
			// 	if (!node.id) {
			// 		// node = self.mapNodeProp(node);
			// 		self.mapNodeProp(node);
			// 		// self.fsLookup[node.id] = node;
			// 	}
			// 	if (node.parentId == parent.id) {
			// 		nodes.push(node);
			// 	}
			// }
			for (var i = 0; i < array.length; i++) {
				var node = array[i];
				var parentId = typeof node.parentId != 'undefined' ? node.parentId : node.p;
				if (parentId == parent.id) {
					if (!node.id) {
						self.mapNodeProp(node);
					}
					nodes.push(node);
				}
			}

			if (nodes.length) {
				//if (!parent.id) {
				if(!isChild){
					tree = nodes;
				} else {
					parent['nodes'] = nodes;
				}
				for (var i = 0; i < nodes.length; i++) {
					var n = nodes[i];
					// n.size = n.size ? n.size : 0;
					// parent.size = parent.size ? parent.size : 0;
					// parent.size += n.size;
					self.flatFs.push(n);
					self.fsLookup[n.id] = n;
					self.buildBreadcrumb(n);
					self.unflatten(array, n, null, 'isChild');
				}
			}

			return tree;
		},

		getFs: function(nodeId, isDownload){
			var self = this;
			self.fsDataReturn = false;
			var postData = nodeId ? [{"a":"filemanager_gettree", "p": nodeId}] : [{"a":"filemanager_gettree"}];
			if (nodeId && isDownload) {
				postData[0].download = 1;
			}
			// var postData = [{"a":"filemanager_gettree", "p": "1037e42be90c6507"}];
			var postConfig = {cache: false};
			return $http.post(API_URL, postData, postConfig)
				.success(function(data, status, headers, config) {
					self.fsDataReturn = true;
					if($rootScope.wrongResponse(data[0])){
						alertify.error('Liên kết không tồn tại!',0);
						$location.path('/');
					} else {
						self.fs = self.unflatten(data[0].f);
						self.fsRootNode = self.fs[0];
						self.fsRootNode.name = self.fsRootNode.name || 'Files';
						if (nodeId) {
							self.fsLookup[nodeId].dataReturned = true;
							self.fsLookup[nodeId].dataError = false;
						} else {
							self.fsRootNode.dataReturned = true;
							self.fsRootNode.dataError = false;
						}
						
						// self.fsLookup[self.pictures.id] = self.pictures;
						// self.fsLookup[self.music.id] = self.music;
						// self.fsLookup[self.videos.id] = self.videos;
						// var folder = self.currentFolder.id ? self.currentFolder : self.fsRootNode;
						// self.openFolder(folder.id);
						self.openNodeFromUrlSearch('firstTime');
					}
				})
				.error(function(data, status, headers, config) {
					self.fsDataReturn = true;
					if(status != 401){
						if(status == 404){
							alertify.error('Liên kết không tồn tại!',0);
							$location.path('/');
						} else {
							alertify.error('Không thể truy xuất dữ liệu, xin thử lại sau.',0);
						}
					}
				});
		},

		clearFs: function(){
			this.flatFs.clear();
			this.fs.clear();
			this.currentFolder = null;
			this.currentNodesList = null;
			this.fsLookup = {};
			this.pictures.nodes.clear();
			this.music.nodes.clear();
			this.videos.nodes.clear();
		},

		// reload: function(firstTime){
		// 	if(firstTime){
		// 		var self = this;
		// 		// var deferred = $q.defer();
		// 		self.getFs().then(function(){
		// 			self.openNodeFromUrlSearch(firstTime);
		// 			// deferred.resolve();
		// 		});
		// 		// return deferred.promise;
		// 	} else {
		// 		$route.reload();
		// 	}
		// },

		//openFolder: function(folderId){
		//	var self = this;
		//	self.checkedNodes.clear();
		//	if(self.currentFolder && self.currentFolder.id == folderId){
		//		return;
		//	}
		//	uiState.folderIn = false;
		//	$timeout(function(){
		//		uiState.folderIn = true;
		//		self.currentFolder = self.fsLookup[folderId];
		//		if(!self.currentNodesList){
		//			self.currentNodesList = {};
		//		}
		//		self.currentNodesList.nodes = self.currentFolder.nodes;
		//		self.currentNodesList.slideShowingNodes = self.currentFolder.slideShowingNodes;
		//		// self.currentNodesList = self.currentFolder;
		//		if(uiState.page.fmName != 'search'){
		//			uiState.page.setTitle(self.currentFolder.name);
		//		}
		//	}, 150);
		//},

		getFolder: function (nodeId, fn) {
			var self = this;
			var postData = [{ "a": "filemanager_gettree", "p": nodeId, "only": true }];
			var postConfig = { cache: false };
			return $http.post(API_URL, postData, postConfig)
				.success(function (data, status, headers, config) {
					if ($rootScope.wrongResponse(data[0])) {
						alertify.error('Liên kết không tồn tại!', 0);
						$location.path('/');
					} else {
						var folder = self.fsLookup[nodeId];
						data[0].f[0].p = folder.parentId ? folder.parentId : '';
						data[0].f[0].t = folder.parentId ? 1 : 2;
						var _fs = self.unflatten(data[0].f, self.fsLookup[folder.parentId]);
						folder = self.fsLookup[nodeId];
						folder.dataReturned = true;
						folder.dataError = false;
						fn && fn(folder);
						//if (only) {
						//	//var _folder = _fs[0];
						//	//folder.nodes = _folder.nodes;
						//	folder.dataReturned = true;
						//	folder.dataError = false;
						//	fn && fn(folder);
						//} else {
						//	self.fsRootNode = _fs[0];
						//	self.fsRootNode.name = self.fsRootNode.name || 'Files';
						//	folder.dataReturned = true;
						//	folder.dataError = false;
						//	self.openNodeFromUrlSearch('firstTime');
						//}
					}
				})
				.error(function (data, status, headers, config) {
					if (status != 401) {
						if (status == 404) {
							alertify.error('Liên kết không tồn tại!', 0);
							$location.path('/');
						} else {
							alertify.error('Không thể truy xuất dữ liệu, xin thử lại sau.', 0);
						}
					}
				});
		},

		openFolder: function (folderId) {
			var self = this;
			self.checkedNodes.clear();
			if (self.currentFolder && self.currentFolder.id == folderId) {
				return;
			}
			uiState.folderIn = false;
			var _folder = self.fsLookup[folderId];
			function open(folder) {
				uiState.folderIn = true;
				self.currentFolder = folder ? folder : _folder;
				if (!self.currentNodesList) {
					self.currentNodesList = {};
				}
				self.currentNodesList.nodes = self.currentFolder.nodes;
				self.currentNodesList.slideShowingNodes = self.currentFolder.slideShowingNodes;
				// self.currentNodesList = self.currentFolder;
				if (uiState.page.fmName != 'search') {
					uiState.page.setTitle(self.currentFolder.name);
				}
			}
			//if (typeof _folder == 'undefined') {
			//	this.getFolder(folderId, open);
			//} else {
			//	if(_folder.dataReturned){
			//		$timeout(open, 150);
			//	} else {
			//		self.currentFolder = _folder;
			//		this.getFolder(folderId, open, true);
			//	}
			//}
			if (_folder.dataReturned) {
				$timeout(open, 150);
			} else {
				self.currentFolder = _folder;
				this.getFolder(folderId, open);
			}
		},

		openRootFolder: function(){
			this.openFolder(this.fsRootNode.id);
		},

		openNode: function(node, $event, path){
			$event && $event.preventDefault();
			// if(node.type === 1 || node.type === 2){
			// 	filesSrv.openFolder(node);
			// }
			if(this.slideShowingNode && this.isMusic(this.slideShowingNode) && this.slideShowingNode !== node){
				this.slideShowingNode = null;
			}
			this.unCheckAllNodes();
			if(!node.updating && !node.isRenaming && !this.isTempNode(node)){
				if(node.type === 0 && !this.canView(node)){
					this.goToDownload(node);
				} else {
					// var path = '/fm/' + uiState.page.fmName + (uiState.page.fmName == 'folder' ? '/' + $routeParams.nodeId : '') + ($routeParams.libName && node.type === 0 ? '/' + $routeParams.libName : '');
					var path = path ? path : $location.path();
					if(node.type == 2){
						$rootScope.searchSrv.keyword = '';
						this.openRootFolder();
						// $location.search({});
						$location.url(path);
					} else {
						this.checkPassword(node).then(function(){
							if($rootScope.searchSrv.isSearchingCurrent()){
								var locSearch = $location.search();
								if(node.type === 0 ){
									locSearch.searchNodeId = node.id;
									locSearch.searchNodeType = node.type;
								} else {
									locSearch.nodeId = node.id;
									locSearch.nodeType = node.type;
									$rootScope.searchSrv.keyword = '';
								}
								// $location.search(locSearch);
								$location.url(path + '?' + $.param(locSearch) );
							} else {
								// $location.search({nodeId: node.id, nodeType: node.type});
								$location.url(path + '?nodeId=' + node.id + '&nodeType=' + node.type);
							}
						});
					}
				}
			}
		},

		openNodeFromUrlSearch: function(firstTime){
			var self = this;
			var locSearch = $location.search();
			if($rootScope.searchSrv.isSearchingCurrent() && locSearch.searchNodeId){
				var nodeId = locSearch.searchNodeId;
				var nodeType = parseInt(locSearch.searchNodeType);
			} else {
				var nodeId = locSearch.nodeId;
				var nodeType = parseInt(locSearch.nodeType);
			}
			this.slideShowingNode = null;

			if($routeParams.libName && nodeType !== 0){
				return;
			}

			var node = self.fsLookup[nodeId];
			if(typeof node == 'undefined'){
				// // node = {id: nodeId, type: nodeType};
				// // self.openRootFolder();
				// self.openNode(self.fsRootNode);
				self.openRootFolder();
				$location.search({});
			} else if(!nodeType && !nodeId){
				this.openRootFolder();
			} else if(nodeType == 1 || nodeType == 2){
				this.openFolder(nodeId);
			} else if(nodeType === 0){
				if(!self.canView(node)){
					self.goToDownload(node);
				} else {
					if(self.canSlideShow(node)){
						if(!$routeParams.libName){
							if(!locSearch.searchNodeId){
								if(!self.currentFolder || node.parentId != self.currentFolder.id){
									self.openFolder(node.parentId);
								}
								// self.slideShowNode(node);
							} else {
								if(!self.currentNodesList){
									self.openFolder(node.parentId);
								}
							}
						}
						self.slideShowNode(node);
					}
				}
			}
			// // if(firstTime && (nodeType == 2 || (!nodeType && !nodeId))){
			if(firstTime){
			// 	$timeout(function(){
					self.fsRootNode.treeOpenOnSidebar = true;
			// 	},700);
			}
		},

		checkPassword: function(node){
			var self = this;
			var deferred = $q.defer();
			if(!node.lock){
				deferred.resolve();
			} else {
				this.checkPasswordModalInstance = $modal.open({
					templateUrl: 'template/check-password-modal.html',
					controller: 'CheckPasswordModalCtrl',
					size: 'sm',
					resolve: {
						node: function(){
							return node;
						}
					}
				});

				this.checkPasswordModalInstance.result.then(function(result){
					deferred.resolve();
				}, function(){});
			}
			return deferred.promise;
		},

		slideShowingNode: null,
		// slideShowingNodes: [],

		closeSlideshow: function(){
			var parentNode = this.fsLookup[this.slideShowingNode.parentId];
			this.slideShowingNode = null;
			if($routeParams.libName){
				$location.search({});
				return;
			}
			if($rootScope.searchSrv.isSearchingCurrent()){
				var locSearch = $location.search();
				delete locSearch.searchNodeId;
				delete locSearch.searchNodeType;
				$location.search(locSearch);
			} else if(typeof parentNode != 'undefined'){
				this.openNode(parentNode);
			}
		},

		slideShowNode: function(node){
			uiState.page.setTitle(node.name);
			this.slideShowingNode = node;
			$(window).trigger('filesSrv.slideshow');
		},

		slideShowPrevNode: function(){
			var nodeIndex = this.indexOfSlideShowingNode() - 1;
			if(nodeIndex > -1){
				// var node = this.currentFolder.slideShowingNodes[nodeIndex];
				var node = this.currentNodesList.slideShowingNodes[nodeIndex];
				// this.slideShowNode(node);
				this.openNode(node);
			}
		},

		slideShowNextNode: function(){
			var nodeIndex = this.indexOfSlideShowingNode() + 1;
			// if(nodeIndex < this.currentFolder.slideShowingNodes.length){
			// 	var node = this.currentFolder.slideShowingNodes[nodeIndex];
			if(nodeIndex < this.currentNodesList.slideShowingNodes.length){
				var node = this.currentNodesList.slideShowingNodes[nodeIndex];
				// this.slideShowNode(node);
				this.openNode(node);
			}
		},

		// indexOfSlideShowingNode: function(node){
		// 	if(this.currentFolder && typeof this.currentFolder.slideShowingNodes != 'undefined'){
		// 		var node = node || this.slideShowingNode;
		// 		return this.currentFolder.slideShowingNodes.indexOf(node);
		// 	}
		// },
		indexOfSlideShowingNode: function(node, curentFolder){
			if(this.currentNodesList && typeof this.currentNodesList.slideShowingNodes != 'undefined'){
				var node = node || this.slideShowingNode;
				return this.currentNodesList.slideShowingNodes.indexOf(node);
			}
		},

		addToSlideShowingNodes: function(node){
			if(this.canSlideShow(node) && !this.isMusic(node) && !this.isDoc(node)){
				var parentNode = this.fsLookup[node.parentId];
				if(typeof parentNode != 'undefined'){
					if(parentNode.slideShowingNodes && parentNode.slideShowingNodes.length){
						parentNode.slideShowingNodes.push(node);
					} else {
						parentNode.slideShowingNodes = [node];
					}
				}
			}
		},

		deleteFromSlideShowingNodes: function(node){
			var parent = this.fsLookup[node.parentId];
			if(typeof parent.slideShowingNodes != 'undefined'){
				var index = parent.slideShowingNodes.indexOf(node);
				if(index>-1){
					parent.slideShowingNodes.splice(index,1);
				}
			}
		},



		backOneNode: function($event){
			if(this.currentFolder.breadcrumb.length > 1){
				var nodeIndex;
				for (var i = 0; i < this.currentFolder.breadcrumb.length; i++) {
					var node = this.currentFolder.breadcrumb[i];
					if (node.id == this.currentFolder.id){
						nodeIndex = i - 1;
						break;
					}
				};
				// this.openFolder(this.currentFolder.breadcrumb[nodeIndex].id);
				this.openNode(this.currentFolder.breadcrumb[nodeIndex]);
			}
		},

		sNodeType: function(node){
			return node.type == 1 ? 'Thư mục' : 'File';
		},

		isTempNode: function(node){
			return node && node.id && node.id.indexOf('temp|||') === 0 ? true : false;
		},

		doneUpdating: function(nodes, doUnchecked){
			if(nodes.length){
				for (var i = 0; i < nodes.length; i++){
					var n = nodes[i];
					delete n.updating;
					if(doUnchecked){
						n.checked = false;
					}
				}
			} else {
				delete nodes.updating;
				if(doUnchecked){
					nodes.checked = false;
				}
			}
		},

		openFmTreeModal: function(parentNode, action, closeFn, dismissFn){
			// var self = this;
			// self.fmTreeModalOpened = true;

			dialog.dialog({
				templateUrl: 'template/fm-tree-modal.html',
				controller: 'FmTreeModalCtrl',
				parentNode: parentNode,
				action: action
			}, closeFn, dismissFn);
		},

		initNewFolder: function(){
			if(this.nodeActionPrevented()){
				return;
			}
			var self = this;
			$timeout(function(){
				var lastNewFolderNum = -1;

				if(self.currentFolder && self.currentFolder.nodes && self.currentFolder.nodes.length){
					for (var i = 0; i < self.currentFolder.nodes.length; i++) {
						var n = self.currentFolder.nodes[i];
						if(n.type == 1){
							if(n.name == 'New folder'){
								lastNewFolderNum = 1;
							} else if(/^(New folder) \(\d+\)$/i.test(n.name)){
								var num = parseInt( n.name.match(/\d+/)[0] );
								if(num > lastNewFolderNum){
									lastNewFolderNum = num;
								}
							}
						}
					}
				}

				var newFolderName = lastNewFolderNum >= 0 ? 'New folder (' + (lastNewFolderNum + 1) + ')' : 'New folder';

				var folder = {
					id: 'temp|||' + new Date().getTime(),
					parentId: self.currentFolder.id,
					name: newFolderName,
					type: 1,
					fileType: 'Folder',
					isRenaming: true,
					nodes: []
				};
				self.fsLookup[folder.id] = folder;
				if(self.currentFolder && typeof self.currentFolder.nodes !='undefined'){
					self.currentFolder.nodes.push(folder);
				} else {
					self.currentFolder.nodes = [folder];
				}
				self.buildBreadcrumb(folder);

				self.currentNodesList.nodes = self.currentFolder.nodes;

			});
		},


		createNewFolder: function(node){
			var self = this;
			var nodeName = node.name;
			var postData = [{
				a: "filemanager_newnode",
				t: node.parentId,
				n: node.name,
				// i: "VEjctkvP9G",
				type: node.type
			}];
			var postConfig = {};

			function error(){
				alertify.error('Không thể tạo thư mục' + ' <b><em>' + nodeName + '</em></b>"!',0);
			}

			if(self.isTempNode(node)){
				$http.post(API_URL, postData, postConfig)
					.success(function(data, status, headers, config) {
						if(data[0] && data[0].f){
							var folder = self.mapNodeProp( data[0].f[0] );
							// self.fs.push(folder);
							delete self.fsLookup[node.id];
							angular.extend(node, folder);
							self.fsLookup[node.id] = node;
							self.flatFs.push(node);
							// self.openFolder(self.currentFolder.id);
							alertify.success('Tạo thành công thư mục' + ': <b><em>' + node.name + '</em></b>');
						} else {
							error();
							self.deleteNode(node);
						}
					})
					.error(function(data, status, headers, config) {
						if(status != 401){
							error();
							self.deleteNode(node);
						}
					});
			} else {
				return $http.post(API_URL, postData, postConfig)
					.success(function(data, status, headers, config) {
						if(data[0] && data[0].f){
							var folder = self.mapNodeProp( data[0].f[0] );
							angular.extend(node, folder);
							self.fsLookup[node.id] = node;

							if(self.fsLookup[node.parentId] && typeof self.fsLookup[node.parentId].nodes !='undefined'){
								self.fsLookup[node.parentId].nodes.push(node);
							} else {
								self.fsLookup[node.parentId].nodes = [node];
							}

							// self.fsLookup[node.parentId].nodes.push(node);
							self.buildBreadcrumb(node);
							// self.openFolder(self.currentFolder.id);
						} else {
							error();
						}
					})
					.error(function(data, status, headers, config) {
						if(status != 401){
							error();
						}
					});
			}
		},

		// createNodeWithPath: function($file, nodeToken){
		// 	var self = this;
		// 	var deferred = $q.defer();
		// 	var path = $file.relativePath;
		// 	var folder = $file.uploadFolder;
		// 	var fileParts = path.split('/');
		// 	var part = 0;

		// 	function error(){
		// 		var msg = '<b><em>' + path + '</em></b> ' + 'không thể upload, xin thử lại sau.'
		// 		alertify.error(msg,0);
		// 		deferred.reject();
		// 	}

		// 	function createNodeIn(parentNode){
		// 		var nodeName = fileParts[part];
		// 		var parentId = parentNode.id;
		// 		if(part < fileParts.length - 1){
		// 			var folderExist = false;
		// 			for (var i = 0; i < parentNode.nodes.length; i++) {
		// 				var n = self.currentFolder.nodes[i];
		// 				if(n.type == 1 && n.name === nodeName){
		// 					folderExist = true;
		// 					break;
		// 				}
		// 			}
		// 			if(!folderExist){
		// 				var node = {
		// 					// id: 'temp|||' + new Date().getTime(),
		// 					parentId: parentId,
		// 					name: nodeName,
		// 					type: 1,
		// 					fileType: 'Folder',
		// 					nodes: []
		// 				}
		// 				self.createNewFolder(node).then(function(){
		// 					part++;
		// 					createNodeIn(node);
		// 				}, function(){
		// 					error();
		// 				});
		// 			}
		// 		} else {
		// 			var nameParts = nodeName.split('.');
		// 			var fileType =  nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
		// 			var postData = [{
		// 				a: "filemanager_newnode",
		// 				tk: nodeToken,
		// 				t: parentId,
		// 				n: nodeName,
		// 				type: 0,
		// 				fileType: $file.file.type === '' ? fileType : $file.file.type
		// 			}];
		// 			$http.post(API_URL, postData).success(function(data){
		// 				// if(typeof data == 'object' && data.length){
		// 				if(data[0] && data[0].f){
		// 					var _node = self.mapNodeProp( data[0].f[0] );
		// 					self.fsLookup[_node.parentId].nodes.push(_node);
		// 					self.fsLookup[_node.id] = _node;
		// 					deferred.resolve();
		// 				} else {
		// 					error();
		// 				}
		// 			}).error(function(data, status){
		// 				if(status != 401){
		// 					error();
		// 				}
		// 			});
		// 			return;
		// 		}
		// 	}

		// 	createNodeIn(folder);
		// 	return deferred.promise;
		// },
		/******************** GIA EDITED END *************************************/
		isDownloadFolder: function(){
			return uiState.page.fmName == 'download';
		},
		checkCompleteDownload:function(){
			if (self.isDownloading == 1)
				return 'Bạn đang trong tiến trình đownload! Bạn có chắc muốn thoát?';
			return;
			
		},
		downloadFolder:function(folder){
			console.log('download Folder');
			//console.log(folder);
			var nodeId=folder.id;
			var self = this;
			self.fsDataReturn = false;
			var postData = nodeId ? [{"a":"filemanager_gettree", "p": nodeId}] : [{"a":"filemanager_gettree"}];
			
			// var postData = [{"a":"filemanager_gettree", "p": "1037e42be90c6507"}];
			var postConfig = {cache: false};
			$http.post(API_URL, postData, postConfig)
				.success(function(data, status, headers, config) {
					self.fsDataReturn = true;
					if($rootScope.wrongResponse(data[0])){
						// alertify.error('Liên kết không tồn tại!',0);
						// $location.path('/');
					} else {
						var arrNodeDownload = data[0].f;//self.unflatten(data[0].f);
						//var arrNodeDownloads=[];
						console.log(arrNodeDownload);
						for (var i = 0; i < arrNodeDownload.length; i++) {
							if(arrNodeDownload[i].t==0){
								var nodeTemp = self.mapNodeProp(arrNodeDownload[i]);
								self.queueDownload.push(nodeTemp);	
							}

							
						}
						
						//console.log(arrNodeDownloads);

						self.getNodeInfo(self.queueDownload[self.currQueueDownloadIndex]);

						// angular.forEach(arrNodeDownload, function(value, key) {
						// 	if(value.fileType!=="Folder")
						// 	{
						// 		value.retry=0;
						// 		this.push(value);
						// 	}
						  	
						// }, self.queueDownload);


						
						// alertify.success('Bạn đang có ' + ' <b>' + self.queueDownload.length + '</b> Files trong tiến trình Download. <a href="#" style="color:white;">Xem danh sách</a>');
						// self.getNodeInfo(self.queueDownload[self.currQueueDownloadIndex]);
					}
				})
				.error(function(data, status, headers, config) {
					
				});

			//var self = this;
			//var _folder = self.fsLookup[folder.id];
			//console.log(self.fsLookup);
		},
		downloadMultiFiles : function(){

			console.log('download Multifile');
			//filesSrv.checkedNodes.length;
			var self = this;
			
			// if(self.isDownloading==1)
			// {
			// 	return;
			// }

			//console.log(self.checkedNodes);
		
			//If lenght > 0	
			window.onbeforeunload = function() {
				return self.checkCompleteDownload();
			};
			if(self.checkedNodes.length>0)
			{

				if(self.isDownloading==0)
				{
					angular.forEach(self.checkedNodes, function(value, key) {
						if(value.fileType!=="Folder")
						{
							value.retry=0;
							this.push(value);
						}
					  	
					}, self.queueDownload);


					
					alertify.success('Bạn đang có ' + ' <b>' + self.queueDownload.length + '</b> Files trong tiến trình Download. <a href="#" style="color:white;">Xem danh sách</a>');
					self.getNodeInfo(self.queueDownload[self.currQueueDownloadIndex]);
					
				}
				else
				{
					
					//add node to queue
					angular.forEach(self.checkedNodes, function(value, key) {
					  	if(value.fileType!=="Folder")
						{
							value.retry=0;
							this.push(value);
						}
					}, self.queueDownload);
					alertify.success('Bạn đang có ' + ' <b>' + self.queueDownload.length + '</b> Files trong tiến trình Download. <a ng-href="#!/fm/files/download" style="color:white;">Xem danh sách</a>');
				}
				
				
			}
			
			


			
		},

		getNodeInfo:function(node)
		{
			self=this;
			// if(typeof(node) == "undefined")
			// {
			// 	self.currQueueDownloadIndex=0;
			// 	self.starDownload(self.queueDownload[self.currQueueDownloadIndex]);
			// 	return;
			// }
			console.log('node:');
			console.log(node);
			self.isDownloading=1;
				
			node.statusDownload=1;//Khởi tạo


			var postData = [{
						a: "filemanager_builddownload_getinfo",
						n: node.id
					}];
			var postConfig = {cache: false};

			console.log('getnodeInfo:'+API_URL);
			$http.post(API_URL, postData, postConfig)
				.success(function(data, status, headers, config) {
					if(data[0]){
						node.ready=1;
						node.downloadInfo=data[0];

						//start download
						//self.currQueueDownloadIndex=0;
						//self.starDownload(self.queueDownload[self.currQueueDownloadIndex]);
						node.statusDownload=2;//bắt đầu download
						node.downloadPercent=0;
						node.currSizeCompleted=0;
						node.retry=0;//reset retry
						self.starDownload(node);
						

					} else {
						//error();
					}

					
					//self.currQueueDownloadIndex++;
					//self.getNodeInfo(self.queueDownload[self.currQueueDownloadIndex]);
				})
				.error(function(data, status, headers, config) {
					if(status != 401){
						
						console.log('Thử lấy lại thông tin NODE');
						
						if(node.retry<=self.retryDownload)
						{
							self.queueDownload[self.currQueueDownloadIndex]['statusDownload']=4;//retry
							//retry download
							setTimeout(function(){
								console.log('Retry Get node info: '+node.retry);
								node.retry+=1;
								self.getNodeInfo(node);

							},2000);
							
						}
						else
						{
							//error();
							// alertify.error('Không thể kết nối với server! Xin kiểm tra mạng và bấm nút này để thử lại!', function(){
							// 	self.getNodeInfo(node);
							// });
							self.queueDownload[self.currQueueDownloadIndex]['statusDownload']=5;//retry
							self.getNodeInfo(self.queueDownload[++self.currQueueDownloadIndex]);
						}
					}
				});


		},
		starDownload:function(node)
		{
			
			//console.log(node);
			//return;

			self=this;
			if(typeof(node) == "undefined")
			{				
				return;
			}

			//get chunk
			console.log(node.downloadInfo.chunksize);
			$http.post(node.downloadInfo.chunksize, null,  {cache: false})
			.success(function(data, status, headers, config) {
				if(data['error_code']==0){

					self.downloadConfig.dl_filesize=parseFloat(node.downloadInfo.real_size);
					self.downloadConfig.dl_chunksize=parseFloat(data['chunksize']); 
					self.downloadConfig.dl_partdownload=node.downloadInfo.partdownload;
					self.downloadConfig.dl_id=node.id;					
					self.downloadConfig.dl_name=node.name;
					self.downloadConfig.currSizeDownload=0;

					//tính số lượng part cần down
					var numPart=Math.ceil(self.downloadConfig.dl_filesize/self.downloadConfig.dl_chunksize);
					//nếu bé hơn chunk size thì gộp vào luôn node trước nó
					var lastPartSize=self.downloadConfig.dl_filesize-(numPart-1)*self.downloadConfig.dl_chunksize;
					if(lastPartSize<self.downloadConfig.dl_chunksize)
					{
						numPart-=1;
					}
					var pos=0;
					var chunkTemp=0;
					for (var i = 0; i < numPart; i++) {
						chunkTemp=self.downloadConfig.dl_chunksize;
						if(i==numPart-1 && lastPartSize<self.downloadConfig.dl_chunksize)
						{
							chunkTemp=self.downloadConfig.dl_chunksize+lastPartSize;
						}
						self.downloadConfig.part.push({'startPos':pos,'chunksize':chunkTemp,'retry':0});
						pos+=self.downloadConfig.dl_chunksize;
					};
					
					
				
					

					window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem; 
					//window.requestFileSystem(1, self.downloadConfig.dl_filesize, self.download_onInitFs, self.download_ErrorHandler);
					//create file temp to download
					window.requestFileSystem(window.TEMPORARY, self.downloadConfig.dl_filesize, self.download_onInitFs, self.download_ErrorHandler);
					//window.requestFileSystem(window.PERSISTENT, self.downloadConfig.dl_filesize, self.download_onInitFs, self.download_ErrorHandler);


				} else {
					//error();
					console.log('ko lay dc du lieu');
				}

				
				
			})
			.error(function(data, status, headers, config) {
				if(status != 401){
					console.log('Thử lấy lại thông tin CHUNK SIZE');
					
					if(node.retry<=self.retryDownload)
					{
						self.queueDownload[self.currQueueDownloadIndex]['statusDownload']=4;//retry
						//retry download
						setTimeout(function(){
							console.log('Retry Get node CHUNK SIZE: '+node.retry);
							node.retry+=1;
							self.starDownload(node);

						},2000);
						
					}
					else
					{
						//error();
						// alertify.error('Không thể kết nối với server! Xin kiểm tra mạng và bấm nút này để thử lại!', function(){
						// 	self.starDownload(node);
						// });
						self.queueDownload[self.currQueueDownloadIndex]['statusDownload']=5;//retry
						self.starDownload(self.queueDownload[++self.currQueueDownloadIndex]);
					}
				}
			});

			
			

		},
		nextFile:function()
		{

		},
		//retry if part fail
		retryPart:function(pos)
		{

			this.download_write_block(pos);			
		},
		download_onInitFs:function(fs) 
		{

			//self=this;
			//tạo directory
			fs.root.getDirectory(self.downloadConfig.dirid, {create: true}, function(dirEntry) 
			{		
				console.log('step 1: make dir '+self.downloadConfig.dirid);
				document.dirEntry = dirEntry;
			}, self.getDirectory_errorHandler);

			// console.log(self.downloadConfig.dirid + '/' + self.downloadConfig.dl_id);
			// console.log('fs: ');
			// console.log(fs);
			// console.log('---------------');
			//ghi file
			fs.root.getFile(self.downloadConfig.dirid + '/' + self.downloadConfig.dl_id, {create: true}, function(fileEntry) {

				console.log('step 2: create file ' + self.downloadConfig.dirid + '/' + self.downloadConfig.dl_id);
				console.log(fileEntry);


			    // Create a FileWriter object for our FileEntry (log.txt).
			    fileEntry.createWriter(function(fileWriter) {

			    	//console.log(fileWriter);
			    	self.downloadConfig.dl_fw=fileWriter;
			    	//self.downloadConfig.dl_fw.seek(0);
			    	self.downloadConfig.dl_fw.truncate(0);
			    	//self.downloadConfig.dl_fw.truncate(self.downloadConfig.dl_filesize);

			    	//event on download complete
			      	self.downloadConfig.dl_fw.onwriteend = function(e) {

			      		//nếu đã ghi đủ file chunk thì mới download
			      		//alert(self.downloadConfig.currSizeDownload+' | '+self.downloadConfig.dl_filesize);
			      		console.log('complete 1');
			      		if(self.downloadConfig.currSizeDownload==self.downloadConfig.dl_filesize)
			      		{
			      			var myEl = angular.element( document.querySelector( 'body' ) );
				      	

					      	console.log(fileEntry.toURL());
							myEl.append('<a id="dllink"></a>');
							document.getElementById('dllink').download = self.downloadConfig.dl_name;
							document.getElementById('dllink').href = fileEntry.toURL();

							
							//document.getElementById('dllink').href = self.downloadConfig.dl_url;

							
							
							
							if (document.getElementById('dllink').click) document.getElementById('dllink').click();	
							//alert('completed ');

							

							console.log('complete 2');
							self.download_completed();
							
							//next pos
					        self.currQueueDownloadIndex++;

					        //delete template file
					  //       fw.flush();
							// fw.close(); 

					        //download next files

					        console.log(self.currQueueDownloadIndex+' | '+self.queueDownload.length);
					        if(self.currQueueDownloadIndex>=self.queueDownload.length)
					        {
					        	return;
					        }
					        else
					        {
					        	
					        	console.log('step 5: download next files: '+self.currQueueDownloadIndex);
					    		//self.starDownload(self.queueDownload[self.currQueueDownloadIndex]);    
					    		
					    		self.getNodeInfo(self.queueDownload[self.currQueueDownloadIndex]);
					        }
							
			      		}



				      	
				    };

				     self.downloadConfig.dl_fw.onerror = function(e) {
				        console.log('Write failed: ' + e.toString());
				      };

				      // Create a new Blob and write it to log.txt.
				      //var blob = new Blob(['Lorem Ipsum'], {type: 'text/plain'});

				      //fileWriter.write(blob);
				      self.download_write_block(0);//bắt đầu down từ pos 0


			    }, self.download_ErrorHandler);

			  }, self.download_ErrorHandler);


		
		},

		download_write_block:function(pos) 
		{
			//tính toán xem đã hết part chưa
			self=this;
			// if(pos>=10)
			// 	return;
			var d=new Date();
			// self.downloadConfig.startPos=self.downloadConfig.dl_chunksize*pos;
			// self.downloadConfig.endPos=self.downloadConfig.startPos+self.downloadConfig.dl_chunksize;

			
			// if(self.downloadConfig.endPos>self.downloadConfig.dl_filesize)
			// {
			// 	self.downloadConfig.endPos=self.downloadConfig.dl_filesize;
			// }
			// else if(self.downloadConfig.startPos>=self.downloadConfig.dl_filesize)
			// {

			// 	console.log('het part để down!');
			// 	return;
			// }
			if(typeof(self.downloadConfig.part[pos])=="undefined")
				return;

			var currentPart=self.downloadConfig.part[pos];


			var url=self.downloadConfig.dl_partdownload+'?part='+currentPart['startPos']+'_'+currentPart['chunksize']+'&r='+d.getTime();
			self.downloadConfig.dl_url=url;
			
			/*headers: {'TENLUA-Chrome-Antileak': self.downloadConfig.dl_partdownload*/
			console.log('step 3: get data and write to file');
			$http.post(url,null,{cache: false,responseType:'arraybuffer'})			
			.success(function(data, status, headers, config) {

				// alert('download data');
				// //console.log(data);
				if(data)
				{
					 //if (self.downloadConfig.dl_fw.length === 0) {
				        // var databuf = new Uint8Array(data);
						// console.log(databuf);
						// return;
						// console.log(databuf);
						// console.log('buffer end');
						// var databuf = new Uint8Array(data);
						// var databuf = data;

						self.downloadConfig.dl_fw.instance = self.currQueueDownloadIndex;			
						
						self.downloadConfig.dl_fw.targetpos = currentPart['startPos'];//self.downloadConfig.dl_filesize;
						self.downloadConfig.currSizeDownload+=currentPart['chunksize'];


						var myBlob = new Blob([data]);

						// console.log(self.downloadConfig.dl_fw);
						// //self.downloadConfig.dl_fw.write(new Blob([databuf]));	
						// console.log('----------------------------------------');
						// console.log('content-length:' +  databuf.length);
						
						// // console.log(databuf);
						// console.log('----------------------------------------');
						// console.log('blob size:' + myBlob.size);
						// console.log('----------------------------------------');
						// // self.downloadConfig.dl_fw.truncate(self.downloadConfig.dl_filesize);

						
						//tính phần trăm

						self.queueDownload[self.currQueueDownloadIndex]['downloadPercent']=Math.ceil((self.downloadConfig.currSizeDownload/self.downloadConfig.dl_filesize)*100);//completed
						self.queueDownload[self.currQueueDownloadIndex]['currSizeCompleted']=self.downloadConfig.currSizeDownload;
						

						setTimeout(function(){
						    self.downloadConfig.dl_fw.write(myBlob);
						},500);

						
						
						console.log('step 4: Write completed.');

						// Create a new Blob object

						// var a = new Blob();

						// // Create a 1024-byte ArrayBuffer
						// // buffer could also come from reading a File

						// var buffer = new ArrayBuffer(1024);

						// // Create ArrayBufferView objects based on buffer

						// var shorts = new Uint16Array(buffer, 512, 128);
						// var bytes = new Uint8Array(buffer, shorts.byteOffset + shorts.byteLength);

						// var b = new Blob([databuf], {type: "text/plain;charset=UTF-8"});

						//  var c = new Blob([b, shorts]);

						// // var b = new Blob([b, c, bytes]);

						// // var b = new Blob([buffer, b, c, bytes]);



						// self.downloadConfig.dl_fw.write(c);


						//self.downloadConfig.dl_fw.write(databuf);	
						
						self.download_write_block(++pos);
						//return;
				    // } else {
				    //     //file has been overwritten with blob
				    //     //use callback or resolve promise
				    // }
					
				}
				else
					return;
				
				//alert('write data');

			})
			.error(function(data, status, headers, config) {
				//console.log('Error ');
				if(status != 401){
					//error();
					console.log('vao day roi');
					

					if(currentPart.retry<=self.retryDownload)
					{
						self.queueDownload[self.currQueueDownloadIndex]['statusDownload']=4;//retry
						//retry download
						setTimeout(function(){
							console.log('Retry download: '+currentPart.retry);
							currentPart.retry+=1;
							self.download_write_block(pos);

						},2000);
						
					}
					else
					{
						self.queueDownload[self.currQueueDownloadIndex]['statusDownload']=5;//retry
						self.getNodeInfo(self.queueDownload[++self.currQueueDownloadIndex]);
					}
				}
				
			});


			


		},
		download_completed:function(){
			//delete self.downloadConfig;
			//self=this;
			//self.downloadConfig.dl_id=null;
			//self.downloadConfig.dl_fw=null;
			self.downloadConfig.startPos=0;
			self.downloadConfig.endPos=0;
			self.downloadConfig.part=[];
			self.downloadConfig.currSizeDownload=0;
			
			
			self.queueDownload[self.currQueueDownloadIndex]['statusDownload']=3;//completed
			// setTimeout(function(){
			//  	self.queueDownload[self.currQueueDownloadIndex]['statusDownload']=3;//completed
			//  	$rootScope.$apply();
			// },0);

			//thực sự complete thì set = 0
			if(self.currQueueDownloadIndex==self.queueDownload.length-1)
			{
				//self.queueDownload[self.currQueueDownloadIndex]['statusDownload']=3;
				self.isDownloading=0;
			}
			
		},
		download_ErrorHandler:function(e) {
		  var msg = '';

		  switch (e.code) {
		    case FileError.QUOTA_EXCEEDED_ERR:
		      msg = 'QUOTA_EXCEEDED_ERR';
		      break;
		    case FileError.NOT_FOUND_ERR:
		      msg = 'NOT_FOUND_ERR';
		      break;
		    case FileError.SECURITY_ERR:
		      msg = 'SECURITY_ERR';
		      break;
		    case FileError.INVALID_MODIFICATION_ERR:
		      msg = 'INVALID_MODIFICATION_ERR';
		      break;
		    case FileError.INVALID_STATE_ERR:
		      msg = 'INVALID_STATE_ERR';
		      break;
		    default:
		      msg = 'Unknown Error';
		      break;
		  };

		  console.log('Error: ' + msg);
		},
		getDirectory_errorHandler:function(e)
		{
			errorHandler(e,'getDirectory');	
		},
		 
		/******************** GIA EDITED END *************************************/
		createNodeWithPath: function($file, nodeToken){
			if(!nodeToken){
				$rootScope.uploaderHasError = true;
				$file.error = true;
				// alertify.error('Không thể upload' + ' <b><em>' + $file.relativePath + '</em></b><br>' + 'Xin thử lại sau.');
				return;
			}
			var self = this;
			var deferred = $q.defer();
			var path = $file.relativePath;
			var folder = $file.uploadFolder;
			var fileParts = path.split('/');
			var part = 0;

			function error(){
				$rootScope.uploaderHasError = true;
				$file.error = true;
				// var msg = '<b><em>' + path + '</em></b> ' + 'không thể upload, xin thử lại sau.'
				// alertify.error(msg,0);
				deferred.reject();
			}

			function createNodeIn(parentNode){
				var nodeName = fileParts[part];
				var parentId = parentNode.id;
				function afterPromiseNew(node){
					node.promiseNew.then(function(){
						var _index = parentNode.pendingNodes.indexOf(node);
						if(_index > -1){
							parentNode.pendingNodes.splice(_index,1);
						}
						part++;
						createNodeIn(node);
					}, function(){
						var _index = parentNode.pendingNodes.indexOf(node);
						if(_index > -1){
							parentNode.pendingNodes.splice(_index,1);
						}
						error();
					});
				}
				if(part < fileParts.length - 1){
					var folderExist = false;
					var pendingFolderExist = false;
					var existingFolder = null;
					var existingPendingFolder = null;
					var parentNodesLength = typeof parentNode.nodes != 'undefined' ? parentNode.nodes.length : 0;
					for (var i = 0; i < parentNodesLength; i++) {
						var n = parentNode.nodes[i];
						if(n.type == 1 && n.name === nodeName){
							folderExist = true;
							existingFolder = n;
							break;
						}
					}
					if(parentNode.pendingNodes){
						for (var j = 0; j < parentNode.pendingNodes.length; j++) {
							var m = parentNode.pendingNodes[j];
							if(m.type == 1 && m.name === nodeName){
								pendingFolderExist = true;
								existingPendingFolder = m;
								break;
							}
						}
					}
					if(!folderExist && !pendingFolderExist){
						var node = {
							// id: 'temp|||' + new Date().getTime(),
							parentId: parentId,
							name: nodeName,
							type: 1,
							fileType: 'Folder',
							nodes: []
						}
						if(parentNode.pendingNodes){
							parentNode.pendingNodes.push(node);
						} else {
							parentNode.pendingNodes = [node];
						}
						node.promiseNew = self.createNewFolder(node);
						afterPromiseNew(node);
					} else if(pendingFolderExist){
						afterPromiseNew(existingPendingFolder);
					} else if(folderExist){
						part++;
						createNodeIn(existingFolder);
					}
				} else {
					var nameParts = nodeName.split('.');
					var fileType =  nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
					var postData = [{
						a: "filemanager_newnode",
						tk: nodeToken,
						t: parentId,
						n: nodeName,
						type: 0,
						fileType: $file.file.type === '' ? fileType : $file.file.type
					}];
					$http.post(API_URL, postData).success(function(data){
						// if(typeof data == 'object' && data.length){
						if(data[0] && data[0].f){
							var _node = self.mapNodeProp( data[0].f[0] );
							self.fsLookup[_node.parentId].nodes.push(_node);
							self.fsLookup[_node.id] = _node;
							self.flatFs.push(_node);
							// self.addToSlideShowingNodes(_node);
							// self.addToLibraries(_node);
							deferred.resolve();
						} else {
							error();
						}
					}).error(function(data, status){
						if(status != 401){
							error();
						}
					});
					return;
				}
			}

			createNodeIn(folder);
			return deferred.promise;
		},

		deleteNode: function(node){
			this.deleteFromFlatFs(node);
			this.deleteFromLibraries(node);
			var parent = this.fsLookup[node.parentId];
			var nodes = parent.nodes;
			var indexOfNode = nodes.indexOf(node);
			if (indexOfNode > -1){
				delete this.fsLookup[node.id];
				// var index = this.indexOfSlideShowingNode(node);
				// if(typeof parent.slideShowingNodes != 'undefined'){
				// 	var index = parent.slideShowingNodes.indexOf(node);
				// 	parent.slideShowingNodes.splice(index,1);
				// }
				this.deleteFromSlideShowingNodes(node);
				nodes.splice(indexOfNode,1);
			}
		},

		deleteFromFlatFs: function(node){
			var indexInFlatFs = this.flatFs.indexOf(node);
			if(indexInFlatFs > -1){
				this.flatFs.splice(indexInFlatFs,1);
			}
		},

		nodeActionPrevented: function(){
			if(this.uploading){
				dialog.messageBox('tl-icon-warning', 'Chú ý', 'Không thể thực hiện lệnh này vì đang upload!');
				return true;
			}
			return false;
			// var self = this;
			// for (var i = 0; i < self.checkedNodes.length; i++) {
			// 	var n = self.checkedNodes[i];
			// 	if(n.uploading){
			// 		dialog.messageBox('tl-icon-warning', 'Chú ý', 'Không thể thực hiện lệnh này vì đang upload', msgBtns);
			// 		return true;
			// 	}
			// };
			// return false;
		},

		deleteCheckedNodes: function(){
			if(this.nodeActionPrevented()){
				return;
			}
			var self = this;
			var postData = [];
			var toBeDeletedNodes = [];
			// var oldCurrentFolderId = self.currentFolder.id;

			// var sItem = self.checkedNodes.length > 1 ? self.checkedNodes.length + ' đối tượng' : ( self.checkedNodes[0].type == 1 ? 'thư mục' : 'file' );
			// var msgTitle = 'Xóa ' + sItem + '?';
			var msg = 'Bạn có chắc muốn xóa';
			if(self.checkedNodes.length > 1){
				var sItem = self.checkedNodes.length + ' ' + 'đối tượng';
				msg += ' ' + sItem + '?';
			} else {
				// var sItem = self.checkedNodes[0].type == 1 ? 'thư mục' : 'file';
				var sItem = self.sNodeType(self.checkedNodes[0]);
				msg += ' ' + sItem + ' <b><em>' + self.checkedNodes[0].name + '</em></b>?';
			}
			var msgTitle = 'Xóa' + ' ' + sItem;
			var msgBtns = [{
				result: true,
				label: 'OK',
				cssClass: 'btn-success'
			},{
				result: false,
				label: 'Thôi',
				cssClass: 'btn-default'
			}];

			dialog.messageBox('tl-icon-trash', msgTitle, msg, msgBtns, function() {
				// if (result) {
				doDelete();
				// }
			});

			function doDelete(){
				for (var i = 0; i < self.checkedNodes.length; i++) {
					var n = self.checkedNodes[i];
					toBeDeletedNodes.push(n);
					n.updating = true;
					var o = {
						a: 'filemanager_delete',
						n: n.id
						// i: "oKRfvVNB9I"
					};
					postData.push(o);
				};
				if(postData.length){
					$http.post(API_URL, postData)
						.success(function(data, status, headers, config) {
							// var folderCount = 0;
							// var fileCount = 0;

							// for (var i = 0; i < toBeDeletedNodes.length; i++) {
							// 	var _n = toBeDeletedNodes[i];
							// 	if(_n.type == 1){
							// 		folderCount++;
							// 	} else if(_n.type===0){
							// 		fileCount++;
							// 	}
							// 	self.deleteNode(_n);
							// 	self.checkedNodes.clear();
							// }

							// var sSuccessFiles = fileCount ? fileCount + ' ' + 'files' : '';
							// var sSuccessFolders = folderCount ? folderCount + ' ' + 'thư mục' : '';
							var nodesCount = self.nodesCount(toBeDeletedNodes,function(node){
								self.deleteNode(node);
							});
							// self.checkedNodes.clear();
							uiState.fm.inSelectionMode = false;

							alertify.success('Xóa thành công' + ' <b>' + nodesCount.sFilesFolders() + '</b>.');
						})
						.error(function(data, status, headers, config) {
							if(status != 401){
								self.doneUpdating(toBeDeletedNodes);
								alertify.error('Không thể thực hiện lệnh xóa!',0);
							}
						});
				}
			}
		},

		initRename: function(node){
			if(this.nodeActionPrevented()){
				return;
			}
			var node = node ? node : this.checkedNodes[0];
			node.isRenaming = true;
		},

		rename: function(node, oldName){
			node.isRenaming = false;
			var self = this;
			var deniedChars = '\\/:?*<>"|,';
			function isValidName(str){
				for(var i = 0; i < deniedChars.length;i++){
					if(str.indexOf(deniedChars[i]) > -1){
						return false
					}
				}
				return true;
			}

			function undo(msg){
				if(self.isTempNode(node)){
					self.deleteNode(node);
				} else {
					node.name = oldName;
				}
				setTimeout(function(){
					// alert(msg);
					alertify.error(msg, 0);
				});
			}

			$timeout(function(){
				var nameExist = false;
				var parentNode = self.fsLookup[node.parentId];
				// for (var i = 0; i < self.currentFolder.nodes.length; i++) {
				// 	var n = self.currentFolder.nodes[i];
				for (var i = 0; i < parentNode.nodes.length; i++) {
					var n = parentNode.nodes[i];
					if(n.type == node.type && n.name == node.name && n !== node){
						nameExist = true;
						break;
					}
				};
				if(nameExist){
					undo( 'Tên vừa nhập trùng với tên đang có' + ': <b><em>' + node.name + '</em></b>!' );
				} else if(node.name == '0'){
					undo('Tên không hợp lệ.');
				} else if(!isValidName(node.name)){
					undo('Tên không được chứa các ký tự sau: ' + deniedChars);
				} else if(!node.name){
					undo('Tên không được để trống.');
				} else {
					if(self.isTempNode(node)){
						self.createNewFolder(node);
					} else {
						if(node.name !== oldName){
							node.updating = true;
							var postData = [{
								a: "filemanager_rename",
								n: node.name,
								t: node.id
								// i: "oKRfvVNB9I"
							}];
							$http.post(API_URL, postData)
								.success(function(data, status, headers, config) {
									self.makeNodeExt(node);
									self.doneUpdating(node);
									self.buildBreadcrumb(node);
									alertify.success('Đã sửa tên' + ' <b><em>' + oldName + '</em></b> ' + 'thành' + ' <b><em>' + node.name + '</em></b>' );
								})
								.error(function(data, status, headers, config) {
									if(status != 401){
										self.doneUpdating(node);
										node.name = oldName;
										alertify.error('Không thể sửa tên thành: ' + '<b><em>' + node.name + '</em></b>', 0);
									}
								});
						}
					}
				}
			});

		},

		// moveTo: function(){
		// 	if(this.nodeActionPrevented()){
		// 		return;
		// 	}
		// 	var self = this;
		// 	this.openFmTreeModal('move', function(selectedNode){

		// 		var postData = [];
		// 		var tobeMoved = [];
		// 		var fromNodeId = self.currentFolder.id;
		// 		var duplicatedNames = [];
		// 		var sDuplicatedNames = '';
		// 		var nodesCount;

		// 		function doMove(){
		// 			$http.post(API_URL, postData)
		// 				.success(function(data, status, headers, config) {
		// 					if( $rootScope.wrongResponse(data) ){
		// 						self.doneUpdating(tobeMoved, true);
		// 						alertify.error('Không thể di chuyển!');
		// 					} else {
		// 						var fromNode = self.fsLookup[fromNodeId];
		// 						var fromNodes = fromNode.nodes;
		// 						for (var i = 0; i < tobeMoved.length; i++) {
		// 							var indexOfnode = fromNodes.indexOf(tobeMoved[i]);
		// 							if(indexOfnode > -1){
		// 								var n = fromNodes.splice(indexOfnode,1)[0];
		// 								n.parentId = selectedNode.id;
		// 								// delete n.updating;
		// 								self.doneUpdating(n, true);
		// 								selectedNode.nodes.push(n);
		// 								self.buildBreadcrumb(n);
		// 								self.fsLookup[n.id] = n;
		// 							}
		// 						};
		// 						tobeMoved.clear();
		// 						uiState.fm.inSelectionMode = false;
		// 						alertify.success('<b>' + nodesCount.sFilesFolders() + '</b> ' + 'đã được di chuyển vào thư mục' + ' <b><em>' + selectedNode.name + '</em></b>');
		// 					}
		// 				})
		// 				.error(function(data, status, headers, config) {
		// 					if(status != 401){
		// 						self.doneUpdating(tobeMoved);
		// 						alertify.error('Không thể di chuyển!');
		// 					}
		// 				});
		// 		}

		// 		if(selectedNode === self.currentFolder){
		// 			alertify.error('Thư mục hiện tại đã chứa đối tượng bạn cần di chuyển.');
		// 		} else if(self.checkedNodes.indexOf(selectedNode) != -1){
		// 			alertify.error('Thư mục cần di chuyển trùng với thư mục đến.');
		// 		} else if(selectedNode.updating){
		// 			alertify.error('Không thể di chuyển, vì thư mục bạn chọn đang được cập nhật.');
		// 		} else {
		// 			var duplicatedFilesCount = 0;
		// 			var duplicatedFoldersCount = 0;

		// 			nodesCount = self.nodesCount(self.checkedNodes, function(node){
		// 				var nodeNameDuplicated = false;
		// 				for (var i = 0; i < selectedNode.nodes.length; i++) {
		// 					var n = selectedNode.nodes[i];
		// 					if(node.name === n.name){
		// 						nodeNameDuplicated = true;
		// 						break;
		// 					}
		// 				};
		// 				if(nodeNameDuplicated){
		// 					sDuplicatedNames += sDuplicatedNames ? '<br>' + node.name : node.name;
		// 					duplicatedNames.push(node);
		// 					if(node.type === 0){
		// 						duplicatedFilesCount++;
		// 					} else if(node.type === 1) {
		// 						duplicatedFoldersCount++;
		// 					}
		// 				} else {
		// 					node.updating = true;
		// 					tobeMoved.push(node);
		// 					postData.push({
		// 						a: "filemanager_move",
		// 						n: node.id,
		// 						t: selectedNode.id
		// 						// i: "a0niMJeA4g"
		// 					});
		// 				}
		// 			});

		// 			nodesCount.files -= duplicatedFilesCount;
		// 			nodesCount.folders -= duplicatedFoldersCount;

		// 			if(duplicatedNames.length){
		// 				if(duplicatedNames.length < self.checkedNodes.length){
		// 					var msg = 'Thư mục đến đã chứa các đối tượng có tên sau:' + '<br><b><em>' + sDuplicatedNames + '</em></b><br><br>' + 'Chương trình sẽ bỏ qua những đối tượng đó và tiến hành di chuyển phần còn lại.';
		// 					var msgBtns = [{
		// 						result: true,
		// 						label: 'OK',
		// 						cssClass: 'btn-success'
		// 					},{
		// 						result: false,
		// 						label: 'Thôi',
		// 						cssClass: 'btn-default'
		// 					}];

		// 					dialog.messageBox('tl-icon-warning', 'Trùng tên', msg, msgBtns, function(){
		// 						doMove();
		// 					}, function(){
		// 						self.doneUpdating(tobeMoved);
		// 					});
		// 				} else {
		// 					var msg = 'Thư mục đến đã chứa các đối tượng có tên sau:' + '<br><b><em>' + sDuplicatedNames + '</em></b><br><br>' + 'Chương trình không thể thực hiện lệnh di chuyển.';
		// 					dialog.messageBox('tl-icon-warning', 'Trùng tên', msg, msgBtns);
		// 				}
		// 			} else {
		// 				doMove();
		// 			}
		// 		}
		// 	});
		// },

		moveTo: function(){
			if(this.nodeActionPrevented()){
				return;
			}
			var self = this;
			this.openFmTreeModal(self.fsLookup[self.checkedNodes[0].parentId], 'move', function(selectedNode){

				var postData = [];
				var tobeMoved = [];
				// var fromNodeId = self.currentFolder.id;
				var duplicatedNames = [];
				var sDuplicatedNames = '';
				var nodesCount;

				function doMove(){
					$http.post(API_URL, postData)
						.success(function(data, status, headers, config) {
							if( $rootScope.wrongResponse(data) ){
								self.doneUpdating(tobeMoved, true);
								alertify.error('Không thể di chuyển!');
							} else {
								// var fromNode = self.fsLookup[fromNodeId];
								// var fromNodes = fromNode.nodes;
								for (var i = 0; i < tobeMoved.length; i++) {
									var fromNodeId = tobeMoved[i].parentId;
									var fromNode = self.fsLookup[fromNodeId];
									var fromNodes = fromNode.nodes;
									var indexOfnode = fromNodes.indexOf(tobeMoved[i]);
									self.deleteFromSlideShowingNodes(tobeMoved[i]);
									if(indexOfnode > -1){
										var n = fromNodes.splice(indexOfnode,1)[0];
										n.parentId = selectedNode.id;
										// delete n.updating;
										self.doneUpdating(n, true);
										selectedNode.nodes.push(n);
										self.addToSlideShowingNodes(n);
										self.buildBreadcrumb(n);
										self.fsLookup[n.id] = n;
									}
								};
								tobeMoved.clear();
								uiState.fm.inSelectionMode = false;
								alertify.success('<b>' + nodesCount.sFilesFolders() + '</b> ' + 'đã được di chuyển vào thư mục' + ' <b><em>' + selectedNode.name + '</em></b>');
							}
						})
						.error(function(data, status, headers, config) {
							if(status != 401){
								self.doneUpdating(tobeMoved);
								alertify.error('Không thể di chuyển!');
							}
						});
				}

				/*if(selectedNode === self.currentFolder){
					alertify.error('Thư mục hiện tại đã chứa đối tượng bạn cần di chuyển.');
				} else */
				if(self.checkedNodes.indexOf(selectedNode) != -1){
					alertify.error('Thư mục cần di chuyển trùng với thư mục đến.');
				} else if(selectedNode.updating){
					alertify.error('Không thể di chuyển, vì thư mục bạn chọn đang được cập nhật.');
				} else {
					var duplicatedFilesCount = 0;
					var duplicatedFoldersCount = 0;

					nodesCount = self.nodesCount(self.checkedNodes, function(node){
						var nodeNameDuplicated = false;
						for (var i = 0; i < selectedNode.nodes.length; i++) {
							var n = selectedNode.nodes[i];
							if(node.name === n.name){
								nodeNameDuplicated = true;
								break;
							}
						};
						if(nodeNameDuplicated){
							sDuplicatedNames += sDuplicatedNames ? '<br>' + node.name : node.name;
							duplicatedNames.push(node);
							if(node.type === 0){
								duplicatedFilesCount++;
							} else if(node.type === 1) {
								duplicatedFoldersCount++;
							}
						} else {
							node.updating = true;
							tobeMoved.push(node);
							postData.push({
								a: "filemanager_move",
								n: node.id,
								t: selectedNode.id
								// i: "a0niMJeA4g"
							});
						}
					});

					nodesCount.files -= duplicatedFilesCount;
					nodesCount.folders -= duplicatedFoldersCount;

					if(duplicatedNames.length){
						if(duplicatedNames.length < self.checkedNodes.length){
							var msg = 'Thư mục đến đã chứa các đối tượng có tên sau:' + '<br><b><em>' + sDuplicatedNames + '</em></b><br><br>' + 'Chương trình sẽ bỏ qua những đối tượng đó và tiến hành di chuyển phần còn lại.';
							var msgBtns = [{
								result: true,
								label: 'OK',
								cssClass: 'btn-success'
							},{
								result: false,
								label: 'Thôi',
								cssClass: 'btn-default'
							}];

							dialog.messageBox('tl-icon-warning', 'Trùng tên', msg, msgBtns, function(){
								doMove();
							}, function(){
								self.doneUpdating(tobeMoved);
							});
						} else {
							var msg = 'Thư mục đến đã chứa các đối tượng có tên sau:' + '<br><b><em>' + sDuplicatedNames + '</em></b><br><br>' + 'Chương trình không thể thực hiện lệnh di chuyển.';
							dialog.messageBox('tl-icon-warning', 'Trùng tên', msg, msgBtns);
						}
					} else {
						doMove();
					}
				}
			});
		},

		isAllArchived: function(){
			var result = true;
			for (var i = 0; i < this.checkedNodes.length; i++) {
				if(!this.checkedNodes[i].archived){
					result = false;
				}
			};
			return result;
		},

		isAllPrivate: function(){
			var result = true;
			for (var i = 0; i < this.checkedNodes.length; i++) {
				if(!this.checkedNodes[i].private){
					result = false;
				}
			};
			return result;
		},

		isAllPassword: function(){
			var result = true;
			for (var i = 0; i < this.checkedNodes.length; i++) {
				if(!this.checkedNodes[i].lock){
					result = false;
				}
			};
			return result;
		},

		archive: function(node){
			if(this.nodeActionPrevented()){
				return;
			}
			if(node){
				this.unCheckAllNodes();
				node.checked = true;
				this.nodeCheckToggle(node);
			}
			var self = this;
			var node = self.checkedNodes[0];
			var archived = node.archived;
			var sNode = self.sNodeType(node) + ' <b><em>' + node.name + '</em></b>' + ( node.type === 1 ? ' ' + 'và nội dung bên trong' : '' );
			var sArchive = archived ? 'bỏ lưu trữ' : 'lưu trữ';
			node.updating = true;
			var msgBtns = [{
				result: true,
				label: 'OK',
				cssClass: 'btn-success'
			},{
				result: false,
				label: 'Thôi',
				cssClass: 'btn-default'
			}];

			function childrenArchive(node){
				if(node.nodes){
					for (var i = 0; i < node.nodes.length; i++) {
						var n = node.nodes[i];
						n.archived = !archived;
						childrenArchive(n);
					};
				}
			}

			dialog.messageBox('tl-icon-archive', 'Xác nhận', 'Bạn có chắc muốn' + ' ' + sArchive + ' ' + sNode + '?', msgBtns, function() {
				var postData = [{
					a: 'filemanager_storefile',
					t: node.id,
					s: node.archived ? 0 : 1
					// i: "QDE1vw9cqA"
				}];
				$http.post(API_URL, postData)
					.success(function(data, status, headers, config) {
						if($rootScope.wrongResponse(data)){
							self.doneUpdating(node);
							alertify.error('Không thể' + ' ' + sArchive + ' ' + sNode + '!');
						} else {
							node.archived = !archived;
							childrenArchive(node);
							self.doneUpdating(node);
							alertify.success('Đã' + ' ' + sArchive + ' ' + sNode + '.');
						}
					})
					.error(function(data, status, headers, config) {
						if(status != 401){
							self.doneUpdating(node);
							alertify.error('Không thể' + ' ' + sArchive + ' ' + sNode + '!');
						}
					});
			}, function(){
				self.doneUpdating(node);
			});

		},
		// archive: function(){
		// 	if(this.nodeActionPrevented()){
		// 		return;
		// 	}
		// 	var self = this;
		// 	var nodes = self.checkedNodes;
		// 	var isAllArchived = this.isAllArchived();
		// 	if(nodes.length > 1){
		// 		var sNodes = 'các đối tượng được chọn và nội dung bên trong các thư mục (nếu có)';
		// 	} else {
		// 		var sNodes = self.sNodeType(nodes[0]) + ' <b><em>' + nodes[0].name + '</em></b>' + ( nodes[0].type === 1 ? ' ' + 'và nội dung bên trong' : '' );
		// 	}
		// 	var sArchive = isAllArchived ? 'bỏ lưu trữ' : 'lưu trữ';
		// 	// node.updating = true;
		// 	var msgBtns = [{
		// 		result: true,
		// 		label: 'OK',
		// 		cssClass: 'btn-success'
		// 	},{
		// 		result: false,
		// 		label: 'Thôi',
		// 		cssClass: 'btn-default'
		// 	}];

		// 	function childrenArchive(node){
		// 		if(node.nodes){
		// 			for (var i = 0; i < node.nodes.length; i++) {
		// 				var n = node.nodes[i];
		// 				n.archived = !isAllArchived;
		// 				childrenArchive(n);
		// 			};
		// 		}
		// 	}

		// 	function finalCheck(){

		// 	}

		// 	dialog.messageBox('tl-icon-archive', 'Xác nhận', 'Bạn có chắc muốn' + ' ' + sArchive + ' ' + sNodes + '?', msgBtns, function() {
		// 		var errorCount = 0;
		// 		var successCount = 0;
		// 		for (var i = 0; i < nodes.length; i++) {
		// 			var node = nodes[i]
		// 			if(!isAllArchived && node.archived){
		// 				break;
		// 			}
		// 			var postData = [{
		// 				a: 'filemanager_storefile',
		// 				t: node.id,
		// 				s: isAllArchived ? 0 : 1
		// 				// i: "QDE1vw9cqA"
		// 			}];
		// 			node.updating = true;
		// 			$http.post(API_URL, postData)
		// 				.success(function(data, status, headers, config) {
		// 					if($rootScope.wrongResponse(data)){
		// 						self.doneUpdating(node);
		// 						// alertify.error('Không thể' + ' ' + sArchive + ' ' + sNodes + '!');
		// 						errorCount++;
		// 						finalCheck
		// 					} else {
		// 						node.archived = !isAllArchived;
		// 						childrenArchive(node);
		// 						self.doneUpdating(node);
		// 						// alertify.success('Đã' + ' ' + sArchive + ' ' + sNodes + '.');
		// 						successCount++;
		// 					}
		// 				})
		// 				.error(function(data, status, headers, config) {
		// 					if(status != 401){
		// 						self.doneUpdating(node);
		// 						// alertify.error('Không thể' + ' ' + sArchive + ' ' + sNodes + '!');
		// 						errorCount++;
		// 					}
		// 				});
		// 		};
		// 	}

		// },

		setPrivate: function(node){
			if(this.nodeActionPrevented()){
				return;
			}
			if(node){
				this.unCheckAllNodes();
				node.checked = true;
				this.nodeCheckToggle(node);
			}
			var self = this;
			var node = self.checkedNodes[0];
			var _private = node.private;
			var sNode = self.sNodeType(node) + ' <b><em>' + node.name + '</em></b>' + ( node.type === 1 ? ' ' + 'và nội dung bên trong' : '' );
			var sPrivate = _private ? 'bỏ riêng tư cho' : 'xác lập riêng tư cho';
			node.updating = true;
			var msgBtns = [{
				result: true,
				label: 'OK',
				cssClass: 'btn-success'
			},{
				result: false,
				label: 'Thôi',
				cssClass: 'btn-default'
			}];

			function childrenPrivate(node){
				if(node.nodes){
					for (var i = 0; i < node.nodes.length; i++) {
						var n = node.nodes[i];
						n.private = !_private;
						childrenPrivate(n);
					};
				}
			}

			dialog.messageBox('tl-icon-user', 'Xác nhận', 'Bạn có chắc muốn' + ' ' + sPrivate + ' ' + sNode + '?', msgBtns, function() {
				var postData = [{
					a: 'filemanager_privatefile',
					t: node.id,
					s: node.private ? 0 : 1
					// i: "QDE1vw9cqA"
				}];
				$http.post(API_URL, postData)
					.success(function(data, status, headers, config) {
						if($rootScope.wrongResponse(data)){
							self.doneUpdating(node);
							alertify.error('Không thể' + ' ' + sPrivate + ' ' + sNode + '!');
						} else {
							node.private = !_private;
							childrenPrivate(node);
							self.doneUpdating(node);
							alertify.success('Đã' + ' ' + sPrivate + ' ' + sNode + '.');
						}
					})
					.error(function(data, status, headers, config) {
						if(status != 401){
							self.doneUpdating(node);
							alertify.error('Không thể' + ' ' + sPrivate + ' ' + sNode + '!');
						}
					});
			}, function(){
				self.doneUpdating(node);
			});

		},

		doLock: function(node){
			if(this.nodeActionPrevented()){
				return;
			}
			if(node){
				this.unCheckAllNodes();
				node.checked = true;
				this.nodeCheckToggle(node);
			}
			var self = this;
			var node = self.checkedNodes[0];
			// node.updating = true;
			this.doLockModalInstance = $modal.open({
				templateUrl: 'template/do-lock-modal.html',
				controller: 'DoLockModalCtrl',
				// size: size,
				resolve: {
					node: function(){
						return node;
					}
				}
			});

			this.doLockModalInstance.result.then(function(result){
			// 	var postData = [{
			// 		a: 'filemanager_lockfile',
			// 		t: node.id,
			// 		s: node.lock ? 0 : 1
			// 		// i: "QDE1vw9cqA"
			// 	}];
			// 	$http.post(API_URL, postData)
			// 		.success(function(data, status, headers, config) {
			// 			if($rootScope.wrongResponse(data)){
			// 				self.doneUpdating(node);
			// 				alertify.error('Không thể' + ' ' + sLock + ' ' + sNode + '!');
			// 			} else {
			// 				node.lock = !_lock;
			// 				childrenLock(node);
			// 				self.doneUpdating(node);
			// 				alertify.success('Đã' + ' ' + sLock + ' ' + sNode + '.');
			// 			}
			// 		})
			// 		.error(function(data, status, headers, config) {
			// 			if(status != 401){
			// 				self.doneUpdating(node);
			// 				alertify.error('Không thể' + ' ' + sLock + ' ' + sNode + '!');
			// 			}
			// 		});
				self.doneUpdating(node);
			}, function(reason){
				self.doneUpdating(node);
			});

			// dialog.messageBox((node.lock ? 'tl-icon-unlock' : 'tl-icon-lock'), 'Xác nhận', 'Bạn có chắc muốn' + ' ' + sLock + ' ' + sNode + '?', msgBtns, function() {
			// 	var postData = [{
			// 		a: 'filemanager_lockfile',
			// 		t: node.id,
			// 		s: node.lock ? 0 : 1
			// 		// i: "QDE1vw9cqA"
			// 	}];
			// 	$http.post(API_URL, postData)
			// 		.success(function(data, status, headers, config) {
			// 			if($rootScope.wrongResponse(data)){
			// 				self.doneUpdating(node);
			// 				alertify.error('Không thể' + ' ' + sLock + ' ' + sNode + '!');
			// 			} else {
			// 				node.lock = !_lock;
			// 				childrenLock(node);
			// 				self.doneUpdating(node);
			// 				alertify.success('Đã' + ' ' + sLock + ' ' + sNode + '.');
			// 			}
			// 		})
			// 		.error(function(data, status, headers, config) {
			// 			if(status != 401){
			// 				self.doneUpdating(node);
			// 				alertify.error('Không thể' + ' ' + sLock + ' ' + sNode + '!');
			// 			}
			// 		});
			// }, function(){
			// 	self.doneUpdating(node);
			// });
		},

		goToDownload: function(node){

			
			//filesSrv.checkedNodes.length;
			var self = this;
				
			//console.log(self.checkedNodes);
		
			//If lenght > 0	
			window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

			var fnode=self.checkedNodes[0];

			if(self.checkedNodes.length==1
			 && fnode.fileType == "Folder"
			 )
			{

				self.downloadFolder(fnode);
			}
			else if(self.checkedNodes.length>0 && window.requestFileSystem)
			{
				self.downloadMultiFiles();
			}
			else{
				
				if(!node && self.checkedNodes.length){
					var node = self.checkedNodes[0];
				}

				if(node && node.type == 1){
					$location.url('/fm/folder/' + node.id + '/' + node.machineName);
				} else if(node && node.type === 0){
					this.slideShowingNode = null;
					$location.url('/download/' + node.id + '/' + node.machineName);
				}
			}
		},
		cancelDownload:function(){

			uiState.fm.fmDownloaderExpanded=false;
			this.queueDownload=[];
		},

		share: function(node){
			var closeFn, dismissFn;
			dialog.dialog({
				templateUrl: 'template/share-modal.html',
				controller: 'ShareModalCtrl',
				node: node
			}, closeFn, dismissFn);
		},

		nodesCount: function(arr, eachFn){
			var folderCount = 0;
			var fileCount = 0;

			for (var i = 0; i < arr.length; i++) {
				var _n = arr[i];
				if(_n.type == 1){
					folderCount++;
				} else if(_n.type===0){
					fileCount++;
				}
				eachFn && eachFn(_n);
			}

			// var sFiles = fileCount ? fileCount + ' ' + 'files' : '';
			// var sFolders = folderCount ? folderCount + ' ' + 'thư mục' : '';
			return {
				files: fileCount,
				folders: folderCount,
				sFiles: function(){ return  this.files ? this.files + ' ' + 'files' : '' },
				sFolders: function(){ return  this.folders ? this.folders + ' ' + 'thư mục' : '' },
				sFilesFolders: function(){
					var sFiles = this.sFiles();
					var sFolders = this.sFolders();
					return sFiles + (sFiles && sFolders ? ', ' : '') + sFolders
				}
			}
		},

		checkAllNodes: function(){
			for (var i = 0; i < this.currentNodesList.nodes.length; i++) {
				var currentNode = this.currentNodesList.nodes[i];
				if(!currentNode.updating){
					currentNode.checked = true;
					if(this.checkedNodes.indexOf(currentNode) < 0){
						this.checkedNodes.push(currentNode);
					}
				}
			};
		},

		unCheckAllNodes: function(){
			// if(this.currentFolder && this.currentNodesList.nodes){
			if(this.currentNodesList && this.currentNodesList.nodes){
				for (var i = 0; i < this.currentNodesList.nodes.length; i++) {
					if(!this.currentNodesList.nodes[i].updating){
						this.currentNodesList.nodes[i].checked = false;
					}
				};
			}
			this.checkedNodes.clear();
			this.allNodesChecked = false;
		},

		lastCheckedNode: null,

		nodeCheckToggle: function(node,$event){
			if(!node.updating && uiState.page.fmName != 'folder'){
				if(node.checked && this.checkedNodes.indexOf(node) == -1){
					uiState.fm.inSelectionMode = true;
					this.checkedNodes.push(node);
				} else if(!node.checked) {
					var index = this.checkedNodes.indexOf(node);
					this.checkedNodes.splice(index,1);
					if(!this.checkedNodes.length){
						uiState.fm.inSelectionMode = false;
					}
				}
				if(this.checkedNodes.length && this.checkedNodes.length == this.currentNodesList.nodes.length){
					this.allNodesChecked = true;
				} else {
					this.allNodesChecked = false;
				}
			}
		},

		allNodesCheckToggle: function($event){
			if(this.allNodesChecked){
				uiState.fm.inSelectionMode = true;
				this.checkAllNodes();
			} else {
				// for (var i = 0; i < filesSrv.currentFolder.nodes.length; i++) {
				// 	var currentItem = filesSrv.currentFolder.nodes[i];
				// 	currentItem.checked = false;
				// }
				this.checkedNodes.clear();
				this.allNodesChecked = false;
				uiState.fm.inSelectionMode = false;
			};
		},

		nodeListOrder : 'name',
		nodeListReverse: null,

		setNodeListOrder : function(order,toggle){
			this.nodeListOrder = order;
			if(toggle !== false){
				this.nodeListReverse = !this.nodeListReverse;
			}
		},

		nodeListHeaderClass : function(order){
			return {
				up: this.nodeListOrder==order && this.nodeListReverse===false,
				down: this.nodeListOrder==order && this.nodeListReverse===true
			};
		}

	}; // end var _filesSrv

	// $rootScope.$watch(function(){
	// 	if(_filesSrv.currentFolder){
	// 		return _filesSrv.currentFolder.nodes;
	// 	} else {
	// 		return [];
	// 	}
	// }, function(nodes){
	// 	if(nodes && nodes.length){
	// 		_filesSrv.currentFolderNodes = $filter('orderBy')(nodes, ['-type',_filesSrv.nodeListOrder], _filesSrv.nodeListReverse);
	// 	}
	// });


	$rootScope.$on('$routeUpdate', function(){
		_filesSrv.openNodeFromUrlSearch();
	});

	$rootScope.$on('$routeChangeSuccess', function(){
		_filesSrv.fmHasTree = false;
	});

	$rootScope.$watch('uiState.fm.inSelectionMode', function(newValue, oldValue){
		if(newValue === false){
			_filesSrv.unCheckAllNodes();
		}
	});

	return _filesSrv;

} );
