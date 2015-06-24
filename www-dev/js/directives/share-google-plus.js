'use strict';

angular.module( 'TenLua' )
	.directive('shareGooglePlus', function($rootScope, DOMAIN_URL) {
		return {
			restrict: 'A',
			scope: {shareGooglePlus: '='},
			link: function postLink(scope, element, attrs) {
				function render(){
					scope.$watch('shareGooglePlus', function(newValue){
						if(newValue){
							angular.extend(scope._obj, newValue);
							if(typeof gapi != 'undefined'){
								gapi.interactivepost.render(element[0], scope._obj);
							}
						}
					});
				}

				if(typeof gapi !== 'undefined'){
					$rootScope.gapiLoaded = true;
					render();
				} else {
					$.ajax({
						dataType: "script",
						cache: true,
						url: 'https://apis.google.com/js/client:plusone.js'
					}).done(function(){
						$rootScope.gapiLoaded = true;
						render();
						$rootScope.$apply();
					});
				}

				scope._obj = {
					contenturl: DOMAIN_URL,
					contentdeeplinkid: '',
					clientid: '355142005808-3khq0nul1ne6loa5f14p4nbtkofl7ck7.apps.googleusercontent.com',
					cookiepolicy: DOMAIN_URL,
					prefilltext: '',
					calltoactionlabel: document.title,
					calltoactionurl: '',
					calltoactiondeeplinkid: ''
				};

				// scope.$watch(function(){return nav.commonInfo.pageTitle}, function(newValue){
				// 	if(newValue){
				// 		scope._obj.calltoactionlabel = nav.commonInfo.pageTitle;
				// 		scope._obj.calltoactionurl = location.href;
				// 		scope._obj.prefilltext = nav.commonInfo.intro;
				// 		if(typeof gapi != 'undefined'){
				// 			gapi.interactivepost.render(element[0], scope._obj);
				// 		}
				// 	}
				// });

				// scope.$watch('shareGooglePlus', function(newValue){
				// 	if(newValue){
				// 		angular.extend(scope._obj, newValue);
				// 		if(typeof gapi != 'undefined'){
				// 			gapi.interactivepost.render(element[0], scope._obj);
				// 		}
				// 	}
				// });

			}
		};
	});
