'use strict';

angular.module( 'TenLua' )
	.directive('zeroclipboardButton', function($rootScope) {
		return {
			restrict: 'A',
			link: function postLink(scope, element, attrs) {

				$rootScope.zeroclipboardButtonReady = false;
				function initZeroClipboardButton(){
					var clipBoardClient = new ZeroClipboard(element[0]);
					clipBoardClient.on("ready", function(readyEvent) {
						// alert( "ZeroClipboard SWF is ready!" );
						$rootScope.zeroclipboardButtonReady = true;
						$rootScope.$apply();

						clipBoardClient.on("aftercopy", function(event) {
							// `this` === `clipBoardClient`
							// `event.target` === the element that was clicked
							// event.target.style.display = "none";
							element.text('Đã copy!').prop('disabled', true).removeClass('btn-warning').addClass('btn-success');
							// alert("Copied text to clipboard: " + event.data["text/plain"]);
						});
					});
					clipBoardClient.on("error", function(e) {
						$rootScope.zeroclipboardButtonReady = false;
						$rootScope.$apply();
					});
				}

				if(typeof ZeroClipboard !== 'undefined'){
					initZeroClipboardButton();
				} else {
					$.ajax({
						dataType: "script",
						cache: true,
						url: '/js/conditional-resource/ZeroClipboard.min.js'
					}).done(function(){
						ZeroClipboard.config( { swfPath: "/js/conditional-resource/ZeroClipboard.swf", cacheBust: false } );
						initZeroClipboardButton();
					});
				}

			}
		};
	});
