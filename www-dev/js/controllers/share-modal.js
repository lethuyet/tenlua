angular.module( 'TenLua' )
	.controller( 'ShareModalCtrl', function( $scope, $modal, $modalInstance, $filter, filesSrv, DOMAIN_URL ) {

		var locationOrigin = DOMAIN_URL;
		// var locationOrigin = location.origin;

		$scope.node = $modalInstance.values.node;
		$scope.shareLink = locationOrigin + ($scope.node.type === 0 ? '/download' : '/fm/folder') + '/' + $scope.node.id + '/' + $scope.node.machineName;
		var shareLinkEncoded = encodeURIComponent($scope.shareLink);
		var socialLink = locationOrigin + '/social-share/' + $scope.node.machineName + '-' + $scope.node.id;
		var socialLinkEncoded = encodeURIComponent(socialLink);
		var shareContent = $scope.node.name + ' - Download từ tenlua.vn - Dịch vu lưu trữ và chia sẻ dữ liệu tốc độ cao!';
		var shareContentShort = $scope.node.name + ' - Download từ tenlua.vn';

		$scope.facebookLink = 'https://www.facebook.com/sharer/sharer.php?u=' + socialLinkEncoded;
		$scope.twitterLink = 'https://twitter.com/intent/tweet?url=' + shareLinkEncoded + '&text=' + encodeURIComponent(shareContent) + '&original_referer=' + encodeURIComponent(locationOrigin);
		$scope.googleplusLink = 'https://plus.google.com/share?url=' + socialLinkEncoded;
		$scope.zingmeLink = 'http://link.apps.zing.vn/share?u=' + socialLinkEncoded;
		$scope.emailLink = 'mailto:?subject=' + shareContentShort + '&body=' + encodeURIComponent($scope.shareLink + '\n' + shareContent);


		$scope.fileCaption = $scope.node.type == 1 ? 'Loại: Thư mục' : 'Dung lượng: ' + $filter('byteFormat')($scope.node.size) + ' | Loại: ' + $scope.node.ext;
		$scope.fileShareFacebook = $scope.node.image ? {
			name: $scope.node.name,
			picture: $scope.node.image,
			caption: $scope.fileCaption,
			link: $scope.shareLink
			// description: $scope.productInfo.desc,
		} : {
			name: $scope.node.name,
			caption: $scope.fileCaption,
			link: $scope.shareLink
		};

		$scope.fileShareGooglePlus = {
			calltoactionlabel: $scope.node.name,
			calltoactionurl: $scope.shareLink,
			prefilltext: $scope.node.name + ' | ' + $scope.fileCaption
		};


		var _popUp = null;

		$scope.modalWin = function(url, target, $event) {
			$event.preventDefault();
			var n, r, i, s;
			if (typeof window.screenX == "number" && typeof window.innerWidth == "number") {
				n = window.innerWidth * .68;
				r = window.innerHeight * .68;
				i = window.screenX + window.innerWidth * .16;
				s = window.screenY + window.innerHeight * .16
			} else if (typeof window.screenTop == "number" && typeof document.documentElement.offsetHeight == "number") {
				n = document.documentElement.offsetWidth * .68;
				r = document.documentElement.offsetHeight * .68;
				i = window.screenLeft + document.documentElement.offsetWidth * .16;
				s = window.screenTop - 50
			} else {
				n = 500;
				r = 450;
				i = 60;
				s = 40
			} if (_popUp == null || _popUp.closed) {
				_popUp = window.open(url, target, "top=" + s + ",left=" + i + ",width=" + n + ",height=" + r + ",toolbar=no,directories=no,status=no,menubar=no,scrollbars,resizable,modal=yes")
			} else {
				if (_popUp.focus) {
					_popUp.focus()
				}
			}
		}

		$scope.cancel = function(){
			$modalInstance.dismiss();
		}

	} );


// angular.module('TenLua')
// .directive('textSelect', function() {
// 	return {
// 		link: function(scope, element, attrs) {
// 			element.focus(function(e){
// 				requestAnimationFrame(function() {
// 					setSelectionRange(element[0],0, element.val().length);
// 				});
// 			});

// 			attrs.$observe('textSelect', function(value){
// 				if(value){
// 					element.trigger('focus');
// 				}
// 			});

// 		}
// 	}
// })
