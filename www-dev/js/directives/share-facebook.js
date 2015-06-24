'use strict';

angular.module( 'TenLua' )
	.directive('shareFacebook', function($rootScope, DOMAIN_URL) {
		return {
			restrict: 'A',
			scope: {shareFacebook: '='},
			link: function postLink(scope, element, attrs) {
				if(typeof FB !== 'undefined'){
					$rootScope.FBLoaded = true;
				} else {
					$.ajax({
						dataType: "script",
						cache: true,
						url: '//connect.facebook.net/vi_VN/all.js'
					}).done(function(){
						FB.init({
							appId: '339009666278354',
							status: true,
							cookie: true,
							xfbml: true
						});
						$rootScope.FBLoaded = true;
						$rootScope.$apply();
					});
				}

				scope._obj = {
					method: 'feed',
					name: document.title,
					link: '',
					picture: DOMAIN_URL + '/img/logo.png',
					caption: '',
					description: $('meta[name=description]').attr('content'),
					message: ''
				}

				// scope.$watch(function(){return nav.commonInfo.pageTitle}, function(newValue){
				// 	if(newValue){
				// 		// scope._obj.name = nav.commonInfo.pageTitle;
				// 		scope._obj.name = document.title;
				// 		scope._obj.description = nav.commonInfo.intro;
				// 	}
				// });

				scope.$watch('shareFacebook', function(newValue){
					if(newValue){
						angular.extend(scope._obj, newValue);
					}
				});

				element.click(function(){
					// scope._obj.link = location.href;
					FB.ui(scope._obj);
				});
			}
		};
	});
