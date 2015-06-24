'use strict';

angular.module('TenLua')
.factory('searchSrv', function($rootScope, $http, $route, $routeParams, $location, filterFilter, filesSrv, uiState, authSrv, API_URL) {

	var service = {
		keyword: '',
		activeOption: null,
		paging: {
			total: null,
			pageSize: 0
		},
		currentPage: {
			page: null,
			nodes: []
		},
		options: [
			{
				name: 'all',
				text: 'tenlua.vn',
			},
			{
				name: 'current',
				text: 'Thư mục gốc'
			}
		],

		selectOption: function(option){
			this.activeOption = option;
			this.optionsOpen = false;
			if(option.name == 'all' && this.keyword){
				this.searchSubmit();
			}
		},

		setOption: function(name){
			if(name == 'all'){
				this.activeOption = this.options[0];
			} else if(name == 'current'){
				this.activeOption = this.options[1];
				this.keyword = '';
				this.paging.total = null;
				this.paging.pageSize = 20;
				this.currentPage.page = 0;
				this.currentPage.nodes.clear();
			}
		},

		hasOptions: function(){
			// if(uiState.page.fmName == 'folder' || uiState.page.fmName == 'files'){
			if(filesSrv.fmHasTree){
				return true;
			}
			this.setOption('all');
			return false;
		},

		isSearching: function(){
			return uiState.page.fmName == 'search' || this.isSearchingCurrent();
		},

		isSearchingCurrent: function(){
			return this.keyword && this.activeOption.name == 'current';
		},

		searchSubmit: function($event){
			$event && $event.preventDefault();
			if(!this.keyword || this.activeOption.name == 'current'){
				return;
			}

			// $location.url('/fm/search?searchKeyword=' + this.keyword + '&searchPage=1');
			$location.url('/fm/search/' + this.keyword + '/' + 1);
			// if(this.activeOption.name == 'all'){
			// 	$location.url('/fm/search?searchKeyword=' + this.keyword + '&searchPage=1');
			// } else {
			// 	$location.search({searchKeyword: this.keyword, searchPage: 1});
			// }
		},

		getSearchResult: function(){
			var self = this;
			this.searchResultsReturned = false;
			// this.keyword = $location.search().searchKeyword;
			// this.currentPage.page = parseInt($location.search().searchPage);
			// if(typeof this.keyword == 'undefined'){
			// 	return;
			// }
			this.keyword = $routeParams.keyword;
			this.currentPage.page = parseInt($routeParams.page);
			this.currentPage.page = isNaN(this.currentPage.page) ? 1 : this.currentPage.page;

			var postData = {
				keyword: this.keyword,
				page: this.currentPage.page,
				r: Math.random()
			};

			var postConfig = { noAuthHeader: true };

		// 	// $http.post(API_URL + '/search?' + $.param( postData ), null, postConfig)
		// 	$http.post('http://api.tenlua.vn' + '/search?' + $.param( postData ), null, postConfig)
		// 	// $http.get('/js/test-search.json', null, postConfig)
		// 		.success(function(data, status, headers, config) {
		// 			// self.paging = data.pagging;
		// 			self.paging.total = parseInt(data.pagging.total);
		// 			self.paging.pageSize = parseInt(data.pagging.itemperpage);
		// 			// self.currentPage.nodes = data.items;
		// 			self.currentPage.nodes.length = 0;
		// 			for (var i = 0; i < data.items.length; i++) {
		// 				var node = data.items[i];
		// 				// node.nodeType = 0;
		// 				// filesSrv.mapNodeProp(node, self.nodeMap);
		// 				if(node){
		// 					self.currentPage.nodes.push(node);
		// 					filesSrv.mapNodeProp(node);
		// 				}
		// 			};
		// 		})
		// 		.error(function(data, status, headers, config) {
		// 			alertify.error('Có lỗi xảy ra. Xin thử lại sau.');
		// 		});
		// }


			$http.post(API_URL + '/search?' + $.param( postData ), null, postConfig)
			// $http.post('http://api.tenlua.vn' + '/search?' + $.param( postData ), null, postConfig)
			// $http.get('/js/test-search.json', null, postConfig)
				.success(function(data, status, headers, config) {
					self.searchResultsReturned = true;
					if(uiState.page.fmName != 'search'){
						return;
					}
					filesSrv.fs = [{
						id: 'search-root',
						name: 'search-root',
						type: 2,
						nodes: [],
						slideShowingNodes: []
					}];
					filesSrv.fsRootNode = filesSrv.fs[0];
					filesSrv.fsLookup[filesSrv.fsRootNode.id] = filesSrv.fsRootNode;
					// self.paging = data.pagging;
					self.paging.total = parseInt(data.pagging.total);
					self.paging.pageSize = parseInt(data.pagging.itemperpage);
					// self.currentPage.nodes = data.items;
					// self.currentPage.nodes.length = 0;
					for (var i = 0; i < data.items.length; i++) {
						var node = data.items[i];
						// node.nodeType = 0;
						// filesSrv.mapNodeProp(node, self.nodeMap);
						if(node){
							node.p = 'search-root';
							filesSrv.fsRootNode.nodes.push(node);
							filesSrv.mapNodeProp(node);
							filesSrv.fsLookup[node.id] = node;
						}
					};
					filesSrv.openNodeFromUrlSearch('firstTime');
				})
				.error(function(data, status, headers, config) {
					self.searchResultsReturned = true;
					if(uiState.page.fmName != 'search'){
						return;
					}
					alertify.error('Không thể tìm kiếm. Xin thử lại sau.');
				});
		}

	};


	service.setOption('all');



	// $rootScope.$on('$routeUpdate', function(){
	// 	service.getResultFromUrlSearch();
	// });

	$rootScope.$on('$routeChangeSuccess', function(){
		service.hasOptions();
	});

	$rootScope.$watch('searchSrv.currentPage.page', function(newValue, oldValue){
		if(newValue && uiState.page.fmName == 'search'){
			$location.url('/fm/search/' + $routeParams.keyword + '/' + newValue);
		}
	});

	$rootScope.$watch('searchSrv.keyword', function(newValue, oldValue){
		if(service.isSearchingCurrent()){
			// var locSearch = $location.search();
			// locSearch.search = 1;
			// $location.search(locSearch);
			// filesSrv.currentNodesList = service.searchResults;
			service.currentPage.page = 1;
			filesSrv.updateCurrentNodesList(filterFilter(filesSrv.flatFs, {name: service.keyword}));
			uiState.fm.inSelectionMode = false;
		}
		else if (!newValue && service.activeOption.name == 'current'){
			// var locSearch = $location.search();
			// delete locSearch.search;
			// $location.search(locSearch);
			if($routeParams.libName){
				filesSrv.updateCurrentNodesList(filesSrv[$routeParams.libName].nodes);
			} else if(filesSrv.currentFolder){
				filesSrv.currentNodesList.nodes = filesSrv.currentFolder.nodes;
				filesSrv.currentNodesList.slideShowingNodes = filesSrv.currentFolder.slideShowingNodes;
			}
		}
	});


	return service;
});
