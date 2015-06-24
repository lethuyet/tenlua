'use strict';

angular.module('TenLua')
	.factory('uiState', function($rootScope, $timeout, $location, BRAND) {
		var title = '';
		var _uiState = {
			// loading: false,
			// // fastLoading: false,
			// numLoadings: 0,

			// history: {
			// 	hasHistory: false,
			// 	back: function() {
			// 		if (this.hasHistory) {
			// 			history.back();
			// 		}
			// 	}
			// },

			page: {
				// isFm: false,
				// isDownload: false,
				name: null,
				setPageName: function() {
					_uiState.page.name = $location.path().split('/')[1];
					if (_uiState.page.name == 'fm') {
						_uiState.page.fmName = $location.path().split('/')[2];
					} else {
						_uiState.page.fmName = null;
					};
				},
				// setPageName: function(){
				// 	if($location.path().indexOf('/fm') === 0){
				// 		_uiState.page.isFm = true;
				// 		_uiState.page.name = $location.path().split('/')[2];
				// 		_uiState.page.isDownload = false;
				// 	} else if($location.path().indexOf('/download') === 0){
				// 		_uiState.page.isDownload = true;
				// 		_uiState.page.isFm = false;
				// 		_uiState.page.name = null;
				// 	} else {
				// 		_uiState.page.isFm = false;
				// 		_uiState.page.name = null;
				// 		_uiState.page.isDownload = false;
				// 	};
				// }
				title: function() {
					return title ? title + ' - ' + BRAND : BRAND;
				},
				setTitle: function(newTitle) {
					title = newTitle;
				}
			},

			fm: {
				listMode: 'details',
				listTouchSelection: false
			},

			goFullscreen: function() {
				// _uiState.fullscreen = true;
				if (screenfull.enabled) {
					screenfull.request();
				}
			},

			exitFullscreen: function() {
				// _uiState.fullscreen = false;
				if (screenfull.enabled) {
					screenfull.exit();
				}
			}
		};

		if (screenfull.enabled) {
			document.addEventListener(screenfull.raw.fullscreenchange, function() {
				// console.log('Am I fullscreen? ' + (screenfull.isFullscreen ? 'Yes' : 'No'));
				_uiState.fullscreen = screenfull.isFullscreen;
			});
			$(document).on('keydown', function(e) {
				if (e.keyCode == 122) {
					e.preventDefault();
					screenfull.toggle();
					return false;
				}
			});
		}


		$rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
			// _uiState.history.hasHistory = !!history.length;
			// $timeout(function(){
			// 	_uiState.fastLoading = false;
			// },0);

			_uiState.appFooterShown = false;
			_uiState.page.setPageName();

			setTimeout(function() {
				window.scrollTo(0, 1);
			}, 0);

		});

		// $rootScope.$on('$routeChangeSuccess', function(){
		// 	window.scrollTo(0,0);
		// });

		// $rootScope.$on('$routeUpdate', function(){
		// 	window.scrollTo(0,0);
		// });

		return _uiState;

	});
