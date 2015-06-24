'use strict';

angular.module('TenLua')
.directive('user', function (byteFormatFilter, authSrv, uploadSrv, dialog, $modal, $localStorage, uiState) {
	return {
		restrict: 'E',
		templateUrl: 'template/user.html',
		replace: true,
		scope: {},
		link: function postLink(scope, element, attrs) {

			scope.localStorage = $localStorage;
			scope.uiState = uiState;
			scope.authSrv = authSrv;
			scope.storageType = attrs.storageType;
			scope.hasAvatar = typeof attrs.hasAvatar == 'undefined' || attrs.hasAvatar == 'true';
			scope.title = function(){
				return attrs.title ? attrs.title : (authSrv.isAuthenticated() ? $localStorage.AUTH_currentUser.email : 'Đăng nhập');
			};

			// attrs.$observe('hasDropdown', function(){
				scope.hasDropdown = attrs.hasDropdown == 'true' ? true : false;
			// });

			scope.login = function(){
				if(!scope.localStorage.AUTH_currentUser){
					scope.authSrv.openLoginModal();
				}
			}
			scope.logout = function(){
				if(uploadSrv.uploadingFiles.length){
					var msgTitle = 'Bạn có chắc muốn đăng xuất khi đang upload?<br>Nếu đăng xuất, tiến trình upload sẽ bị ngưng lại.';
					var msgBtns = [{
						result: true,
						label: 'OK',
						cssClass: 'btn-success'
					},{
						result: false,
						label: 'Thôi',
						cssClass: 'btn-default'
					}];
					dialog.messageBox('tl-icon-warning', 'Chú ý', msgTitle, msgBtns, function() {
						authSrv.logout();
					});
				} else {
					authSrv.logout();
				}

			}

			scope.openUserInfo = function(){
				scope.userInfoModalInstance = $modal.open({
					templateUrl: 'template/user-info-modal.html',
					controller: 'UserInfoModalCtrl',
					resolve: {
					}
				});

				scope.userInfoModalInstance.result.then(function(result){}, function(){});
			};

			scope.storeUsed = function(){
				if(!scope.localStorage.AUTH_currentUser){
					return;
				}
				if(!scope.storageType){
					return scope.localStorage.AUTH_currentUser.storeUsed + scope.localStorage.AUTH_currentUser.freeUsed;
				} else if(scope.storageType == 'permanent'){
					return scope.localStorage.AUTH_currentUser.storeUsed;
				} else if(scope.storageType == 'normal'){
					return scope.localStorage.AUTH_currentUser.freeUsed;
				}
			}
			scope.store = function(){
				if(!scope.localStorage.AUTH_currentUser){
					return;
				}
				if(!scope.storageType){
					return scope.localStorage.AUTH_currentUser.store + scope.localStorage.AUTH_currentUser.free;
				} else if(scope.storageType == 'permanent'){
					return scope.localStorage.AUTH_currentUser.store;
				} else if(scope.storageType == 'normal'){
					return scope.localStorage.AUTH_currentUser.free;
				}
			}
			scope.storeStr = function(){
				return byteFormatFilter(scope.storeUsed()) + ' / ' + byteFormatFilter(scope.store());
			}
			scope.storeRemainStr = function(){
				return byteFormatFilter(scope.store() - scope.storeUsed());
			}
			scope.storeUsedPercent = function(){
				return Math.round(scope.storeUsed() * 100 / scope.store());
			}

		} // end link: function postLink
	};
});
